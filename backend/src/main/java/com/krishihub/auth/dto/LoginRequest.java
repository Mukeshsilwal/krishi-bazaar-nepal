package com.krishihub.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^\\+?977[0-9]{10}$|^[0-9]{10}$", message = "Invalid Nepali mobile number")
    private String mobileNumber;
}
