package com.krishihub.disease.signal;

import com.krishihub.disease.model.SignalPayload;
import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/disease/signals")
@RequiredArgsConstructor
public class SignalController {

    private final SignalIngestionService signalService;

    @PostMapping("/report")
    public ResponseEntity<ApiResponse<Void>> reportSymptom(@RequestBody SignalPayload payload) {
        payload.setTimestamp(LocalDateTime.now());
        signalService.processSignal(payload);
        return ResponseEntity.ok(ApiResponse.success("Signal reported successfully", null));
    }
}
