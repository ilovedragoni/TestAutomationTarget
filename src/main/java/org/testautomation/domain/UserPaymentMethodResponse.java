package org.testautomation.domain;

public class UserPaymentMethodResponse {

    private Long id;
    private String label;
    private String method;
    private String cardLast4;
    private String cardExpiry;
    private String paypalEmail;
    private boolean isDefault;

    public UserPaymentMethodResponse() {
    }

    public UserPaymentMethodResponse(
            Long id,
            String label,
            String method,
            String cardLast4,
            String cardExpiry,
            String paypalEmail,
            boolean isDefault
    ) {
        this.id = id;
        this.label = label;
        this.method = method;
        this.cardLast4 = cardLast4;
        this.cardExpiry = cardExpiry;
        this.paypalEmail = paypalEmail;
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
