package org.testautomation.domain;

public class SignInResponse {
    private String token;
    private AuthUserDTO user;
    private String expiresAt;

    public SignInResponse() {
    }

    public SignInResponse(String token, AuthUserDTO user, String expiresAt) {
        this.token = token;
        this.user = user;
        this.expiresAt = expiresAt;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public AuthUserDTO getUser() {
        return user;
    }

    public void setUser(AuthUserDTO user) {
        this.user = user;
    }

    public String getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(String expiresAt) {
        this.expiresAt = expiresAt;
    }
}
