package org.example.backend.dto;

import java.math.BigDecimal;

public class PaymentOrderResponse {
    private String orderId;
    private String currency;
    private BigDecimal amount;
    private Long amountInPaise;
    private String keyId;

    public PaymentOrderResponse(String orderId, String currency, BigDecimal amount, Long amountInPaise, String keyId) {
        this.orderId = orderId;
        this.currency = currency;
        this.amount = amount;
        this.amountInPaise = amountInPaise;
        this.keyId = keyId;
    }

    public String getOrderId() { return orderId; }
    public String getCurrency() { return currency; }
    public BigDecimal getAmount() { return amount; }
    public Long getAmountInPaise() { return amountInPaise; }
    public String getKeyId() { return keyId; }
}
