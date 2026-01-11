package com.krishihub.advisory.repository;

import com.krishihub.advisory.entity.WeatherAdvisory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WeatherAdvisoryRepository extends JpaRepository<WeatherAdvisory, UUID> {
    List<WeatherAdvisory> findByActiveTrue();

    List<WeatherAdvisory> findByRegion(String region);
}
