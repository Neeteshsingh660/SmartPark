package com.smartpark.controller;

import com.smartpark.dto.ApiResponse;
import com.smartpark.dto.admin.AdminDashboardResponse;
import com.smartpark.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')") // ONLY Admins can hit these endpoints
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getDashboard() {
        AdminDashboardResponse data = adminService.getDashboardAnalytics();

        return ResponseEntity.ok(ApiResponse.<AdminDashboardResponse>builder()
                .success(true)
                .message("Admin analytics fetched successfully")
                .data(data)
                .build());
    }
}