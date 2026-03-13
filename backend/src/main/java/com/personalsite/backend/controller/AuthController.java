package com.personalsite.backend.controller;

import com.personalsite.backend.dto.AuthDto.*;
import com.personalsite.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        authService.register(req.getUsername(), req.getLoginId(), req.getPassword());
        return ResponseEntity.ok(Map.of("pageUsername", req.getUsername()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        String pageUsername = authService.login(req.getLoginId(), req.getPassword());
        return ResponseEntity.ok(Map.of("pageUsername", pageUsername));
    }

    @PostMapping("/{username}/verify")
    public ResponseEntity<?> verify(@PathVariable String username, @RequestBody AdminVerifyRequest req) {
        boolean ok = authService.verifyAdmin(username, req.getLoginId(), req.getPassword());
        if (ok) return ResponseEntity.ok(Map.of("ok", true));
        return ResponseEntity.status(401).body(Map.of("ok", false));
    }

    @DeleteMapping("/{username}")
    public ResponseEntity<?> deleteUser(@PathVariable String username, @RequestBody DeleteRequest req) {
        authService.deleteUser(username, req.getPassword());
        return ResponseEntity.ok(Map.of("ok", true));
    }
}
