package com.krishihub.disease.signal;

import com.krishihub.disease.model.SignalPayload;
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
    public ResponseEntity<Void> reportSymptom(@RequestBody SignalPayload payload) {
        payload.setTimestamp(LocalDateTime.now());
        signalService.processSignal(payload);
        return ResponseEntity.ok().build();
    }
}
