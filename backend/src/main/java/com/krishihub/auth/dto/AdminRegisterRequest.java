package com.krishihub.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminRegisterRequest {

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^(\\+977)?[97][0-9]{9}$", message = "Invalid Nepali mobile number. Must be 10 digits starting with 97 or 98")
    private String mobileNumber;

    @NotBlank(message = "Email is required")
    @jakarta.validation.constraints.Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Admin secret key is required")
    private String adminSecret;
}
