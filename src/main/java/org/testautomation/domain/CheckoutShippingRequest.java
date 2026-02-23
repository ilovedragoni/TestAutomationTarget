package org.testautomation.domain;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CheckoutShippingRequest {

    @NotBlank(message = "fullName is required")
    @Size(max = 255, message = "fullName is too long")
    private String fullName;

    @NotBlank(message = "email is required")
    @Email(message = "email must be a valid email")
    @Size(max = 255, message = "email is too long")
    private String email;

    @NotBlank(message = "address is required")
    @Size(max = 255, message = "address is too long")
    private String address;

    @NotBlank(message = "city is required")
    @Size(max = 255, message = "city is too long")
    private String city;

    @NotBlank(message = "postalCode is required")
    @Size(max = 32, message = "postalCode is too long")
    private String postalCode;

    @NotBlank(message = "country is required")
    @Size(max = 255, message = "country is too long")
    private String country;

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }
}
