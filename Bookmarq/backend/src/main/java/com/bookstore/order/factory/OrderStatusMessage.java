package com.bookstore.order.factory;

/** Product interface for the Factory pattern: the notification text for an order status change. */
public interface OrderStatusMessage {
    String getTitle();
    String getMessage();
}
