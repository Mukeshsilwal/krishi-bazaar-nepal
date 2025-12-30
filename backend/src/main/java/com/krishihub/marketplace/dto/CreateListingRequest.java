package com.krishihub.marketplace.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateListingRequest {

    @NotBlank(message = "Crop name is required")
    @Size(max = 100, message = "Crop name must not exceed 100 characters")
    private String cropName;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.01", message = "Quantity must be greater than 0")
    private BigDecimal quantity;

    @NotBlank(message = "Unit is required")
    @Pattern(regexp = "^(kg|quintal|ton|piece|dozen)$", message = "Unit must be one of: kg, quintal, ton, piece, dozen")
    private String unit;

    @NotNull(message = "Price per unit is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal pricePerUnit;

    private String harvestDate; // Format: YYYY-MM-DD

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @Size(max = 100, message = "Location must not exceed 100 characters")
    private String location;
}
