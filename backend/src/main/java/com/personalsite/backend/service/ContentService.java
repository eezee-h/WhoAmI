package com.personalsite.backend.service;

import com.personalsite.backend.dto.SiteContentDto;
import com.personalsite.backend.dto.SiteContentDto.*;
import com.personalsite.backend.entity.*;
import com.personalsite.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContentService {

    private final SiteUserRepository userRepo;
    private final HomeProfileRepository profileRepo;
    private final HomeSectionRepository sectionRepo;
    private final ArchiveItemRepository archiveRepo;
    private final CardItemRepository cardItemRepo;
    private final CardBlockRepository cardBlockRepo;
    private final ContactLinkRepository contactRepo;
    private final PasswordEncoder passwordEncoder;

    public SiteContentDto loadContent(String username) {
        SiteUser user = userRepo.findByPageUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        String canonicalUsername = user.getPageUsername();
        HomeProfile profile = profileRepo.findById(canonicalUsername).orElse(null);
        if (profile == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        HomeDto home;
        {
            home = HomeDto.builder()
                    .name(profile.getDisplayName())
                    .tagline(profile.getTagline())
                    .snapshot(profile.getSnapshot())
                    .keywords(profile.getKeywords() != null ? Arrays.asList(profile.getKeywords()) : List.of())
                    .avatar(profile.getAvatarBase64())
                    .avatarX(profile.getAvatarX() != null ? profile.getAvatarX() : 50)
                    .avatarY(profile.getAvatarY() != null ? profile.getAvatarY() : 50)
                    .theme(profile.getTheme() != null ? profile.getTheme() : "black")
                    .build();
        }

        List<HomeSection> sections = sectionRepo.findByPageUsernameOrderBySortOrder(canonicalUsername);

        List<HomeSectionDto> homeSections = sections.stream()
                .map(s -> HomeSectionDto.builder()
                        .id(s.getId().toString())
                        .type(s.getSectionKind())
                        .name(s.getTitle())
                        .build())
                .toList();

        List<ArchiveItemDto> archive = new ArrayList<>();
        List<CardItemDto> cards = new ArrayList<>();

        for (HomeSection sec : sections) {
            if ("archive".equals(sec.getSectionKind())) {
                archiveRepo.findBySectionIdOrderBySortOrder(sec.getId()).forEach(item ->
                        archive.add(ArchiveItemDto.builder()
                                .id(item.getId().toString())
                                .category(sec.getTitle())
                                .title(item.getTitle())
                                .date(item.getDateText())
                                .desc(item.getSummary())
                                .featured(item.getFeatured())
                                .image(item.getImageBase64())
                                .link(item.getLinkUrl())
                                .build()));
            } else {
                String cardType = resolveCardType(sec);
                cardItemRepo.findBySectionIdOrderBySortOrder(sec.getId()).forEach(item -> {
                    List<CardBlock> blocks = cardBlockRepo.findByCardIdOrderBySortOrder(item.getId());
                    List<DetailBlockDto> detailBlocks = blocks.stream()
                            .map(b -> {
                                Map<String, Object> p = b.getPayload();
                                return DetailBlockDto.builder()
                                        .type(b.getBlockType())
                                        .content(getString(p, "content"))
                                        .span(getString(p, "span"))
                                        .textType(getString(p, "textType"))
                                        .build();
                            }).toList();

                    List<InfoCardDto> infoCards = toInfoCards(item.getInfoCards());

                    cards.add(CardItemDto.builder()
                            .id(item.getId().toString())
                            .type(cardType)
                            .title(item.getTitle())
                            .date(item.getDateText())
                            .desc(item.getSummary())
                            .featured(item.getFeatured())
                            .image(item.getThumbnailBase64())
                            .links(item.getLinks() != null ? Arrays.asList(item.getLinks()) : List.of())
                            .detailBlocks(detailBlocks)
                            .infoCards(infoCards)
                            .tags(item.getTags() != null ? Arrays.asList(item.getTags()) : List.of())
                            .build());
                });
            }
        }

        List<ContactLinkDto> contact = contactRepo.findByPageUsernameOrderBySortOrder(canonicalUsername).stream()
                .map(c -> ContactLinkDto.builder()
                        .id(c.getId().toString())
                        .type(c.getContactType())
                        .value(c.getValue())
                        .build())
                .toList();

        return SiteContentDto.builder()
                .home(home)
                .homeSections(homeSections)
                .archive(archive)
                .cards(cards)
                .contact(contact)
                .build();
    }

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
            {"archive",  "경력사항"},
            {"archive",  "인턴십"},
            {"archive",  "학력사항"},
            {"activity", "대외활동"},
            {"project",  "프로젝트"},
            {"archive",  "수상"},
            {"archive",  "논문"},
            {"archive",  "어학"},
            {"archive",  "자격증"},
        };
        Map<String, UUID> sectionIds = new HashMap<>();
        for (int i = 0; i < sectionDefs.length; i++) {
            HomeSection sec = new HomeSection();
            sec.setPageUsername(pageUsername);
            sec.setSectionKind(sectionDefs[i][0]);
            sec.setTitle(sectionDefs[i][1]);
            sec.setSortOrder(i);
            sec.setIsVisible(true);
            sec.setCreatedAt(now);
            sec.setUpdatedAt(now);
            sec = sectionRepo.save(sec);
            sectionIds.put(sectionDefs[i][1], sec.getId());
        }

        String[][] archiveDefs = {
            {"경력사항", "회사명",        "2026.01 ~ 2026.03", "담당 업무와 주요 성과를 입력하세요."},
            {"인턴십",   "회사명",        "2026.01 ~ 2026.03", "인턴십 내용과 배운 점을 입력하세요."},
            {"학력사항", "학교명 / 전공", "2026.01 ~ 2026.03", "학과 및 졸업 여부를 입력하세요."},
            {"수상",     "수상명",        "2026",              "수상 내용과 주최 기관을 입력하세요."},
            {"어학",     "언어 / 시험명", "2026",              "점수 및 취득 기관을 입력하세요."},
            {"자격증",   "자격증명",      "2026",              "발급 기관을 입력하세요."},
            {"논문",     "논문 제목",     "2026",              "게재 학술지 및 주요 내용을 입력하세요."},
        };
        Map<String, Integer> orderMap = new HashMap<>();
        for (String[] a : archiveDefs) {
            UUID secId = sectionIds.get(a[0]);
            if (secId == null) continue;
            int ord = orderMap.getOrDefault(a[0], 0);
            ArchiveItem item = new ArchiveItem();
            item.setSectionId(secId);
            item.setTitle(a[1]);
            item.setDateText(a[2]);
            item.setSummary(a[3]);
            item.setFeatured(false);
            item.setSortOrder(ord);
            item.setCreatedAt(now);
            item.setUpdatedAt(now);
            archiveRepo.save(item);
            orderMap.put(a[0], ord + 1);
        }

        UUID actId = sectionIds.get("대외활동");
        if (actId != null) {
            CardItem ci = new CardItem();
            ci.setSectionId(actId);
            ci.setTitle("대외활동 이름");
            ci.setDateText("2026");
            ci.setSummary("활동 내용과 역할을 입력하세요.");
            ci.setFeatured(false);
            ci.setSortOrder(0);
            ci.setTags(new String[0]);
            ci.setLinks(new String[0]);
            ci.setInfoCards(new ArrayList<>(List.of(
                Map.of("id", "org",  "icon", "🏢", "label", "기관/단체", "value", ""),
                Map.of("id", "role", "icon", "💼", "label", "역할",     "value", ""),
                Map.of("id", "act",  "icon", "📋", "label", "주요 활동","value", "")
            )));
            ci.setCreatedAt(now);
            ci.setUpdatedAt(now);
            cardItemRepo.save(ci);
        }

        UUID projId = sectionIds.get("프로젝트");
        if (projId != null) {
            CardItem ci = new CardItem();
            ci.setSectionId(projId);
            ci.setTitle("프로젝트 이름");
            ci.setDateText("2026.01 ~ 2026.03");
            ci.setSummary("프로젝트 개요와 주요 기능을 입력하세요.");
            ci.setFeatured(false);
            ci.setSortOrder(0);
            ci.setTags(new String[0]);
            ci.setLinks(new String[0]);
            ci.setInfoCards(new ArrayList<>(List.of(
                Map.of("id", "team", "icon", "👥", "label", "팀 규모",     "value", ""),
                Map.of("id", "role", "icon", "💼", "label", "역할",        "value", ""),
                Map.of("id", "svc",  "icon", "⚙️", "label", "담당 서비스", "value", "")
            )));
            ci.setCreatedAt(now);
            ci.setUpdatedAt(now);
            cardItemRepo.save(ci);
        }

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
        SiteUser user = userRepo.findByPageUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        String canonicalUsername = user.getPageUsername();
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        // Upsert profile
        HomeProfile profile = profileRepo.findById(canonicalUsername).orElse(new HomeProfile());
        profile.setPageUsername(canonicalUsername);
        HomeDto h = dto.getHome();
        if (h != null) {
            profile.setDisplayName(h.getName() != null ? h.getName() : canonicalUsername);
            profile.setTagline(h.getTagline());
            profile.setSnapshot(h.getSnapshot());
            profile.setKeywords(h.getKeywords() != null ? h.getKeywords().toArray(new String[0]) : new String[0]);
            profile.setAvatarBase64(h.getAvatar());
            profile.setAvatarX(h.getAvatarX() != null ? h.getAvatarX() : 50);
            profile.setAvatarY(h.getAvatarY() != null ? h.getAvatarY() : 50);
            if (h.getTheme() != null) profile.setTheme(h.getTheme());
        }
        OffsetDateTime now = OffsetDateTime.now();
        if (profile.getCreatedAt() == null) profile.setCreatedAt(now);
        profile.setUpdatedAt(now);
        profileRepo.save(profile);

        // Replace sections (cascade deletes items/blocks)
        sectionRepo.deleteByPageUsername(canonicalUsername);

        List<HomeSectionDto> sections = dto.getHomeSections() != null ? dto.getHomeSections() : List.of();
        List<ArchiveItemDto> allArchive = dto.getArchive() != null ? dto.getArchive() : List.of();
        List<CardItemDto> allCards = dto.getCards() != null ? dto.getCards() : List.of();

        for (int i = 0; i < sections.size(); i++) {
            HomeSectionDto secDto = sections.get(i);
            HomeSection sec = new HomeSection();
            sec.setPageUsername(canonicalUsername);
            sec.setSectionKind(secDto.getType());
            sec.setTitle(secDto.getName());
            sec.setSortOrder(i);
            sec.setIsVisible(true);
            sec.setCreatedAt(now);
            sec.setUpdatedAt(now);
            sec = sectionRepo.save(sec);
            final UUID secId = sec.getId();

            if ("archive".equals(secDto.getType())) {
                int[] order = {0};
                allArchive.stream()
                        .filter(a -> secDto.getName().equals(a.getCategory()))
                        .forEach(a -> {
                            ArchiveItem item = new ArchiveItem();
                            item.setSectionId(secId);
                            item.setTitle(a.getTitle() != null ? a.getTitle() : "");
                            item.setDateText(a.getDate());
                            item.setSummary(a.getDesc());
                            item.setImageBase64(a.getImage());
                            item.setLinkUrl(a.getLink());
                            item.setFeatured(Boolean.TRUE.equals(a.getFeatured()));
                            item.setSortOrder(order[0]++);
                            item.setCreatedAt(now);
                            item.setUpdatedAt(now);
                            archiveRepo.save(item);
                        });
            } else {
                String cardType = resolveCardType(sec);
                int[] order = {0};
                allCards.stream()
                        .filter(c -> cardType.equals(c.getType()))
                        .forEach(c -> {
                            CardItem ci = new CardItem();
                            ci.setSectionId(secId);
                            ci.setTitle(c.getTitle() != null ? c.getTitle() : "");
                            ci.setDateText(c.getDate());
                            ci.setSummary(c.getDesc());
                            ci.setThumbnailBase64(c.getImage());
                            ci.setFeatured(Boolean.TRUE.equals(c.getFeatured()));
                            ci.setSortOrder(order[0]++);
                            ci.setTags(c.getTags() != null ? c.getTags().toArray(new String[0]) : new String[0]);
                            ci.setLinks(c.getLinks() != null ? c.getLinks().toArray(new String[0]) : new String[0]);
                            ci.setInfoCards(fromInfoCards(c.getInfoCards()));
                            ci.setCreatedAt(now);
                            ci.setUpdatedAt(now);
                            ci = cardItemRepo.save(ci);
                            final UUID cardId = ci.getId();

                            if (c.getDetailBlocks() != null) {
                                for (int bi = 0; bi < c.getDetailBlocks().size(); bi++) {
                                    DetailBlockDto b = c.getDetailBlocks().get(bi);
                                    CardBlock block = new CardBlock();
                                    block.setCardId(cardId);
                                    block.setBlockType(b.getType() != null ? b.getType() : "text");
                                    Map<String, Object> payload = new HashMap<>();
                                    payload.put("content", b.getContent() != null ? b.getContent() : "");
                                    if (b.getSpan() != null) payload.put("span", b.getSpan());
                                    if (b.getTextType() != null) payload.put("textType", b.getTextType());
                                    block.setPayload(payload);
                                    block.setSortOrder(bi);
                                    block.setCreatedAt(now);
                                    block.setUpdatedAt(now);
                                    cardBlockRepo.save(block);
                                }
                            }
                        });
            }
        }

        // Replace contact links
        contactRepo.deleteByPageUsername(canonicalUsername);
        List<ContactLinkDto> contacts = dto.getContact() != null ? dto.getContact() : List.of();
        for (int i = 0; i < contacts.size(); i++) {
            ContactLinkDto c = contacts.get(i);
            ContactLink link = new ContactLink();
            link.setPageUsername(canonicalUsername);
            link.setContactType(c.getType() != null ? c.getType() : "email");
            link.setValue(c.getValue() != null ? c.getValue() : "");
            link.setSortOrder(i);
            link.setIsVisible(true);
            link.setCreatedAt(now);
            link.setUpdatedAt(now);
            contactRepo.save(link);
        }
    }

    @Transactional
    public void setTheme(String username, String password, String theme) {
        SiteUser user = userRepo.findByPageUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        String canonicalUsername = user.getPageUsername();
        HomeProfile profile = profileRepo.findById(canonicalUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        profile.setTheme(theme);
        profileRepo.save(profile);
    }

    private String resolveCardType(HomeSection sec) {
        return switch (sec.getSectionKind()) {
            case "activity" -> "activity";
            case "project" -> "project";
            default -> sec.getTitle();
        };
    }

    private String getString(Map<String, Object> map, String key) {
        Object v = map.get(key);
        return v instanceof String s ? s : null;
    }

    private List<InfoCardDto> toInfoCards(List<Map<String, Object>> raw) {
        if (raw == null) return List.of();
        return raw.stream().map(m -> InfoCardDto.builder()
                .id(getString(m, "id"))
                .icon(getString(m, "icon"))
                .label(getString(m, "label"))
                .value(getString(m, "value"))
                .build()).toList();
    }

    private List<Map<String, Object>> fromInfoCards(List<InfoCardDto> dtos) {
        if (dtos == null) return new ArrayList<>();
        return dtos.stream().map(d -> {
            Map<String, Object> m = new HashMap<>();
            if (d.getId() != null) m.put("id", d.getId());
            if (d.getIcon() != null) m.put("icon", d.getIcon());
            if (d.getLabel() != null) m.put("label", d.getLabel());
            if (d.getValue() != null) m.put("value", d.getValue());
            return m;
        }).collect(Collectors.toList());
    }
}
