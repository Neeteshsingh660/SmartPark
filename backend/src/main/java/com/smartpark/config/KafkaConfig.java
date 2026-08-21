package com.smartpark.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    public static final String BOOKING_EVENTS_TOPIC = "booking-events";

    // This automatically creates the topic in your Kafka broker if it doesn't exist
    @Bean
    @org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "spring.kafka.enabled", havingValue = "true", matchIfMissing = false)
    public NewTopic bookingEventsTopic() {
        return TopicBuilder.name(BOOKING_EVENTS_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }
}