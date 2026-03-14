package com.personalsite.backend.service;

import com.personalsite.backend.dto.SiteContentDto;
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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ContentQueryServiceTest {

    @Mock
    private SiteUserRepository userRepo;

    @Mock
    private HomeProfileRepository profileRepo;

    @Mock
    private HomeSectionRepository sectionRepo;

    @Mock
    private ArchiveItemRepository archiveRepo;

    @Mock
    private CardItemRepository cardItemRepo;

    @Mock
    private CardBlockRepository cardBlockRepo;

    @Mock
    private ContactLinkRepository contactRepo;

    @InjectMocks
    private ContentQueryService contentQueryService;

    @Test
    void loadContent_batchesRelatedContentByIds() {
        String username = "lee";
        UUID archiveSectionId = UUID.randomUUID();
        UUID activitySectionId = UUID.randomUUID();
        UUID cardId = UUID.randomUUID();

        SiteUser user = new SiteUser();
        user.setPageUsername(username);

        HomeProfile profile = new HomeProfile();
        profile.setPageUsername(username);
        profile.setDisplayName("Lee");
        profile.setTheme("sand");
        profile.setKeywords(new String[]{"record"});

        HomeSection archiveSection = new HomeSection();
        archiveSection.setId(archiveSectionId);
        archiveSection.setSectionKind("archive");
        archiveSection.setTitle("Career");

        HomeSection activitySection = new HomeSection();
        activitySection.setId(activitySectionId);
        activitySection.setSectionKind("activity");
        activitySection.setTitle("Activity");

        ArchiveItem archiveItem = new ArchiveItem();
        archiveItem.setId(UUID.randomUUID());
        archiveItem.setSectionId(archiveSectionId);
        archiveItem.setTitle("Backend Engineer");
        archiveItem.setDateText("2026");
        archiveItem.setSummary("Built APIs");
        archiveItem.setFeatured(true);
        archiveItem.setImageBase64("img");
        archiveItem.setLinkUrl("https://example.com");

        CardItem cardItem = new CardItem();
        cardItem.setId(cardId);
        cardItem.setSectionId(activitySectionId);
        cardItem.setTitle("Hackathon");
        cardItem.setDateText("2026");
        cardItem.setSummary("Won a prize");
        cardItem.setFeatured(false);
        cardItem.setThumbnailBase64("thumb");
        cardItem.setLinks(new String[]{"https://card.example.com"});
        cardItem.setTags(new String[]{"java"});
        cardItem.setInfoCards(List.of(Map.<String, Object>of("id", "role", "label", "Role", "value", "Lead")));

        CardBlock cardBlock = new CardBlock();
        cardBlock.setCardId(cardId);
        cardBlock.setBlockType("text");
        cardBlock.setPayload(Map.<String, Object>of("content", "Detailed story", "textType", "body"));

        ContactLink contactLink = new ContactLink();
        contactLink.setId(UUID.randomUUID());
        contactLink.setContactType("email");
        contactLink.setValue("lee@example.com");

        when(userRepo.findByPageUsernameIgnoreCase(username)).thenReturn(Optional.of(user));
        when(profileRepo.findById(username)).thenReturn(Optional.of(profile));
        when(sectionRepo.findByPageUsernameOrderBySortOrder(username)).thenReturn(List.of(archiveSection, activitySection));
        when(archiveRepo.findBySectionIdInOrderBySectionIdAscSortOrderAsc(List.of(archiveSectionId, activitySectionId)))
                .thenReturn(List.of(archiveItem));
        when(cardItemRepo.findBySectionIdInOrderBySectionIdAscSortOrderAsc(List.of(archiveSectionId, activitySectionId)))
                .thenReturn(List.of(cardItem));
        when(cardBlockRepo.findByCardIdInOrderByCardIdAscSortOrderAsc(List.of(cardId)))
                .thenReturn(List.of(cardBlock));
        when(contactRepo.findByPageUsernameOrderBySortOrder(username)).thenReturn(List.of(contactLink));

        SiteContentDto content = contentQueryService.loadContent(username);

        assertThat(content.getHome().getTheme()).isEqualTo("sand");
        assertThat(content.getArchive()).singleElement().satisfies(item -> {
            assertThat(item.getCategory()).isEqualTo("Career");
            assertThat(item.getTitle()).isEqualTo("Backend Engineer");
        });
        assertThat(content.getCards()).singleElement().satisfies(item -> {
            assertThat(item.getType()).isEqualTo("activity");
            assertThat(item.getDetailBlocks()).singleElement().satisfies(block -> {
                assertThat(block.getContent()).isEqualTo("Detailed story");
                assertThat(block.getTextType()).isEqualTo("body");
            });
        });
        assertThat(content.getContact()).singleElement().satisfies(item ->
                assertThat(item.getValue()).isEqualTo("lee@example.com"));

        verify(archiveRepo).findBySectionIdInOrderBySectionIdAscSortOrderAsc(List.of(archiveSectionId, activitySectionId));
        verify(cardItemRepo).findBySectionIdInOrderBySectionIdAscSortOrderAsc(List.of(archiveSectionId, activitySectionId));
        verify(cardBlockRepo).findByCardIdInOrderByCardIdAscSortOrderAsc(List.of(cardId));
        verify(archiveRepo, never()).findBySectionIdOrderBySortOrder(any());
        verify(cardItemRepo, never()).findBySectionIdOrderBySortOrder(any());
        verify(cardBlockRepo, never()).findByCardIdOrderBySortOrder(any());
    }

    @Test
    void loadTheme_returnsBlackWhenProfileThemeIsMissing() {
        String username = "lee";

        SiteUser user = new SiteUser();
        user.setPageUsername(username);

        HomeProfile profile = new HomeProfile();
        profile.setPageUsername(username);
        profile.setDisplayName("Lee");
        profile.setTheme(null);

        when(userRepo.findByPageUsernameIgnoreCase(username)).thenReturn(Optional.of(user));
        when(profileRepo.findById(username)).thenReturn(Optional.of(profile));

        assertThat(contentQueryService.loadTheme(username)).isEqualTo("black");
    }
}
