package com.bookstore.order.factory;

/** Generic message for any status without a dedicated message class. */
public class DefaultStatusMessage implements OrderStatusMessage {
    private final String status;

    public DefaultStatusMessage(String status) {
        this.status = status;
    }

    @Override
    public String getTitle() {
        return "Order Update: " + status;
    }

    @Override
    public String getMessage() {
        return "Your order status has been updated to " + status + ".";
    }
}
