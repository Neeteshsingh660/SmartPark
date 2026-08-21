package com.smartpark.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // The frontend will connect to ws://localhost:8080/ws
        // We use setAllowedOriginPatterns("*") to prevent CORS errors during development
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS(); // Fallback for browsers that don't support WebSockets
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Topics the frontend can subscribe to (e.g., /topic/notifications)
        registry.enableSimpleBroker("/topic");
        // Prefix for messages sent FROM the frontend TO the backend
        registry.setApplicationDestinationPrefixes("/app");
    }
}