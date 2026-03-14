package com.personalsite.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class SiteContentDto {
    private HomeDto home;
    private List<HomeSectionDto> homeSections;
    private List<ArchiveItemDto> archive;
    private List<CardItemDto> cards;
    private List<ContactLinkDto> contact;

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class HomeDto {
        private String name;
        private String tagline;
        private String snapshot;
        private List<String> keywords;
        private String avatar;
        private Integer avatarX;
        private Integer avatarY;
        private String theme;
    }

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class HomeSectionDto {
        private String id;
        private String type;
        private String name;
    }

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ArchiveItemDto {
        private String id;
        private String category;
        private String title;
        private String date;
        private String desc;
        private Boolean featured;
        private String image;
        private String link;
    }

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CardItemDto {
        private String id;
        private String type;
        private String title;
        private String date;
        private String desc;
        private Boolean featured;
        private String image;
        private List<String> links;
        private List<DetailBlockDto> detailBlocks;
        private List<InfoCardDto> infoCards;
        private List<String> tags;
    }

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DetailBlockDto {
        private String type;
        private String content;
        private String span;
        private String textType;
    }

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class InfoCardDto {
        private String id;
        private String icon;
        private String label;
        private String value;
    }

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ContactLinkDto {
        private String id;
        private String type;
        private String value;
    }
}
