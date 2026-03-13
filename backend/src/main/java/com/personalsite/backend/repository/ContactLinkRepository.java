package com.personalsite.backend.repository;

import com.personalsite.backend.entity.ContactLink;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ContactLinkRepository extends JpaRepository<ContactLink, UUID> {
    List<ContactLink> findByPageUsernameOrderBySortOrder(String pageUsername);
    void deleteByPageUsername(String pageUsername);
}
