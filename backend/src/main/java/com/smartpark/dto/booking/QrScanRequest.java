package com.smartpark.dto.booking;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class QrScanRequest {
    @NotBlank(message = "QR Token is required")
    private String qrToken;
}