package com.krishihub.agriculturecalendar.repository;

import com.krishihub.agriculturecalendar.model.AgricultureCalendarEntry;
import com.krishihub.agriculturecalendar.model.CropType;
import com.krishihub.agriculturecalendar.model.NepaliMonth;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AgricultureCalendarRepository extends JpaRepository<AgricultureCalendarEntry, UUID> {

    List<AgricultureCalendarEntry> findByCrop(CropType crop);

    List<AgricultureCalendarEntry> findByNepaliMonth(NepaliMonth nepaliMonth);

    List<AgricultureCalendarEntry> findByOrderByNepaliMonthAsc();

    List<AgricultureCalendarEntry> findByCropAndNepaliMonth(CropType crop, NepaliMonth nepaliMonth);

    Page<AgricultureCalendarEntry> findByCrop(CropType crop, Pageable pageable);

    Page<AgricultureCalendarEntry> findByNepaliMonth(NepaliMonth nepaliMonth, Pageable pageable);

    Page<AgricultureCalendarEntry> findByCropAndNepaliMonth(CropType crop, NepaliMonth nepaliMonth, Pageable pageable);
}
