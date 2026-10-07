package com.bookstore.payment.factory;

/** Card payments are captured at checkout, so the order starts CONFIRMED. */
public class CardPayment implements PaymentMethod {
    @Override
    public String getCode() {
        return "CARD";
    }

    @Override
    public String getInitialPaymentStatus() {
        return "CONFIRMED";
    }
}
