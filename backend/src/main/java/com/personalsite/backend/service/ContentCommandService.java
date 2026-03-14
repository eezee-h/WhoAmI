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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContentCommandService {

    private final SiteUserRepository userRepo;
    private final HomeProfileRepository profileRepo;
    private final HomeSectionRepository sectionRepo;
    private final ArchiveItemRepository archiveRepo;
    private final CardItemRepository cardItemRepo;
    private final CardBlockRepository cardBlockRepo;
    private final ContactLinkRepository contactRepo;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void initDefaultContent(String pageUsername) {
        OffsetDateTime now = OffsetDateTime.now();

        HomeProfile profile = new HomeProfile();
        profile.setPageUsername(pageUsername);
        profile.setDisplayName("이름을 입력하세요");
        profile.setTagline("저는 무언가를 만들고 기록하는 사람입니다.");
        profile.setSnapshot("안녕하세요! 저는 ___입니다. 저는 ___에 관심이 많고, ___를 좋아합니다. 이 공간은 제가 해온 것들과 생각들을 기록하는 곳입니다.");
        profile.setKeywords(new String[]{"기록", "디자인", "코딩", "탐구", "글쓰기"});
        profile.setAvatarX(50);
        profile.setAvatarY(50);
        profile.setTheme("black");
        profile.setCreatedAt(now);
        profile.setUpdatedAt(now);
        profileRepo.save(profile);

        String[][] sectionDefs = {
                {"archive", "경력사항"},
                {"archive", "인턴십"},
                {"archive", "학력사항"},
                {"activity", "대외활동"},
                {"project", "프로젝트"},
                {"archive", "수상"},
                {"archive", "논문"},
                {"archive", "어학"},
                {"archive", "자격증"}
        };
        Map<String, UUID> sectionIds = new HashMap<>();
        for (int index = 0; index < sectionDefs.length; index++) {
            HomeSection section = new HomeSection();
            section.setPageUsername(pageUsername);
            section.setSectionKind(sectionDefs[index][0]);
            section.setTitle(sectionDefs[index][1]);
            section.setSortOrder(index);
            section.setIsVisible(true);
            section.setCreatedAt(now);
            section.setUpdatedAt(now);
            section = sectionRepo.save(section);
            sectionIds.put(sectionDefs[index][1], section.getId());
        }

        String[][] archiveDefs = {
                {"경력사항", "회사명", "2026.01 ~ 2026.03", "담당 업무와 주요 성과를 입력하세요."},
                {"인턴십", "회사명", "2026.01 ~ 2026.03", "인턴십 내용과 배운 점을 입력하세요."},
                {"학력사항", "학교명 / 전공", "2026.01 ~ 2026.03", "학과 및 졸업 여부를 입력하세요."},
                {"수상", "수상명", "2026", "수상 내용과 주최 기관을 입력하세요."},
                {"어학", "언어 / 시험명", "2026", "점수 및 취득 기관을 입력하세요."},
                {"자격증", "자격증명", "2026", "발급 기관을 입력하세요."},
                {"논문", "논문 제목", "2026", "게재 학술지 및 주요 내용을 입력하세요."}
        };
        Map<String, Integer> archiveOrders = new HashMap<>();
        for (String[] archiveDef : archiveDefs) {
            UUID sectionId = sectionIds.get(archiveDef[0]);
            if (sectionId == null) {
                continue;
            }

            int order = archiveOrders.getOrDefault(archiveDef[0], 0);
            ArchiveItem item = new ArchiveItem();
            item.setSectionId(sectionId);
            item.setTitle(archiveDef[1]);
            item.setDateText(archiveDef[2]);
            item.setSummary(archiveDef[3]);
            item.setFeatured(false);
            item.setSortOrder(order);
            item.setCreatedAt(now);
            item.setUpdatedAt(now);
            archiveRepo.save(item);
            archiveOrders.put(archiveDef[0], order + 1);
        }

        createDefaultCard(sectionIds.get("대외활동"), "대외활동 이름", "2026", "활동 내용과 역할을 입력하세요.", List.of(
                infoCard("org", "🏢", "기관/단체"),
                infoCard("role", "💼", "역할"),
                infoCard("act", "📋", "주요 활동")
        ), now);

        createDefaultCard(sectionIds.get("프로젝트"), "프로젝트 이름", "2026.01 ~ 2026.03", "프로젝트 개요와 주요 기능을 입력하세요.", List.of(
                infoCard("team", "👥", "팀 규모"),
                infoCard("role", "💼", "역할"),
                infoCard("svc", "⚙️", "담당 서비스")
        ), now);

        ContactLink contact = new ContactLink();
        contact.setPageUsername(pageUsername);
        contact.setContactType("email");
        contact.setValue("your@email.com");
        contact.setSortOrder(0);
        contact.setIsVisible(true);
        contact.setCreatedAt(now);
        contact.setUpdatedAt(now);
        contactRepo.save(contact);
    }

    @Transactional
    public void saveContent(String username, String password, SiteContentDto dto) {
        SiteUser user = findUser(username);
        verifyPassword(password, user);

        String canonicalUsername = user.getPageUsername();
        HomeProfile profile = profileRepo.findById(canonicalUsername).orElse(new HomeProfile());
        profile.setPageUsername(canonicalUsername);

        HomeDto home = dto.getHome();
        if (home != null) {
            profile.setDisplayName(home.getName() != null ? home.getName() : canonicalUsername);
            profile.setTagline(home.getTagline());
            profile.setSnapshot(home.getSnapshot());
            profile.setKeywords(home.getKeywords() != null ? home.getKeywords().toArray(new String[0]) : new String[0]);
            profile.setAvatarBase64(home.getAvatar());
            profile.setAvatarX(home.getAvatarX() != null ? home.getAvatarX() : 50);
            profile.setAvatarY(home.getAvatarY() != null ? home.getAvatarY() : 50);
            if (home.getTheme() != null) {
                profile.setTheme(home.getTheme());
            }
        }

        OffsetDateTime now = OffsetDateTime.now();
        if (profile.getCreatedAt() == null) {
            profile.setCreatedAt(now);
        }
        profile.setUpdatedAt(now);
        profileRepo.save(profile);

        sectionRepo.deleteByPageUsername(canonicalUsername);

        List<HomeSectionDto> sections = dto.getHomeSections() != null ? dto.getHomeSections() : List.of();
        List<ArchiveItemDto> archiveItems = dto.getArchive() != null ? dto.getArchive() : List.of();
        List<CardItemDto> cards = dto.getCards() != null ? dto.getCards() : List.of();

        for (int sectionIndex = 0; sectionIndex < sections.size(); sectionIndex++) {
            HomeSectionDto sectionDto = sections.get(sectionIndex);
            HomeSection section = new HomeSection();
            section.setPageUsername(canonicalUsername);
            section.setSectionKind(sectionDto.getType());
            section.setTitle(sectionDto.getName());
            section.setDescription(sectionDto.getDescription());
            section.setSortOrder(sectionIndex);
            section.setIsVisible(true);
            section.setCreatedAt(now);
            section.setUpdatedAt(now);
            section = sectionRepo.save(section);

            if ("archive".equals(sectionDto.getType())) {
                saveArchiveItems(section.getId(), sectionDto, archiveItems, now);
                continue;
            }

            saveCardItems(section, cards, now);
        }

        contactRepo.deleteByPageUsername(canonicalUsername);
        List<ContactLinkDto> contacts = dto.getContact() != null ? dto.getContact() : List.of();
        for (int index = 0; index < contacts.size(); index++) {
            ContactLinkDto contactDto = contacts.get(index);
            ContactLink link = new ContactLink();
            link.setPageUsername(canonicalUsername);
            link.setContactType(contactDto.getType() != null ? contactDto.getType() : "email");
            link.setValue(contactDto.getValue() != null ? contactDto.getValue() : "");
            link.setSortOrder(index);
            link.setIsVisible(true);
            link.setCreatedAt(now);
            link.setUpdatedAt(now);
            contactRepo.save(link);
        }
    }

    @Transactional
    public void setTheme(String username, String password, String theme) {
        SiteUser user = findUser(username);
        verifyPassword(password, user);

        HomeProfile profile = profileRepo.findById(user.getPageUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        profile.changeTheme(theme, OffsetDateTime.now());
        profileRepo.save(profile);
    }

    private void createDefaultCard(
            UUID sectionId,
            String title,
            String dateText,
            String summary,
            List<Map<String, Object>> infoCards,
            OffsetDateTime now
    ) {
        if (sectionId == null) {
            return;
        }

        CardItem item = new CardItem();
        item.setSectionId(sectionId);
        item.setTitle(title);
        item.setDateText(dateText);
        item.setSummary(summary);
        item.setFeatured(false);
        item.setSortOrder(0);
        item.setTags(new String[0]);
        item.setLinks(new String[0]);
        item.setInfoCards(new ArrayList<>(infoCards));
        item.setCreatedAt(now);
        item.setUpdatedAt(now);
        cardItemRepo.save(item);
    }

    private void saveArchiveItems(
            UUID sectionId,
            HomeSectionDto sectionDto,
            List<ArchiveItemDto> archiveItems,
            OffsetDateTime now
    ) {
        int[] order = {0};
        archiveItems.stream()
                .filter(item -> sectionDto.getName().equals(item.getCategory()))
                .forEach(itemDto -> {
                    ArchiveItem item = new ArchiveItem();
                    item.setSectionId(sectionId);
                    item.setTitle(itemDto.getTitle() != null ? itemDto.getTitle() : "");
                    item.setDateText(itemDto.getDate());
                    item.setSummary(itemDto.getDesc());
                    item.setImageBase64(itemDto.getImage());
                    item.setLinkUrl(itemDto.getLink());
                    item.setFeatured(Boolean.TRUE.equals(itemDto.getFeatured()));
                    item.setSortOrder(order[0]++);
                    item.setCreatedAt(now);
                    item.setUpdatedAt(now);
                    archiveRepo.save(item);
                });
    }

    private void saveCardItems(HomeSection section, List<CardItemDto> cards, OffsetDateTime now) {
        String cardType = resolveCardType(section);
        int[] order = {0};
        cards.stream()
                .filter(card -> cardType.equals(card.getType()))
                .forEach(cardDto -> {
                    CardItem item = new CardItem();
                    item.setSectionId(section.getId());
                    item.setTitle(cardDto.getTitle() != null ? cardDto.getTitle() : "");
                    item.setDateText(cardDto.getDate());
                    item.setSummary(cardDto.getDesc());
                    item.setThumbnailBase64(cardDto.getImage());
                    item.setFeatured(Boolean.TRUE.equals(cardDto.getFeatured()));
                    item.setSortOrder(order[0]++);
                    item.setTags(cardDto.getTags() != null ? cardDto.getTags().toArray(new String[0]) : new String[0]);
                    item.setLinks(cardDto.getLinks() != null ? cardDto.getLinks().toArray(new String[0]) : new String[0]);
                    item.setInfoCards(fromInfoCards(cardDto.getInfoCards()));
                    item.setCreatedAt(now);
                    item.setUpdatedAt(now);
                    item = cardItemRepo.save(item);

                    saveCardBlocks(item.getId(), cardDto.getDetailBlocks(), now);
                });
    }

    private void saveCardBlocks(UUID cardId, List<DetailBlockDto> detailBlocks, OffsetDateTime now) {
        if (detailBlocks == null) {
            return;
        }

        for (int blockIndex = 0; blockIndex < detailBlocks.size(); blockIndex++) {
            DetailBlockDto blockDto = detailBlocks.get(blockIndex);
            CardBlock block = new CardBlock();
            block.setCardId(cardId);
            block.setBlockType(blockDto.getType() != null ? blockDto.getType() : "text");

            Map<String, Object> payload = new HashMap<>();
            payload.put("content", blockDto.getContent() != null ? blockDto.getContent() : "");
            if (blockDto.getSpan() != null) {
                payload.put("span", blockDto.getSpan());
            }
            if (blockDto.getTextType() != null) {
                payload.put("textType", blockDto.getTextType());
            }

            block.setPayload(payload);
            block.setSortOrder(blockIndex);
            block.setCreatedAt(now);
            block.setUpdatedAt(now);
            cardBlockRepo.save(block);
        }
    }

    private SiteUser findUser(String username) {
        return userRepo.findByPageUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    private Map<String, Object> infoCard(String id, String icon, String label) {
        Map<String, Object> infoCard = new HashMap<>();
        infoCard.put("id", id);
        infoCard.put("icon", icon);
        infoCard.put("label", label);
        infoCard.put("value", "");
        return infoCard;
    }

    private void verifyPassword(String password, SiteUser user) {
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
    }

    private String resolveCardType(HomeSection section) {
        return switch (section.getSectionKind()) {
            case "activity" -> "activity";
            case "project" -> "project";
            default -> section.getTitle();
        };
    }

    private List<Map<String, Object>> fromInfoCards(List<InfoCardDto> dtos) {
        if (dtos == null) {
            return new ArrayList<>();
        }

        return dtos.stream()
                .map(dto -> {
                    Map<String, Object> infoCard = new HashMap<>();
                    if (dto.getId() != null) {
                        infoCard.put("id", dto.getId());
                    }
                    if (dto.getIcon() != null) {
                        infoCard.put("icon", dto.getIcon());
                    }
                    if (dto.getLabel() != null) {
                        infoCard.put("label", dto.getLabel());
                    }
                    if (dto.getValue() != null) {
                        infoCard.put("value", dto.getValue());
                    }
                    return infoCard;
                })
                .collect(Collectors.toList());
    }
}
