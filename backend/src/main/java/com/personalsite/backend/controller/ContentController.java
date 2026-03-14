package com.personalsite.backend.controller;

import com.personalsite.backend.dto.AuthDto.SaveContentRequest;
import com.personalsite.backend.dto.AuthDto.SetThemeRequest;
import com.personalsite.backend.dto.SiteContentDto;
import com.personalsite.backend.service.AuthService;
import com.personalsite.backend.service.ContentCommandService;
import com.personalsite.backend.service.ContentQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ContentController {

    private final ContentQueryService contentQueryService;
    private final ContentCommandService contentCommandService;
    private final AuthService authService;

    @GetMapping("/{username}/content")
    public SiteContentDto getContent(@PathVariable String username) {
        return contentQueryService.loadContent(username);
    }

    @PutMapping("/{username}/content")
    public ResponseEntity<?> saveContent(@PathVariable String username, @RequestBody SaveContentRequest req) {
        contentCommandService.saveContent(username, req.getPassword(), req.getContent());
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @GetMapping("/{username}/theme")
    public Map<String, String> getTheme(@PathVariable String username) {
        return Map.of("theme", contentQueryService.loadTheme(username));
    }

    @PutMapping("/{username}/theme")
    public ResponseEntity<?> setTheme(@PathVariable String username, @RequestBody SetThemeRequest req) {
        contentCommandService.setTheme(username, req.getPassword(), req.getTheme());
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @GetMapping("/{username}/exists")
    public Map<String, Boolean> exists(@PathVariable String username) {
        return Map.of("exists", authService.userExists(username));
    }
}
