package com.krishihub.common.util;

/**
 * Centralized String utility.
 */
public class StringUtil {

    private StringUtil() {}

    public static String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }

    public static boolean hasText(String str) {
        return str != null && !str.trim().isEmpty();
    }
}
