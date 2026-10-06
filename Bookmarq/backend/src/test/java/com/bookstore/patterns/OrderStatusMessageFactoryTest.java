package com.bookstore.patterns;

import com.bookstore.order.factory.OrderStatusMessage;
import com.bookstore.order.factory.OrderStatusMessageFactory;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class OrderStatusMessageFactoryTest {

    private final OrderStatusMessageFactory factory = new OrderStatusMessageFactory();

    private void assertMessage(String status, String title, String message) {
        OrderStatusMessage m = factory.createMessage(status);
        assertEquals(title, m.getTitle());
        assertEquals(message, m.getMessage());
    }

    @Test
    void producesSameTextsAsBeforeRefactor() {
        assertMessage("SHIPPED", "Order Shipped!", "Good news! Your order is on its way.");
        assertMessage("LEFT_WAREHOUSE", "Order Left Warehouse", "Your order has left our warehouse and is en route.");
        assertMessage("DELIVERED", "Order Delivered", "Your order has been delivered. Enjoy reading!");
        assertMessage("PROCESSING", "Order Update: PROCESSING", "Your order status has been updated to PROCESSING.");
    }
}
