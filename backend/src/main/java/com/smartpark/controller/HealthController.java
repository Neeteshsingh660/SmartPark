package com.smartpark.controller;

import com.smartpark.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, String>>> healthCheck() {
        Map<String, String> healthData = Map.of(
                "status", "UP",
                "service", "SmartPark API v1"
        );

        ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                .success(true)
                .message("System is operational")
                .data(healthData)
                .build();

        return ResponseEntity.ok(response);
    }
}