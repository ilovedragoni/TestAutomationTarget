package org.testautomation.domain;

public class UserAddressResponse {

    private Long id;
    private String label;
    private String fullName;
    private String email;
    private String address;
    private String city;
    private String postalCode;
    private String country;
    private boolean isDefault;

    public UserAddressResponse() {
    }

    public UserAddressResponse(
            Long id,
            String label,
            String fullName,
            String email,
            String address,
            String city,
            String postalCode,
            String country,
            boolean isDefault
    ) {
        this.id = id;
        this.label = label;
        this.fullName = fullName;
        this.email = email;
        this.address = address;
        this.city = city;
        this.postalCode = postalCode;
        this.country = country;
        this.isDefault = isDefault;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

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

    public boolean isDefault() {
        return isDefault;
    }

    public void setDefault(boolean aDefault) {
        isDefault = aDefault;
    }
}
