package com.bookstore.patterns;

import com.bookstore.payment.factory.BankTransferPayment;
import com.bookstore.payment.factory.CardPayment;
import com.bookstore.payment.factory.PaymentMethodFactory;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PaymentMethodFactoryTest {

    private final PaymentMethodFactory factory = new PaymentMethodFactory();

    @Test
    void cardIsConfirmedImmediately() {
        assertInstanceOf(CardPayment.class, factory.createPaymentMethod("CARD"));
        assertEquals("CONFIRMED", factory.createPaymentMethod("CARD").getInitialPaymentStatus());
    }

    @Test
    void bankTransferStartsPending() {
        assertInstanceOf(BankTransferPayment.class, factory.createPaymentMethod("BANK_TRANSFER"));
        assertEquals("PENDING", factory.createPaymentMethod("BANK_TRANSFER").getInitialPaymentStatus());
    }

    @Test
    void unknownOrNullFallsBackToPendingLikeBefore() {
        assertEquals("PENDING", factory.createPaymentMethod(null).getInitialPaymentStatus());
        assertEquals("PENDING", factory.createPaymentMethod("card").getInitialPaymentStatus());
        assertEquals("PENDING", factory.createPaymentMethod("XYZ").getInitialPaymentStatus());
    }
}
