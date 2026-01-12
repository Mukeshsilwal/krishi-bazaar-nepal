package com.krishihub.agriculturecalendar.model;

public enum CropType {
    PADDY("Paddy", "धान"),
    MAIZE("Maize", "मकै"),
    WHEAT("Wheat", "गहुँ"),
    POTATO("Potato", "आलु"),
    MUSTARD("Mustard", "तोरी"),
    SUGARCANE("Sugarcane", "उखु"),
    VEGETABLES("Vegetables", "तरकारी"),
    FRUITS("Fruits", "फलफूल");

    private final String englishName;
    private final String nepaliName;

    CropType(String englishName, String nepaliName) {
        this.englishName = englishName;
        this.nepaliName = nepaliName;
    }

    public String getEnglishName() {
        return englishName;
    }

    public String getNepaliName() {
        return nepaliName;
    }
}
