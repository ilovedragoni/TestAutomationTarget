package org.testautomation.domain;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UserAccountUpdateRequest {

    @NotBlank(message = "name is required")
    @Size(max = 255, message = "name is too long")
    private String name;

    @NotBlank(message = "email is required")
    @Email(message = "email must be valid")
    @Size(max = 255, message = "email is too long")
    private String email;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
