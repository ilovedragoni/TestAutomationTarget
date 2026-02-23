package org.testautomation.domain;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public class CheckoutRequest {

    @NotNull(message = "shipping is required")
    @Valid
    private CheckoutShippingRequest shipping;

    @NotNull(message = "payment is required")
    @Valid
    private CheckoutPaymentRequest payment;

    @NotEmpty(message = "items must not be empty")
    @Valid
    private List<@Valid CheckoutItemRequest> items;

    @NotNull(message = "subtotal is required")
    @DecimalMin(value = "0.00", message = "subtotal must be at least 0")
    private BigDecimal subtotal;

    @NotBlank(message = "currency is required")
    private String currency;

    public CheckoutShippingRequest getShipping() {
        return shipping;
    }

    public void setShipping(CheckoutShippingRequest shipping) {
        this.shipping = shipping;
    }

    public CheckoutPaymentRequest getPayment() {
        return payment;
    }

    public void setPayment(CheckoutPaymentRequest payment) {
        this.payment = payment;
    }

    public List<CheckoutItemRequest> getItems() {
        return items;
    }

    public void setItems(List<CheckoutItemRequest> items) {
        this.items = items;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
}
