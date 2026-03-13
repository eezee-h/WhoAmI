package com.personalsite.backend.service;

import com.personalsite.backend.entity.SiteUser;
import com.personalsite.backend.repository.SiteUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final SiteUserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final ContentService contentService;

    @Transactional
    public void register(String pageUsername, String loginId, String password) {
        if (userRepo.existsByPageUsernameIgnoreCase(pageUsername)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용 중인 페이지 이름입니다.");
        }
        if (userRepo.existsByLoginId(loginId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용 중인 아이디입니다.");
        }
        SiteUser user = new SiteUser();
        user.setPageUsername(pageUsername);
        user.setLoginId(loginId);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setCreatedAt(OffsetDateTime.now());
        user.setUpdatedAt(OffsetDateTime.now());
        userRepo.save(user);
        contentService.initDefaultContent(pageUsername);
    }

    public String login(String loginId, String password) {
        SiteUser user = userRepo.findByLoginId(loginId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 올바르지 않습니다."));
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 올바르지 않습니다.");
        }
        return user.getPageUsername();
    }

    public boolean verifyAdmin(String pageUsername, String loginId, String password) {
        SiteUser user = userRepo.findByPageUsernameIgnoreCase(pageUsername).orElse(null);
        if (user == null) return false;
        return user.getLoginId().equals(loginId) && passwordEncoder.matches(password, user.getPasswordHash());
    }

    public boolean userExists(String pageUsername) {
        return userRepo.existsByPageUsernameIgnoreCase(pageUsername);
    }

    public boolean loginIdTaken(String loginId) {
        return userRepo.existsByLoginId(loginId);
    }

    @Transactional
    public void deleteUser(String pageUsername, String password) {
        SiteUser user = userRepo.findByPageUsernameIgnoreCase(pageUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "비밀번호가 올바르지 않습니다.");
        }
        userRepo.delete(user);
    }
}
