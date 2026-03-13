package com.personalsite.backend.repository;

import com.personalsite.backend.entity.SiteUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SiteUserRepository extends JpaRepository<SiteUser, String> {
    Optional<SiteUser> findByLoginId(String loginId);
    boolean existsByLoginId(String loginId);
    boolean existsByPageUsernameIgnoreCase(String pageUsername);
    Optional<SiteUser> findByPageUsernameIgnoreCase(String pageUsername);
}
