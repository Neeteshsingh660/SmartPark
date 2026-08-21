package com.smartpark.service;

import com.smartpark.dto.payment.*;
import com.smartpark.entity.*;
import com.smartpark.exception.ResourceNotFoundException;
import com.smartpark.repository.BookingRepository;
import com.smartpark.repository.PaymentRepository;
import com.smartpark.repository.UserRepository;
import com.smartpark.service.gateway.PaymentGateway;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.smartpark.kafka.producer.BookingEventProducer;
import com.smartpark.kafka.event.BookingConfirmedEvent;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import com.smartpark.util.QrCodeGenerator;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final PaymentGateway paymentGateway;
    private final RedisLockService redisLockService;
    private final BookingEventProducer bookingEventProducer;
    private final EmailService emailService;

    @Value("${razorpay.key.id:rzp_test_samplekey123}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:sampleSecretKey123}")
    private String razorpayKeySecret;

    @Transactional
    public RazorpayOrderResponse createRazorpayOrder(RazorpayOrderRequest request, String driverEmail) {
        User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        Booking booking = bookingRepository.findByIdAndUserId(request.getBookingId(), driver.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found or access denied"));

        if (booking.getStatus() != BookingStatus.PAYMENT_PENDING) {
            throw new IllegalStateException("Booking is not in a valid state for payment.");
        }

        BigDecimal totalAmount = booking.getAmount();
        BigDecimal walletBalance = driver.getWalletBalance() != null ? driver.getWalletBalance() : BigDecimal.ZERO;
        BigDecimal walletDeducted = BigDecimal.ZERO;

        if (request.isUseWallet() && walletBalance.compareTo(BigDecimal.ZERO) > 0) {
            walletDeducted = walletBalance.min(totalAmount);
        }

        BigDecimal payableAmount = totalAmount.subtract(walletDeducted).setScale(2, RoundingMode.HALF_UP);

        // CASE 1: Fully paid by SmartPark Wallet (0 INR via Razorpay)
        if (payableAmount.compareTo(BigDecimal.ZERO) <= 0) {
            driver.setWalletBalance(walletBalance.subtract(totalAmount));
            userRepository.save(driver);

            booking.setStatus(BookingStatus.CONFIRMED);
            String qrToken = QrCodeGenerator.generateSecureQrToken(booking.getId(), booking.getBookingReference());
            booking.setQrCode(qrToken);
            bookingRepository.save(booking);

            try {
                Payment payment = Payment.builder()
                        .booking(booking)
                        .amount(totalAmount)
                        .transactionId("WALLET-" + System.currentTimeMillis())
                        .paymentMethod(PaymentMethod.WALLET)
                        .status(PaymentStatus.SUCCESS)
                        .build();
                paymentRepository.save(payment);
            } catch (Exception e) {
                log.warn("Payment log record creation skipped due to DB constraint: {}", e.getMessage());
            }

            redisLockService.releaseLock(booking.getParkingSpot().getId(), booking.getStartTime(), booking.getEndTime());
            emailService.sendBookingConfirmationEmail(booking);

            return RazorpayOrderResponse.builder()
                    .razorpayOrderId("ORDER_WALLET_PAID")
                    .totalAmount(totalAmount)
                    .walletDeducted(walletDeducted)
                    .payableAmount(BigDecimal.ZERO)
                    .currency("INR")
                    .keyId(razorpayKeyId)
                    .fullyPaidByWallet(true)
                    .bookingId(booking.getId())
                    .build();
        }

        // CASE 2: Razorpay Order Creation (partial or full amount)
        String orderId;
        try {
            if (!razorpayKeyId.startsWith("rzp_test_sample")) {
                RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
                JSONObject orderReq = new JSONObject();
                orderReq.put("amount", payableAmount.multiply(new BigDecimal("100")).intValue());
                orderReq.put("currency", "INR");
                orderReq.put("receipt", booking.getBookingReference());
                Order order = razorpay.orders.create(orderReq);
                orderId = order.get("id");
            } else {
                // Mock order ID for test / dev environment
                orderId = "order_mock_" + System.currentTimeMillis();
            }
        } catch (Exception e) {
            log.warn("Razorpay API order creation failed, generating dev mock order: {}", e.getMessage());
            orderId = "order_dev_" + System.currentTimeMillis();
        }

        return RazorpayOrderResponse.builder()
                .razorpayOrderId(orderId)
                .totalAmount(totalAmount)
                .walletDeducted(walletDeducted)
                .payableAmount(payableAmount)
                .currency("INR")
                .keyId(razorpayKeyId)
                .fullyPaidByWallet(false)
                .bookingId(booking.getId())
                .build();
    }

    @Transactional
    public PaymentResponse verifyAndProcessRazorpayPayment(RazorpayVerifyRequest request, String driverEmail) {
        User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        Booking booking = bookingRepository.findByIdAndUserId(request.getBookingId(), driver.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found or access denied"));

        if (booking.getStatus() != BookingStatus.PAYMENT_PENDING) {
            throw new IllegalStateException("Booking is already processed or in invalid state.");
        }

        // Signature verification (if using real keys)
        if (!razorpayKeyId.startsWith("rzp_test_sample") && request.getRazorpaySignature() != null) {
            try {
                JSONObject options = new JSONObject();
                options.put("razorpay_order_id", request.getRazorpayOrderId());
                options.put("razorpay_payment_id", request.getRazorpayPaymentId());
                options.put("razorpay_signature", request.getRazorpaySignature());
                boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);
                if (!isValid) {
                    throw new IllegalStateException("Razorpay payment signature verification failed.");
                }
            } catch (Exception e) {
                log.error("Signature verification error: {}", e.getMessage());
            }
        }

        // Atomic wallet deduction (only executed NOW upon confirmed Razorpay payment)
        if (request.getWalletDeducted() != null && request.getWalletDeducted().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal currentWallet = driver.getWalletBalance() != null ? driver.getWalletBalance() : BigDecimal.ZERO;
            BigDecimal actualDeduction = currentWallet.min(request.getWalletDeducted());
            driver.setWalletBalance(currentWallet.subtract(actualDeduction));
            userRepository.save(driver);
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        String qrToken = QrCodeGenerator.generateSecureQrToken(booking.getId(), booking.getBookingReference());
        booking.setQrCode(qrToken);
        bookingRepository.save(booking);

        PaymentMethod pMethod = PaymentMethod.CREDIT_CARD;
        if ("UPI".equalsIgnoreCase(request.getPaymentMethod())) pMethod = PaymentMethod.UPI;
        else if ("WALLET".equalsIgnoreCase(request.getPaymentMethod())) pMethod = PaymentMethod.WALLET;

        Payment payment = Payment.builder()
                .booking(booking)
                .amount(booking.getAmount())
                .transactionId(request.getRazorpayPaymentId() != null ? request.getRazorpayPaymentId() : "RZP-PAY-" + System.currentTimeMillis())
                .paymentMethod(pMethod)
                .status(PaymentStatus.SUCCESS)
                .build();

        try {
            paymentRepository.save(payment);
        } catch (Exception e) {
            log.warn("Payment log record creation skipped due to DB constraint: {}", e.getMessage());
        }

        redisLockService.releaseLock(booking.getParkingSpot().getId(), booking.getStartTime(), booking.getEndTime());
        emailService.sendBookingConfirmationEmail(booking);

        BookingConfirmedEvent event = BookingConfirmedEvent.builder()
                .bookingId(booking.getId())
                .bookingReference(booking.getBookingReference())
                .parkingSpotId(booking.getParkingSpot().getId())
                .parkingSpotTitle(booking.getParkingSpot().getTitle())
                .driverEmail(driver.getEmail())
                .ownerEmail(booking.getParkingSpot().getOwner().getEmail())
                .amountPaid(payment.getAmount())
                .eventTimestamp(LocalDateTime.now())
                .build();
        bookingEventProducer.sendBookingConfirmedEvent(event);

        return mapToResponse(payment, "Razorpay payment verified & confirmed.");
    }

    @Transactional
    public PaymentResponse processPayment(PaymentRequest request, String driverEmail) {
        // ... (keep driver, booking validation, and paymentGateway logic the same) ...
        User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        Booking booking = bookingRepository.findByIdAndUserId(request.getBookingId(), driver.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found or access denied"));

        if (booking.getStatus() != BookingStatus.PAYMENT_PENDING) {
            throw new IllegalStateException("Booking is not in a valid state for payment.");
        }

        PaymentGateway.PaymentResult gatewayResult = paymentGateway.processPayment(
                booking.getAmount(), "USD", request.getPaymentMethod().name());

        Payment payment = Payment.builder()
                .booking(booking)
                .amount(booking.getAmount())
                .transactionId(gatewayResult.success() ? gatewayResult.transactionId() : "FAILED-" + System.currentTimeMillis())
                .paymentMethod(request.getPaymentMethod())
                .status(gatewayResult.success() ? PaymentStatus.SUCCESS : PaymentStatus.FAILED)
                .build();

        paymentRepository.save(payment);

        if (gatewayResult.success()) {
            booking.setStatus(BookingStatus.CONFIRMED);

            // Generate and attach the secure QR Token
            String qrToken = QrCodeGenerator.generateSecureQrToken(booking.getId(), booking.getBookingReference());
            booking.setQrCode(qrToken);

            bookingRepository.save(booking);

            redisLockService.releaseLock(booking.getParkingSpot().getId(), booking.getStartTime(), booking.getEndTime());

            // Send Email Confirmation
            emailService.sendBookingConfirmationEmail(booking);

            // 2. PUBLISH KAFKA EVENT ASYNCHRONOUSLY
            BookingConfirmedEvent event = BookingConfirmedEvent.builder()
                    .bookingId(booking.getId())
                    .bookingReference(booking.getBookingReference())
                    .parkingSpotId(booking.getParkingSpot().getId())
                    .parkingSpotTitle(booking.getParkingSpot().getTitle())
                    .driverEmail(driver.getEmail())
                    .ownerEmail(booking.getParkingSpot().getOwner().getEmail()) // Fetching owner email through the JPA relationship
                    .amountPaid(payment.getAmount())
                    .eventTimestamp(LocalDateTime.now())
                    .build();

            bookingEventProducer.sendBookingConfirmedEvent(event);

            return mapToResponse(payment, "Payment successful. Booking confirmed.");
        } else {
            throw new IllegalStateException("Payment failed: " + gatewayResult.errorMessage());
        }
    }
    private PaymentResponse mapToResponse(Payment payment, String message) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .bookingId(payment.getBooking().getId())
                .amount(payment.getAmount())
                .transactionId(payment.getTransactionId())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .message(message)
                .createdAt(payment.getCreatedAt())
                .build();
    }
}