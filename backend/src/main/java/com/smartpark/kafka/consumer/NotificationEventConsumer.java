package com.smartpark.kafka.consumer;

import com.smartpark.config.KafkaConfig;
import com.smartpark.kafka.event.BookingConfirmedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationEventConsumer {

    // Inject the WebSocket messaging template
    private final SimpMessagingTemplate messagingTemplate;

    @KafkaListener(topics = KafkaConfig.BOOKING_EVENTS_TOPIC, groupId = "smartpark-notification-group")
    public void consumeBookingConfirmed(BookingConfirmedEvent event) {
        log.info("============== KAFKA EVENT RECEIVED ==============");
        log.info("Processing asynchronous notifications...");

        // 1. Log the actions
        log.info("Sending Email to Driver [{}]: 'Your booking {} is confirmed!'", event.getDriverEmail(), event.getBookingReference());
        log.info("Sending Push Notification to Owner [{}]: 'You have a new booking earning ${}'", event.getOwnerEmail(), event.getAmountPaid());

        // 2. Push Real-Time WebSocket Notification to the Driver
        String driverTopic = "/topic/driver/" + event.getDriverEmail();
        messagingTemplate.convertAndSend(driverTopic, Map.of(
                "type", "BOOKING_SUCCESS",
                "message", "Your parking booking " + event.getBookingReference() + " has been confirmed!",
                "amount", event.getAmountPaid()
        ));

        // 3. Push Real-Time WebSocket Notification to the Owner
        String ownerTopic = "/topic/owner/" + event.getOwnerEmail();
        messagingTemplate.convertAndSend(ownerTopic, Map.of(
                "type", "NEW_BOOKING",
                "message", "Great news! You received a new booking for " + event.getParkingSpotTitle(),
                "amount", event.getAmountPaid()
        ));

        log.info("WebSocket notifications pushed to driver and owner channels.");
        log.info("==================================================");
    }
}