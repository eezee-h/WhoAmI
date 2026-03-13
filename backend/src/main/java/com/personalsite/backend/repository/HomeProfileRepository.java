package com.personalsite.backend.repository;

import com.personalsite.backend.entity.HomeProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HomeProfileRepository extends JpaRepository<HomeProfile, String> {
}
