package com.personalsite.backend.repository;

import com.personalsite.backend.entity.ArchiveItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface ArchiveItemRepository extends JpaRepository<ArchiveItem, UUID> {
    List<ArchiveItem> findBySectionIdOrderBySortOrder(UUID sectionId);

    List<ArchiveItem> findBySectionIdInOrderBySectionIdAscSortOrderAsc(Collection<UUID> sectionIds);
}
