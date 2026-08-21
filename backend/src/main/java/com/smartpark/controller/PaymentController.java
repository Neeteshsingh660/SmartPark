package com.smartpark.controller;

import com.smartpark.dto.ApiResponse;
import com.smartpark.dto.payment.PaymentRequest;
import com.smartpark.dto.payment.PaymentResponse;
import com.smartpark.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

import com.smartpark.dto.payment.RazorpayOrderRequest;
import com.smartpark.dto.payment.RazorpayOrderResponse;
import com.smartpark.dto.payment.RazorpayVerifyRequest;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('DRIVER', 'OWNER', 'ADMIN')")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/razorpay/create-order")
    public ResponseEntity<ApiResponse<RazorpayOrderResponse>> createRazorpayOrder(
            @Valid @RequestBody RazorpayOrderRequest request,
            Principal principal) {
        try {
            RazorpayOrderResponse response = paymentService.createRazorpayOrder(request, principal.getName());
            return ResponseEntity.ok(ApiResponse.<RazorpayOrderResponse>builder()
                    .success(true)
                    .message(response.isFullyPaidByWallet() ? "Paid via SmartPark Wallet" : "Razorpay Order created")
                    .data(response)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<RazorpayOrderResponse>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @PostMapping("/razorpay/verify")
    public ResponseEntity<ApiResponse<PaymentResponse>> verifyRazorpayPayment(
            @Valid @RequestBody RazorpayVerifyRequest request,
            Principal principal) {
        try {
            PaymentResponse response = paymentService.verifyAndProcessRazorpayPayment(request, principal.getName());
            return ResponseEntity.ok(ApiResponse.<PaymentResponse>builder()
                    .success(true)
                    .message("Payment verified & booking confirmed!")
                    .data(response)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<PaymentResponse>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(
            @Valid @RequestBody PaymentRequest request,
            Principal principal) {

        try {
            PaymentResponse response = paymentService.processPayment(request, principal.getName());
            return ResponseEntity.ok(ApiResponse.<PaymentResponse>builder()
                    .success(true)
                    .message("Payment processed successfully")
                    .data(response)
                    .build());
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(ApiResponse.<PaymentResponse>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }
}