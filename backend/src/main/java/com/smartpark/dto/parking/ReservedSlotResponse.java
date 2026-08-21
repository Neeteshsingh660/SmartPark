package com.smartpark.dto.parking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservedSlotResponse {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
}
