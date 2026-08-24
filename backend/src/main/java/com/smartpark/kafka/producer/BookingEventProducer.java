package com.smartpark.kafka.producer;

import com.smartpark.config.KafkaConfig;
import com.smartpark.kafka.event.BookingConfirmedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class BookingEventProducer {

    @Autowired(required = false)
    private KafkaTemplate<String, Object> kafkaTemplate;

    public void sendBookingConfirmedEvent(BookingConfirmedEvent event) {
        if (kafkaTemplate == null) {
            log.info("ℹ️ KafkaTemplate disabled, skipping event publish for Booking ID: {}", event.getBookingId());
            return;
        }
        try {
            log.info("Producing BOOKING_CONFIRMED event for Booking ID: {}", event.getBookingId());
            kafkaTemplate.send(KafkaConfig.BOOKING_EVENTS_TOPIC, String.valueOf(event.getBookingId()), event);
        } catch (Exception e) {
            log.warn("Kafka event publish skipped (offline): {}", e.getMessage());
        }
    }
}