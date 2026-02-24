package org.testautomation.domain;

import jakarta.validation.constraints.NotBlank;

public class UserAccountDeleteRequest {

    @NotBlank(message = "currentPassword is required")
    private String currentPassword;

    public String getCurrentPassword() {
        return currentPassword;
    }

    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }
}
