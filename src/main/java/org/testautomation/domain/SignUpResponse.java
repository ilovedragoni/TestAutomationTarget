package org.testautomation.domain;

public class SignUpResponse {
    private AuthUserDTO user;
    private String message;

    public SignUpResponse() {
    }

    public SignUpResponse(AuthUserDTO user, String message) {
        this.user = user;
        this.message = message;
    }

    public AuthUserDTO getUser() {
        return user;
    }

    public void setUser(AuthUserDTO user) {
        this.user = user;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
