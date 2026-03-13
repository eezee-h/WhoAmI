package com.personalsite.backend.repository;

import com.personalsite.backend.entity.HomeSection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HomeSectionRepository extends JpaRepository<HomeSection, UUID> {
    List<HomeSection> findByPageUsernameOrderBySortOrder(String pageUsername);
    void deleteByPageUsername(String pageUsername);
}
