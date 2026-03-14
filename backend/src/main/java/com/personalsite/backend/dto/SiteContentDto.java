package com.personalsite.backend.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.extern.jackson.Jacksonized;

import java.util.List;

@Getter
@Builder
@Jacksonized
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class SiteContentDto {
    private final HomeDto home;
    private final List<HomeSectionDto> homeSections;
    private final List<ArchiveItemDto> archive;
    private final List<CardItemDto> cards;
    private final List<ContactLinkDto> contact;

    @Getter
    @Builder
    @Jacksonized
    @AllArgsConstructor(access = AccessLevel.PRIVATE)
    public static class HomeDto {
        private final String name;
        private final String tagline;
        private final String snapshot;
        private final List<String> keywords;
        private final String avatar;
        private final Integer avatarX;
        private final Integer avatarY;
        private final String theme;
    }

    @Getter
    @Builder
    @Jacksonized
    @AllArgsConstructor(access = AccessLevel.PRIVATE)
    public static class HomeSectionDto {
        private final String id;
        private final String type;
        private final String name;
    }

    @Getter
    @Builder
    @Jacksonized
    @AllArgsConstructor(access = AccessLevel.PRIVATE)
    public static class ArchiveItemDto {
        private final String id;
        private final String category;
        private final String title;
        private final String date;
        private final String desc;
        private final Boolean featured;
        private final String image;
        private final String link;
    }

    @Getter
    @Builder
    @Jacksonized
    @AllArgsConstructor(access = AccessLevel.PRIVATE)
    public static class CardItemDto {
        private final String id;
        private final String type;
        private final String title;
        private final String date;
        private final String desc;
        private final Boolean featured;
        private final String image;
        private final List<String> links;
        private final List<DetailBlockDto> detailBlocks;
        private final List<InfoCardDto> infoCards;
        private final List<String> tags;
    }

    @Getter
    @Builder
    @Jacksonized
    @AllArgsConstructor(access = AccessLevel.PRIVATE)
    public static class DetailBlockDto {
        private final String type;
        private final String content;
        private final String span;
        private final String textType;
    }

    @Getter
    @Builder
    @Jacksonized
    @AllArgsConstructor(access = AccessLevel.PRIVATE)
    public static class InfoCardDto {
        private final String id;
        private final String icon;
        private final String label;
        private final String value;
    }

    @Getter
    @Builder
    @Jacksonized
    @AllArgsConstructor(access = AccessLevel.PRIVATE)
    public static class ContactLinkDto {
        private final String id;
        private final String type;
        private final String value;
    }
}
