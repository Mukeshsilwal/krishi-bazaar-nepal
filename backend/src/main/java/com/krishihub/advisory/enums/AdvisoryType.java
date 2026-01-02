package com.krishihub.advisory.enums;

/**
 * Advisory Type Enumeration
 * Categorizes advisories for filtering and analytics
 */
public enum AdvisoryType {
    /**
     * Weather-based advisories (rain, temperature, wind, etc.)
     */
    WEATHER("Weather Advisory", "मौसम सल्लाह"),

    /**
     * Disease-related advisories (crop diseases, prevention, treatment)
     */
    DISEASE("Disease Advisory", "रोग सल्लाह"),

    /**
     * Pest-related advisories (pest identification, control measures)
     */
    PEST("Pest Advisory", "कीट सल्लाह"),

    /**
     * Policy and scheme advisories (government schemes, subsidies)
     */
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
