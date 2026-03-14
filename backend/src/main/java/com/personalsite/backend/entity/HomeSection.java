package com.personalsite.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "home_section")
@Getter @Setter @NoArgsConstructor
public class HomeSection {

    @Id
    @UuidGenerator
    @Column(name = "id")
    private UUID id;

    @Column(name = "page_username", nullable = false, length = 50)
    private String pageUsername;

    @Column(name = "section_kind", nullable = false, length = 30)
    private String sectionKind;

    @Column(name = "title", nullable = false, length = 100)
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "is_visible")
    private Boolean isVisible = true;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
