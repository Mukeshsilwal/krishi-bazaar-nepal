package com.krishihub.agriculturecalendar.model;

public enum ActivityType {
    SOWING("Sowing", "रोप्ने"),
    TRANSPLANTING("Transplanting", "सार्ने"),
    HARVESTING("Harvesting", "काट्ने/भित्राउने"),
    GROWTH("Growth/Care", "हेरचाह"),
    MANAGEMENT("Management", "व्यवस्थापन"),
    IRRIGATION("Irrigation", "सिंचाई"),
    FERTILIZATION("Fertilization", "मलखाद");

    private final String englishName;
    private final String nepaliName;

    ActivityType(String englishName, String nepaliName) {
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
