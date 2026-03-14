package com.personalsite.backend.service;

import com.personalsite.backend.dto.SiteContentDto;
import com.personalsite.backend.dto.SiteContentDto.ArchiveItemDto;
import com.personalsite.backend.dto.SiteContentDto.CardItemDto;
import com.personalsite.backend.dto.SiteContentDto.ContactLinkDto;
import com.personalsite.backend.dto.SiteContentDto.DetailBlockDto;
import com.personalsite.backend.dto.SiteContentDto.HomeDto;
import com.personalsite.backend.dto.SiteContentDto.HomeSectionDto;
import com.personalsite.backend.dto.SiteContentDto.InfoCardDto;
import com.personalsite.backend.entity.ArchiveItem;
import com.personalsite.backend.entity.CardBlock;
import com.personalsite.backend.entity.CardItem;
import com.personalsite.backend.entity.ContactLink;
import com.personalsite.backend.entity.HomeProfile;
import com.personalsite.backend.entity.HomeSection;
import com.personalsite.backend.entity.SiteUser;
import com.personalsite.backend.repository.ArchiveItemRepository;
import com.personalsite.backend.repository.CardBlockRepository;
import com.personalsite.backend.repository.CardItemRepository;
import com.personalsite.backend.repository.ContactLinkRepository;
import com.personalsite.backend.repository.HomeProfileRepository;
import com.personalsite.backend.repository.HomeSectionRepository;
import com.personalsite.backend.repository.SiteUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContentQueryService {

    private final SiteUserRepository userRepo;
    private final HomeProfileRepository profileRepo;
    private final HomeSectionRepository sectionRepo;
    private final ArchiveItemRepository archiveRepo;
    private final CardItemRepository cardItemRepo;
    private final CardBlockRepository cardBlockRepo;
    private final ContactLinkRepository contactRepo;

    public SiteContentDto loadContent(String username) {
        String canonicalUsername = findCanonicalUsername(username);
        HomeProfile profile = findProfile(canonicalUsername);
        List<HomeSection> sections = sectionRepo.findByPageUsernameOrderBySortOrder(canonicalUsername);

        List<UUID> sectionIds = sections.stream()
                .map(HomeSection::getId)
                .toList();
        Map<UUID, List<ArchiveItem>> archiveItemsBySectionId = groupArchiveItems(sectionIds);
        Map<UUID, List<CardItem>> cardItemsBySectionId = groupCardItems(sectionIds);
        Map<UUID, List<CardBlock>> cardBlocksByCardId = groupCardBlocks(cardItemsBySectionId);

        List<ArchiveItemDto> archive = new ArrayList<>();
        List<CardItemDto> cards = new ArrayList<>();
        for (HomeSection section : sections) {
            if ("archive".equals(section.getSectionKind())) {
                archiveItemsBySectionId.getOrDefault(section.getId(), List.of()).stream()
                        .map(item -> toArchiveItemDto(section, item))
                        .forEach(archive::add);
                continue;
            }

            String cardType = resolveCardType(section);
            cardItemsBySectionId.getOrDefault(section.getId(), List.of()).stream()
                    .map(item -> toCardItemDto(cardType, item, cardBlocksByCardId.getOrDefault(item.getId(), List.of())))
                    .forEach(cards::add);
        }

        return SiteContentDto.builder()
                .home(toHomeDto(profile))
                .homeSections(toHomeSections(sections))
                .archive(archive)
                .cards(cards)
                .contact(toContactLinks(canonicalUsername))
                .build();
    }

    public String loadTheme(String username) {
        String canonicalUsername = findCanonicalUsername(username);
        return resolveTheme(findProfile(canonicalUsername));
    }

    private String findCanonicalUsername(String username) {
        SiteUser user = userRepo.findByPageUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return user.getPageUsername();
    }

    private HomeProfile findProfile(String canonicalUsername) {
        return profileRepo.findById(canonicalUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    private Map<UUID, List<ArchiveItem>> groupArchiveItems(List<UUID> sectionIds) {
        if (sectionIds.isEmpty()) {
            return Map.of();
        }

        return archiveRepo.findBySectionIdInOrderBySectionIdAscSortOrderAsc(sectionIds).stream()
                .collect(Collectors.groupingBy(ArchiveItem::getSectionId, LinkedHashMap::new, Collectors.toList()));
    }

    private Map<UUID, List<CardItem>> groupCardItems(List<UUID> sectionIds) {
        if (sectionIds.isEmpty()) {
            return Map.of();
        }

        return cardItemRepo.findBySectionIdInOrderBySectionIdAscSortOrderAsc(sectionIds).stream()
                .collect(Collectors.groupingBy(CardItem::getSectionId, LinkedHashMap::new, Collectors.toList()));
    }

    private Map<UUID, List<CardBlock>> groupCardBlocks(Map<UUID, List<CardItem>> cardItemsBySectionId) {
        List<UUID> cardIds = cardItemsBySectionId.values().stream()
                .flatMap(List::stream)
                .map(CardItem::getId)
                .toList();
        if (cardIds.isEmpty()) {
            return Map.of();
        }

        return cardBlockRepo.findByCardIdInOrderByCardIdAscSortOrderAsc(cardIds).stream()
                .collect(Collectors.groupingBy(CardBlock::getCardId, LinkedHashMap::new, Collectors.toList()));
    }

    private HomeDto toHomeDto(HomeProfile profile) {
        return HomeDto.builder()
                .name(profile.getDisplayName())
                .tagline(profile.getTagline())
                .snapshot(profile.getSnapshot())
                .keywords(profile.getKeywords() != null ? Arrays.asList(profile.getKeywords()) : List.of())
                .avatar(profile.getAvatarBase64())
                .avatarX(profile.getAvatarX() != null ? profile.getAvatarX() : 50)
                .avatarY(profile.getAvatarY() != null ? profile.getAvatarY() : 50)
                .theme(resolveTheme(profile))
                .build();
    }

    private String resolveTheme(HomeProfile profile) {
        return profile.getTheme() != null ? profile.getTheme() : "black";
    }

    private List<HomeSectionDto> toHomeSections(List<HomeSection> sections) {
        return sections.stream()
                .map(section -> HomeSectionDto.builder()
                        .id(section.getId().toString())
                        .type(section.getSectionKind())
                        .name(section.getTitle())
                        .build())
                .toList();
    }

    private ArchiveItemDto toArchiveItemDto(HomeSection section, ArchiveItem item) {
        return ArchiveItemDto.builder()
                .id(item.getId().toString())
                .category(section.getTitle())
                .title(item.getTitle())
                .date(item.getDateText())
                .desc(item.getSummary())
                .featured(item.getFeatured())
                .image(item.getImageBase64())
                .link(item.getLinkUrl())
                .build();
    }

    private CardItemDto toCardItemDto(String cardType, CardItem item, List<CardBlock> blocks) {
        return CardItemDto.builder()
                .id(item.getId().toString())
                .type(cardType)
                .title(item.getTitle())
                .date(item.getDateText())
                .desc(item.getSummary())
                .featured(item.getFeatured())
                .image(item.getThumbnailBase64())
                .links(item.getLinks() != null ? Arrays.asList(item.getLinks()) : List.of())
                .detailBlocks(blocks.stream().map(this::toDetailBlockDto).toList())
                .infoCards(toInfoCards(item.getInfoCards()))
                .tags(item.getTags() != null ? Arrays.asList(item.getTags()) : List.of())
                .build();
    }

    private DetailBlockDto toDetailBlockDto(CardBlock block) {
        Map<String, Object> payload = block.getPayload();
        return DetailBlockDto.builder()
                .type(block.getBlockType())
                .content(getString(payload, "content"))
                .span(getString(payload, "span"))
                .textType(getString(payload, "textType"))
                .build();
    }

    private List<ContactLinkDto> toContactLinks(String canonicalUsername) {
        return contactRepo.findByPageUsernameOrderBySortOrder(canonicalUsername).stream()
                .map(this::toContactLinkDto)
                .toList();
    }

    private ContactLinkDto toContactLinkDto(ContactLink link) {
        return ContactLinkDto.builder()
                .id(link.getId().toString())
                .type(link.getContactType())
                .value(link.getValue())
                .build();
    }

    private String resolveCardType(HomeSection section) {
        return switch (section.getSectionKind()) {
            case "activity" -> "activity";
            case "project" -> "project";
            default -> section.getTitle();
        };
    }

    private String getString(Map<String, Object> map, String key) {
        if (map == null) {
            return null;
        }

        Object value = map.get(key);
        return value instanceof String stringValue ? stringValue : null;
    }

    private List<InfoCardDto> toInfoCards(List<Map<String, Object>> raw) {
        if (raw == null) {
            return List.of();
        }

        return raw.stream()
                .map(item -> InfoCardDto.builder()
                        .id(getString(item, "id"))
                        .icon(getString(item, "icon"))
                        .label(getString(item, "label"))
                        .value(getString(item, "value"))
                        .build())
                .toList();
    }
}
