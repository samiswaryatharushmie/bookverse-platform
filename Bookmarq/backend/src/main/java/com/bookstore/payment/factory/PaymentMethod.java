package com.bookstore.payment.factory;

/**
 * Product interface for the Factory pattern.
 * Every supported payment method exposes its code and the payment status
 * a freshly placed order should start with.
 */
public interface PaymentMethod {
    String getCode();
    String getInitialPaymentStatus();
}
