package com.personalsite.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

public class AuthDto {

    @Getter
    @Setter
    @NoArgsConstructor
    public static class RegisterRequest {
        private String username;
        private String loginId;
        private String password;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class LoginRequest {
        private String loginId;
        private String password;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class AdminVerifyRequest {
        private String loginId;
        private String password;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class DeleteRequest {
        private String password;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class SaveContentRequest {
        private String password;
        private SiteContentDto content;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class SetThemeRequest {
        private String password;
        private String theme;
    }
}
