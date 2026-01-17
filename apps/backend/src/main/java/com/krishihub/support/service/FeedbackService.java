package com.krishihub.support.service;

import com.krishihub.auth.entity.User;
import com.krishihub.auth.repository.UserRepository;
import com.krishihub.support.entity.Feedback;
import com.krishihub.support.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;

    public Feedback submitFeedback(UUID userId, String type, String message) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Feedback feedback = Feedback.builder()
                .user(user)
                .type(Feedback.FeedbackType.valueOf(type.toUpperCase()))
                .message(message)
                .status(Feedback.FeedbackStatus.OPEN)
                .build();

        return feedbackRepository.save(feedback);
    }

    public com.krishihub.shared.dto.PaginatedResponse<com.krishihub.support.dto.FeedbackDto> getAllFeedback(org.springframework.data.domain.Pageable pageable) {
        org.springframework.data.domain.Page<Feedback> page = feedbackRepository.findAll(pageable);
        java.util.List<com.krishihub.support.dto.FeedbackDto> dtos = page.getContent().stream()
                .map(com.krishihub.support.dto.FeedbackDto::fromEntity)
                .toList();
        
        return com.krishihub.shared.dto.PaginatedResponse.of(
                dtos,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }

    public Feedback updateStatus(UUID feedbackId, String status) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        feedback.setStatus(Feedback.FeedbackStatus.valueOf(status.toUpperCase()));
        return feedbackRepository.save(feedback);
    }
}
