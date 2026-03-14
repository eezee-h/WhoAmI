package com.personalsite.backend.entity;

import io.hypersistence.utils.hibernate.type.array.StringArrayType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Type;

import java.time.OffsetDateTime;

@Entity
@Table(name = "home_profile")
@Getter @Setter @NoArgsConstructor
public class HomeProfile {

    @Id
    @Column(name = "page_username", length = 50)
    private String pageUsername;

    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;

    @Column(name = "tagline")
    private String tagline;

    @Column(name = "snapshot")
    private String snapshot;

    @Column(name = "avatar_base64", columnDefinition = "text")
    private String avatarBase64;

    @Column(name = "avatar_x")
    private Integer avatarX;

    @Column(name = "avatar_y")
    private Integer avatarY;

    @Type(StringArrayType.class)
    @Column(name = "keywords", columnDefinition = "text[]")
    private String[] keywords = new String[0];

    @Column(name = "theme", length = 20)
    private String theme = "black";

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    public void changeTheme(String theme, OffsetDateTime updatedAt) {
        this.theme = theme;
        this.updatedAt = updatedAt;
    }
}
