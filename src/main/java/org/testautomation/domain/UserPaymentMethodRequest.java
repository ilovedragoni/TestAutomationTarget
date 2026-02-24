package org.testautomation.domain;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UserPaymentMethodRequest {

    @NotBlank(message = "label is required")
    @Size(max = 120, message = "label is too long")
    private String label;

    @NotBlank(message = "method is required")
    private String method;

    @Pattern(regexp = "^\\d{4}$", message = "cardLast4 must be 4 digits")
    private String cardLast4;

    @Pattern(regexp = "^(0[1-9]|1[0-2])/\\d{2}$", message = "cardExpiry must use MM/YY format")
    private String cardExpiry;

    @Email(message = "paypalEmail must be valid")
    @Size(max = 255, message = "paypalEmail is too long")
    private String paypalEmail;

    private boolean isDefault;

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getCardLast4() {
        return cardLast4;
    }

    public void setCardLast4(String cardLast4) {
        this.cardLast4 = cardLast4;
    }

    public String getCardExpiry() {
        return cardExpiry;
    }

    public void setCardExpiry(String cardExpiry) {
        this.cardExpiry = cardExpiry;
    }

    public String getPaypalEmail() {
        return paypalEmail;
    }

    public void setPaypalEmail(String paypalEmail) {
        this.paypalEmail = paypalEmail;
    }

    public boolean isDefault() {
        return isDefault;
    }

    public void setDefault(boolean aDefault) {
        isDefault = aDefault;
    }
}
