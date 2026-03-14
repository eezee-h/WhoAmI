package com.personalsite.backend.repository;

import com.personalsite.backend.entity.CardItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface CardItemRepository extends JpaRepository<CardItem, UUID> {
    List<CardItem> findBySectionIdOrderBySortOrder(UUID sectionId);

    List<CardItem> findBySectionIdInOrderBySectionIdAscSortOrderAsc(Collection<UUID> sectionIds);
}
