package com.bookstore.payment.factory;

/** Bank transfers need a receipt to be verified, so the order starts PENDING. */
public class BankTransferPayment implements PaymentMethod {
    @Override
    public String getCode() {
        return "BANK_TRANSFER";
    }

    @Override
    public String getInitialPaymentStatus() {
        return "PENDING";
    }
}
