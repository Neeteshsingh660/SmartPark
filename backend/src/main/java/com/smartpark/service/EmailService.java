package com.smartpark.service;

import com.smartpark.entity.Booking;
import com.smartpark.entity.User;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@smartpark.com}")
    private String fromEmail;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    @Async
    public void sendBookingConfirmationEmail(Booking booking) {
        try {
            User driver = booking.getUser();
            if (driver == null || driver.getEmail() == null) return;

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(driver.getEmail());
            helper.setSubject("🅿️ Booking Confirmed - " + booking.getParkingSpot().getTitle());

            String formattedStart = booking.getStartTime() != null ? booking.getStartTime().format(DATE_FORMATTER) : "N/A";
            String formattedEnd = booking.getEndTime() != null ? booking.getEndTime().format(DATE_FORMATTER) : "N/A";

            String htmlContent = "<html><body style='font-family: Arial, sans-serif; color: #1e293b; background-color: #f8fafc; padding: 20px;'>" +
                    "<div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);'>" +
                    "<h2 style='color: #0d9488; margin-top: 0;'>Parking Reservation Confirmed! 🎉</h2>" +
                    "<p>Hello <strong>" + (driver.getName() != null ? driver.getName() : "Driver") + "</strong>,</p>" +
                    "<p>Your parking spot has been reserved successfully. Here are your booking details:</p>" +
                    "<div style='background: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 8px; padding: 16px; margin: 20px 0;'>" +
                    "<p style='margin: 4px 0;'><strong>Reference ID:</strong> <span style='color: #0d9488;'>" + (booking.getBookingReference() != null ? booking.getBookingReference() : "#BK-" + booking.getId()) + "</span></p>" +
                    "<p style='margin: 4px 0;'><strong>Location:</strong> " + booking.getParkingSpot().getTitle() + "</p>" +
                    "<p style='margin: 4px 0;'><strong>Address:</strong> " + booking.getParkingSpot().getAddress() + ", " + booking.getParkingSpot().getCity() + "</p>" +
                    "<p style='margin: 4px 0;'><strong>Start Time:</strong> " + formattedStart + "</p>" +
                    "<p style='margin: 4px 0;'><strong>End Time:</strong> " + formattedEnd + "</p>" +
                    "<p style='margin: 4px 0;'><strong>Vehicle:</strong> " + (booking.getVehicleNumber() != null ? booking.getVehicleNumber() : "N/A") + "</p>" +
                    "<p style='margin: 4px 0;'><strong>Total Paid:</strong> ₹" + booking.getAmount() + "</p>" +
                    "</div>" +
                    "<p style='font-size: 0.9em; color: #64748b;'>Show your QR code ticket upon arrival at the parking location.</p>" +
                    "<hr style='border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;' />" +
                    "<p style='font-size: 0.8em; color: #94a3b8; text-align: center;'>SmartPark Marketplace &bull; Seamless Urban Parking</p>" +
                    "</div></body></html>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Booking confirmation email sent to {}", driver.getEmail());
        } catch (Exception e) {
            log.warn("Failed to send booking confirmation email: {}", e.getMessage());
        }
    }
}
