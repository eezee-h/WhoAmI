package com.personalsite.backend.repository;

import com.personalsite.backend.entity.CardBlock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface CardBlockRepository extends JpaRepository<CardBlock, UUID> {
    List<CardBlock> findByCardIdOrderBySortOrder(UUID cardId);

    List<CardBlock> findByCardIdInOrderByCardIdAscSortOrderAsc(Collection<UUID> cardIds);
}
