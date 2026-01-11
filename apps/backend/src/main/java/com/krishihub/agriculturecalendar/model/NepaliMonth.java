package com.krishihub.agriculturecalendar.model;

public enum NepaliMonth {
    BAISAKH(1, "Baisakh", "बैशाख"),
    JESTHA(2, "Jestha", "जेष्ठ"),
    ASHADH(3, "Ashadh", "असार"),
    SHRAWAN(4, "Shrawan", "श्रावण"),
    BHADRA(5, "Bhadra", "भाद्र"),
    ASHWIN(6, "Ashwin", "आश्विन"),
    KARTIK(7, "Kartik", "कार्तिक"),
    MANGSIR(8, "Mangsir", "मंसिर"),
    POUSH(9, "Poush", "पौष"),
    MAGH(10, "Magh", "माघ"),
    FALGUN(11, "Falgun", "फाल्गुन"),
    CHAITRA(12, "Chaitra", "चैत्र");

    private final int order;
    private final String englishName;
    private final String nepaliName;

    NepaliMonth(int order, String englishName, String nepaliName) {
        this.order = order;
        this.englishName = englishName;
        this.nepaliName = nepaliName;
    }

    public int getOrder() {
        return order;
    }

    public String getEnglishName() {
        return englishName;
    }

    public String getNepaliName() {
        return nepaliName;
    }
}
