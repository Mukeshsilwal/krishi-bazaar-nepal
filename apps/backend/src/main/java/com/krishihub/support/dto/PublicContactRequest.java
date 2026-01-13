package com.krishihub.support.dto;

import lombok.Data;

@Data
public class PublicContactRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String subject;
    private String message;
}
