package com.krishihub.advisory.enums;

public enum AdvisoryType {
    WEATHER("Weather Advisory", "मौसम सल्लाह"),
    DISEASE("Disease Advisory", "रोग सल्लाह"),
    PEST("Pest Advisory", "कीट सल्लाह"),
    POLICY("Policy Advisory", "नीति सल्लाह");

    private final String displayNameEn;
    private final String displayNameNe;

    AdvisoryType(String displayNameEn, String displayNameNe) {
        this.displayNameEn = displayNameEn;
        this.displayNameNe = displayNameNe;
    }

    public String getDisplayNameEn() {
        return displayNameEn;
    }

    public String getDisplayNameNe() {
        return displayNameNe;
    }
}
