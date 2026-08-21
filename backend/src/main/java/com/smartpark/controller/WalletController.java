package com.smartpark.controller;

import com.smartpark.dto.ApiResponse;
import com.smartpark.entity.User;
import com.smartpark.exception.ResourceNotFoundException;
import com.smartpark.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final UserRepository userRepository;

    @GetMapping("/balance")
    @PreAuthorize("hasAnyRole('DRIVER','OWNER','ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, BigDecimal>>> getWalletBalance(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        BigDecimal balance = user.getWalletBalance() != null ? user.getWalletBalance() : BigDecimal.ZERO;
        return ResponseEntity.ok(ApiResponse.<Map<String, BigDecimal>>builder()
                .success(true)
                .message("Wallet balance fetched")
                .data(Map.of("walletBalance", balance))
                .build());
    }
}
