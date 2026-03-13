package com.personalsite.backend.controller;

import com.personalsite.backend.dto.AuthDto.SaveContentRequest;
import com.personalsite.backend.dto.AuthDto.SetThemeRequest;
import com.personalsite.backend.dto.SiteContentDto;
import com.personalsite.backend.service.AuthService;
import com.personalsite.backend.service.ContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;
    private final AuthService authService;

    @GetMapping("/{username}/content")
    public SiteContentDto getContent(@PathVariable String username) {
        return contentService.loadContent(username);
    }

    @PutMapping("/{username}/content")
    public ResponseEntity<?> saveContent(@PathVariable String username, @RequestBody SaveContentRequest req) {
        contentService.saveContent(username, req.getPassword(), req.getContent());
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @GetMapping("/{username}/theme")
    public Map<String, String> getTheme(@PathVariable String username) {
        return Map.of("theme", contentService.loadContent(username).getHome().getTheme());
    }

    @PutMapping("/{username}/theme")
    public ResponseEntity<?> setTheme(@PathVariable String username, @RequestBody SetThemeRequest req) {
        contentService.setTheme(username, req.getPassword(), req.getTheme());
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @GetMapping("/{username}/exists")
    public Map<String, Boolean> exists(@PathVariable String username) {
        return Map.of("exists", authService.userExists(username));
    }
}
