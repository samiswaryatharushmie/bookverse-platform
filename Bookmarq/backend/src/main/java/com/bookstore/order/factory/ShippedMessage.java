package com.bookstore.order.factory;

public class ShippedMessage implements OrderStatusMessage {
    @Override
    public String getTitle() {
        return "Order Shipped!";
    }

    @Override
    public String getMessage() {
        return "Good news! Your order is on its way.";
    }
}
