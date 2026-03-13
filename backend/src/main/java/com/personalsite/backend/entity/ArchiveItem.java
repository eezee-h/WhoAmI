package com.personalsite.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "archive_item")
@Getter @Setter @NoArgsConstructor
public class ArchiveItem {

    @Id
    @UuidGenerator
    @Column(name = "id")
    private UUID id;

    @Column(name = "section_id", nullable = false)
    private UUID sectionId;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "organization", length = 150)
    private String organization;

    @Column(name = "date_text")
    private String dateText;

    @Column(name = "summary")
    private String summary;

    @Column(name = "description")
    private String description;

    @Column(name = "image_base64", columnDefinition = "text")
    private String imageBase64;

    @Column(name = "link_url")
    private String linkUrl;

    @Column(name = "featured")
    private Boolean featured = false;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
