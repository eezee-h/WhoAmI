package com.personalsite.backend.dto;

import lombok.Data;

public class AuthDto {

    @Data
    public static class RegisterRequest {
        private String username;
        private String loginId;
        private String password;
    }

    @Data
    public static class LoginRequest {
        private String loginId;
        private String password;
    }

    @Data
    public static class AdminVerifyRequest {
        private String loginId;
        private String password;
    }

    @Data
    public static class DeleteRequest {
        private String password;
    }

    @Data
    public static class SaveContentRequest {
        private String password;
        private SiteContentDto content;
    }

    @Data
    public static class SetThemeRequest {
        private String password;
        private String theme;
    }
}
