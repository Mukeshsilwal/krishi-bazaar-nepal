package com.krishihub.marketprice.service;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class VegetableImageProvider {

    private final Map<String, String> imageMap = new ConcurrentHashMap<>();
    private static final String FALLBACK_IMAGE = "https://images.unsplash.com/photo-1595855709915-f65b907afa0a?w=500&auto=format&fit=crop&q=60";

    @PostConstruct
    public void init() {
        // Common Vegetables
        imageMap.put("tomato", "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=60");
        imageMap.put("potato", "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=60");
        imageMap.put("onion", "https://images.unsplash.com/photo-1508747703725-7197b91dac80?w=500&auto=format&fit=crop&q=60");
        imageMap.put("cabbage", "https://images.unsplash.com/photo-1551068832-75d3de6ca681?w=500&auto=format&fit=crop&q=60");
        imageMap.put("cauliflower", "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=500&auto=format&fit=crop&q=60");
        imageMap.put("carrot", "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop&q=60");
        imageMap.put("spinach", "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=60");
        imageMap.put("radish", "https://images.unsplash.com/photo-1595123550441-d377e017de6a?w=500&auto=format&fit=crop&q=60");
        imageMap.put("pumpkin", "https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=500&auto=format&fit=crop&q=60");
        
        // Fruits
        imageMap.put("apple", "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=60");
        imageMap.put("banana", "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=60");
        imageMap.put("orange", "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=500&auto=format&fit=crop&q=60");

        // Nepali aliases
        imageMap.put("golbheda", imageMap.get("tomato"));
        imageMap.put("alu", imageMap.get("potato"));
        imageMap.put("pyaj", imageMap.get("onion"));
        imageMap.put("banda", imageMap.get("cabbage"));
        imageMap.put("kauli", imageMap.get("cauliflower"));
        imageMap.put("gajar", imageMap.get("carrot"));
        imageMap.put("saag", imageMap.get("spinach"));
        imageMap.put("mula", imageMap.get("radish"));
        imageMap.put("farsi", imageMap.get("pumpkin"));
        imageMap.put("syau", imageMap.get("apple"));
        imageMap.put("kera", imageMap.get("banana"));
        imageMap.put("suntala", imageMap.get("orange"));
    }

    public String getImageUrl(String cropName) {
        if (cropName == null) return FALLBACK_IMAGE;
        String normalized = cropName.trim().toLowerCase().replaceAll("\\s+", "_");
        if (imageMap.containsKey(normalized)) {
            return imageMap.get(normalized);
        }
        return imageMap.getOrDefault(normalized, FALLBACK_IMAGE);
    }
}
