package com.krishihub.content.repository;

import com.krishihub.content.entity.Content;
import com.krishihub.content.enums.ContentStatus;
import com.krishihub.content.enums.ContentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ContentRepository extends JpaRepository<Content, UUID> {

        Page<Content> findByStatus(ContentStatus status, Pageable pageable);

        @Query(value = "SELECT * FROM contents c WHERE " +
                        "(CAST(:#{#contentType?.name()} AS text) IS NULL OR c.content_type = :#{#contentType?.name()}) AND "
                        +
                        "(CAST(:#{#status?.name()} AS text) IS NULL OR c.status = :#{#status?.name()}) AND " +
                        "(CAST(:region AS text) IS NULL OR CAST(:region AS text) = ANY(c.supported_regions)) AND " +
                        "(CAST(:crop AS text) IS NULL OR CAST(:crop AS text) = ANY(c.supported_crops))", countQuery = "SELECT count(*) FROM contents c WHERE "
                                        +
                                        "(CAST(:#{#contentType?.name()} AS text) IS NULL OR c.content_type = :#{#contentType?.name()}) AND "
                                        +
                                        "(CAST(:#{#status?.name()} AS text) IS NULL OR c.status = :#{#status?.name()}) AND "
                                        +
                                        "(CAST(:region AS text) IS NULL OR CAST(:region AS text) = ANY(c.supported_regions)) AND "
                                        +
                                        "(CAST(:crop AS text) IS NULL OR CAST(:crop AS text) = ANY(c.supported_crops))", nativeQuery = true)
        Page<Content> findByFilters(@Param("contentType") ContentType contentType,
                        @Param("status") ContentStatus status,
                        @Param("region") String region,
                        @Param("crop") String crop,
                        Pageable pageable);
        @Query("SELECT c FROM Content c WHERE c.status = :status AND " +
               "(LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
               "LOWER(c.summary) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
               "ORDER BY c.updatedAt DESC")
        java.util.List<Content> searchActiveContent(@Param("status") ContentStatus status, 
                                                    @Param("keyword") String keyword, 
                                                    Pageable pageable);

        java.util.List<Content> findTop5ByStatusOrderByPublishedAtDesc(ContentStatus status);
}
