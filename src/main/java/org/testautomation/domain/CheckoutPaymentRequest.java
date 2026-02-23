package org.testautomation.domain;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CheckoutPaymentRequest {

    @NotBlank(message = "payment.method is required")
    private String method;

    @Pattern(regexp = "^\\d{13,19}$", message = "cardNumber must be 13 to 19 digits")
    private String cardNumber;

    @Pattern(regexp = "^(0[1-9]|1[0-2])/\\d{2}$", message = "cardExpiry must use MM/YY format")
    private String cardExpiry;

    @Pattern(regexp = "^\\d{3,4}$", message = "cardCvc must be 3 or 4 digits")
    private String cardCvc;

    @Email(message = "paypalEmail must be a valid email")
    @Size(max = 255, message = "paypalEmail is too long")
    private String paypalEmail;

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getCardNumber() {
        return cardNumber;
    }

    public void setCardNumber(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    public String getCardExpiry() {
        return cardExpiry;
    }

    public void setCardExpiry(String cardExpiry) {
        this.cardExpiry = cardExpiry;
    }

    public String getCardCvc() {
        return cardCvc;
    }

    public void setCardCvc(String cardCvc) {
        this.cardCvc = cardCvc;
    }

    public String getPaypalEmail() {
        return paypalEmail;
    }

    public void setPaypalEmail(String paypalEmail) {
        this.paypalEmail = paypalEmail;
    }
}
