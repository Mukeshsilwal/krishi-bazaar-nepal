package com.krishihub.common.util;

import java.time.Instant;
import java.util.Date;
import java.text.SimpleDateFormat;
import java.text.ParseException;
import java.util.TimeZone;

/**
 * Centralized Date utility.
 * DO NOT create date logic elsewhere.
 * This is the single source of truth.
 * Enforces usage of java.util.Date as per requirements.
 */
public class DateUtil {

    private static final String ISO_PATTERN = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";
    private static final TimeZone UTC = TimeZone.getTimeZone("UTC");

    private DateUtil() {
        // Prevent instantiation
    }

    /**
     * Returns current UTC time as java.util.Date
     */
    public static Date nowUtc() {
        return Date.from(Instant.now());
    }

    /**
     * Formats Date to ISO 8601 String (UTC)
     */
    public static String toIsoString(Date date) {
        if (date == null) return null;
        SimpleDateFormat sdf = new SimpleDateFormat(ISO_PATTERN);
        sdf.setTimeZone(UTC);
        return sdf.format(date);
    }

    /**
     * Parses ISO 8601 String from client to Date
     */
    public static Date parseFromClient(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) return null;
        SimpleDateFormat sdf = new SimpleDateFormat(ISO_PATTERN);
        sdf.setTimeZone(UTC);
        try {
            return sdf.parse(dateStr);
        } catch (ParseException e) {
            throw new IllegalArgumentException("Invalid date format: " + dateStr, e);
        }
    }

    /**
     * Returns Date with time set to 00:00:00.000 (Start of Day)
     */
    public static Date startOfDay(Date date) {
        if (date == null) return null;
        java.util.Calendar cal = java.util.Calendar.getInstance();
        cal.setTime(date);
        cal.set(java.util.Calendar.HOUR_OF_DAY, 0);
        cal.set(java.util.Calendar.MINUTE, 0);
        cal.set(java.util.Calendar.SECOND, 0);
        cal.set(java.util.Calendar.MILLISECOND, 0);
        return cal.getTime();
    }

    /**
     * Returns Date with time set to 23:59:59.999 (End of Day)
     */
    public static Date endOfDay(Date date) {
        if (date == null) return null;
        java.util.Calendar cal = java.util.Calendar.getInstance();
        cal.setTime(date);
        cal.set(java.util.Calendar.HOUR_OF_DAY, 23);
        cal.set(java.util.Calendar.MINUTE, 59);
        cal.set(java.util.Calendar.SECOND, 59);
        cal.set(java.util.Calendar.MILLISECOND, 999);
        return cal.getTime();
    }

    public static Date addDays(Date date, int days) {
        if (date == null) return null;
        java.util.Calendar cal = java.util.Calendar.getInstance();
        cal.setTime(date);
        cal.add(java.util.Calendar.DAY_OF_YEAR, days);
        return cal.getTime();
    }

    public static boolean isToday(Date date) {
        if (date == null) return false;
        Date now = nowUtc();
        Date start = startOfDay(now);
        Date end = endOfDay(now);
        return (date.equals(start) || date.after(start)) && (date.before(end) || date.equals(end));
    }
}
