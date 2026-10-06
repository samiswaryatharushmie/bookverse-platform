package com.bookstore.order.factory;

/**
 * Factory pattern: picks the OrderStatusMessage for a new order status.
 * Adding a message for a new status means adding one class and one branch here,
 * with no change to OrderService.
 */
public class OrderStatusMessageFactory {

    public OrderStatusMessage createMessage(String status) {
        if ("SHIPPED".equals(status)) {
            return new ShippedMessage();
        } else if ("LEFT_WAREHOUSE".equals(status)) {
            return new LeftWarehouseMessage();
        } else if ("DELIVERED".equals(status)) {
            return new DeliveredMessage();
        } else {
            return new DefaultStatusMessage(status);
        }
    }
}
