package com.personalsite.backend.entity;

import io.hypersistence.utils.hibernate.type.array.StringArrayType;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UuidGenerator;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "card_item")
@Getter @Setter @NoArgsConstructor
public class CardItem {

    @Id
    @UuidGenerator
    @Column(name = "id")
    private UUID id;

    @Column(name = "section_id", nullable = false)
    private UUID sectionId;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "subtitle", length = 150)
    private String subtitle;

    @Column(name = "date_text")
    private String dateText;

    @Column(name = "summary")
    private String summary;

    @Column(name = "thumbnail_base64", columnDefinition = "text")
    private String thumbnailBase64;

    @Column(name = "featured")
    private Boolean featured = false;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Type(StringArrayType.class)
    @Column(name = "tags", columnDefinition = "text[]")
    private String[] tags = new String[0];

    // Added via V2 migration
    @Type(JsonBinaryType.class)
    @Column(name = "info_cards", columnDefinition = "jsonb")
    private List<Map<String, Object>> infoCards = new ArrayList<>();

    @Type(StringArrayType.class)
    @Column(name = "links", columnDefinition = "text[]")
    private String[] links = new String[0];

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
