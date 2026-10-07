package com.bookstore.payment.factory;

/**
 * Factory pattern: decides which PaymentMethod to instantiate from the
 * payment type string sent by the client. Callers depend only on the
 * PaymentMethod interface, never on the concrete classes.
 *
 * VIVA NOTE: Unlike the lecture example, unknown types do not return null.
 * They fall back to BankTransferPayment, which keeps the original behaviour
 * (anything other than CARD started as PENDING) and avoids NullPointerExceptions.
 */
public class PaymentMethodFactory {

    public PaymentMethod createPaymentMethod(String type) {
        if ("CARD".equals(type)) {
            return new CardPayment();
        } else {
            return new BankTransferPayment();
        }
    }
}
