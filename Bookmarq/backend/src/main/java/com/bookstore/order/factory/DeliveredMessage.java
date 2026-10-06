package com.bookstore.order.factory;

public class DeliveredMessage implements OrderStatusMessage {
    @Override
    public String getTitle() {
        return "Order Delivered";
    }

    @Override
    public String getMessage() {
        return "Your order has been delivered. Enjoy reading!";
    }
}
