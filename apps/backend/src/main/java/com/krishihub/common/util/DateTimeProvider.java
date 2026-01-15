package com.krishihub.common.util;

import java.util.Calendar;
import java.util.Date;

public class DateTimeProvider {
    public static Date now() {
        return new Date();
    }

    public static Date today() {
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        return cal.getTime();
    }

    public static Date addDays(Date date, int days) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        cal.add(java.util.Calendar.DAY_OF_YEAR, days);
        return cal.getTime();
    }

    public static Date startOfDay() {
        return startOfDay(now());
    }

    public static Date startOfDay(Date date) {
        java.util.Calendar cal = java.util.Calendar.getInstance();
        cal.setTime(date);
        cal.set(java.util.Calendar.HOUR_OF_DAY, 0);
        cal.set(java.util.Calendar.MINUTE, 0);
        cal.set(java.util.Calendar.SECOND, 0);
        cal.set(java.util.Calendar.MILLISECOND, 0);
        return cal.getTime();
    }

    public static Date endOfDay() {
        return endOfDay(now());
    }
    
    public static Date endOfDay(Date date) {
        java.util.Calendar cal = java.util.Calendar.getInstance();
        cal.setTime(date);
        cal.set(java.util.Calendar.HOUR_OF_DAY, 23);
        cal.set(java.util.Calendar.MINUTE, 59);
        cal.set(java.util.Calendar.SECOND, 59);
        cal.set(java.util.Calendar.MILLISECOND, 999);
        return cal.getTime();
    }

    public static boolean isToday(Date date) {
        if (date == null) return false;
        Date start = startOfDay(now());
        Date end = endOfDay(now());
        return (date.equals(start) || date.after(start)) && (date.before(end) || date.equals(end));
    }
}
