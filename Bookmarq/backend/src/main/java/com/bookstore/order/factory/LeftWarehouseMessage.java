package com.bookstore.order.factory;

public class LeftWarehouseMessage implements OrderStatusMessage {
    @Override
    public String getTitle() {
        return "Order Left Warehouse";
    }

    @Override
    public String getMessage() {
        return "Your order has left our warehouse and is en route.";
    }
}
