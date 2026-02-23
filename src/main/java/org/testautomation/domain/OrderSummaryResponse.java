package org.testautomation.domain;

import java.math.BigDecimal;
import java.util.List;

public class OrderSummaryResponse {

    private String orderId;
    private String status;
    private String createdAt;
    private String currency;
    private BigDecimal subtotal;
    private List<OrderItemResponse> items;

    public OrderSummaryResponse() {
    }

    public OrderSummaryResponse(
            String orderId,
            String status,
            String createdAt,
            String currency,
            BigDecimal subtotal,
            List<OrderItemResponse> items
    ) {
        this.orderId = orderId;
        this.status = status;
        this.createdAt = createdAt;
        this.currency = currency;
        this.subtotal = subtotal;
        this.items = items;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public List<OrderItemResponse> getItems() {
        return items;
    }

    public void setItems(List<OrderItemResponse> items) {
        this.items = items;
    }
}
