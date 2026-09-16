package com.personalsite.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.personalsite.backend.dto.SiteContentDto;
import com.personalsite.backend.entity.CardBlock;
import com.personalsite.backend.entity.CardItem;
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
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ContentImageRoundTripTest {
    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {"small", "medium", "full"})
    void imageSizeSurvivesSaveLoadAndJsonSerialization(String imageSize) throws Exception {
        SiteUserRepository users = mock(SiteUserRepository.class);
        HomeProfileRepository profiles = mock(HomeProfileRepository.class);
        HomeSectionRepository sections = mock(HomeSectionRepository.class);
        ArchiveItemRepository archives = mock(ArchiveItemRepository.class);
        CardItemRepository cards = mock(CardItemRepository.class);
        CardBlockRepository blocks = mock(CardBlockRepository.class);
        ContactLinkRepository contacts = mock(ContactLinkRepository.class);
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        SiteUser user = new SiteUser();
        user.setPageUsername("image-test");
        user.setPasswordHash("test-hash");
        HomeProfile profile = new HomeProfile();
        List<HomeSection> savedSections = new ArrayList<>();
        List<CardItem> savedCards = new ArrayList<>();
        List<CardBlock> savedBlocks = new ArrayList<>();

        when(users.findByPageUsernameIgnoreCase("image-test")).thenReturn(Optional.of(user));
        when(encoder.matches("test-password", "test-hash")).thenReturn(true);
        when(profiles.findById("image-test")).thenReturn(Optional.of(profile));
        when(sections.save(any())).thenAnswer(invocation -> {
            HomeSection section = invocation.getArgument(0);
            section.setId(UUID.randomUUID());
            savedSections.add(section);
            return section;
        });
        when(cards.save(any())).thenAnswer(invocation -> {
            CardItem card = invocation.getArgument(0);
            card.setId(UUID.randomUUID());
            savedCards.add(card);
            return card;
        });
        when(blocks.save(any())).thenAnswer(invocation -> {
            CardBlock block = invocation.getArgument(0);
            savedBlocks.add(block);
            return block;
        });
        when(sections.findByPageUsernameOrderBySortOrder("image-test")).thenReturn(savedSections);
        when(cards.findBySectionIdInOrderBySectionIdAscSortOrderAsc(any())).thenReturn(savedCards);
        when(blocks.findByCardIdInOrderByCardIdAscSortOrderAsc(any())).thenReturn(savedBlocks);

        SiteContentDto input = SiteContentDto.builder()
                .homeSections(List.of(SiteContentDto.HomeSectionDto.builder().type("project").name("프로젝트").build()))
                .cards(List.of(SiteContentDto.CardItemDto.builder().type("project").title("사진")
                        .detailBlocks(List.of(SiteContentDto.DetailBlockDto.builder()
                                .type("image").content("data:image/png;base64,fixture")
                                .span("half").imageSize(imageSize).build())).build()))
                .build();
        ObjectMapper mapper = new ObjectMapper();
        SiteContentDto request = mapper.readValue(mapper.writeValueAsString(input), SiteContentDto.class);
        new ContentCommandService(users, profiles, sections, archives, cards, blocks, contacts, encoder)
                .saveContent("image-test", "test-password", request);
        SiteContentDto loaded = new ContentQueryService(users, profiles, sections, archives, cards, blocks, contacts)
                .loadContent("image-test");
        SiteContentDto response = mapper.readValue(mapper.writeValueAsString(loaded), SiteContentDto.class);

        assertThat(response.getCards()).singleElement().satisfies(card ->
                assertThat(card.getDetailBlocks()).singleElement().satisfies(block -> {
                    assertThat(block.getType()).isEqualTo("image");
                    assertThat(block.getContent()).isEqualTo("data:image/png;base64,fixture");
                    assertThat(block.getSpan()).isEqualTo("half");
                    assertThat(block.getImageSize()).isEqualTo(imageSize);
                }));
        if (imageSize == null) {
            assertThat(savedBlocks.getFirst().getPayload()).doesNotContainKey("imageSize");
        }
    }
}
