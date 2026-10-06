package com.bookstore.order.service;

import com.bookstore.common.exception.BadRequestException;
import com.bookstore.common.exception.ResourceNotFoundException;
import com.bookstore.inventory.service.InventoryService;
import com.bookstore.order.dto.CheckoutRequest;
import com.bookstore.order.dto.OrderDto;
import com.bookstore.order.entity.Cart;
import com.bookstore.order.entity.CartItem;
import com.bookstore.order.entity.Order;
import com.bookstore.order.entity.OrderItem;
import com.bookstore.order.entity.OrderStatusHistory;
import com.bookstore.order.factory.OrderStatusMessage;
import com.bookstore.order.factory.OrderStatusMessageFactory;
import com.bookstore.order.mapper.OrderMapper;
import com.bookstore.order.repository.CartRepository;
import com.bookstore.order.repository.OrderRepository;
import com.bookstore.order.repository.OrderStatusHistoryRepository;
import com.bookstore.payment.service.PaymentService;
import com.bookstore.user.entity.User;
import com.bookstore.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;
import com.bookstore.user.service.NotificationService;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final OrderStatusHistoryRepository historyRepository;
    private final InventoryService inventoryService;
    private final OrderMapper orderMapper;
    private final PromotionService promotionService;
    private final NotificationService notificationService;
    private final PaymentService paymentService;
    private final JdbcTemplate jdbcTemplate;
    // Initialised inline, so Lombok leaves it out of the injected constructor
    private final OrderStatusMessageFactory orderStatusMessageFactory = new OrderStatusMessageFactory();

    private static final BigDecimal TAX_RATE = new BigDecimal("0.15");
    private static final BigDecimal FLAT_SHIPPING = new BigDecimal("1200.00");

    @Transactional
    public OrderDto checkout(UUID userId, CheckoutRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 1. Calculate totals
        BigDecimal subtotal = BigDecimal.ZERO;
        for (CartItem item : cart.getItems()) {
            subtotal = subtotal.add(item.getUnitPriceSnapshot().multiply(new BigDecimal(item.getQuantity())));
        }

        BigDecimal discountTotal = BigDecimal.ZERO;
        if (request.getPromoCode() != null && !request.getPromoCode().isBlank()) {
            BigDecimal discountPercentage = promotionService.validateCode(request.getPromoCode());
            discountTotal = subtotal.multiply(discountPercentage).divide(new BigDecimal("100"));
        }

        BigDecimal taxTotal = subtotal.subtract(discountTotal).multiply(TAX_RATE);
        BigDecimal shippingFee = FLAT_SHIPPING;
        BigDecimal grandTotal = subtotal.subtract(discountTotal).add(taxTotal).add(shippingFee);

        // 2. Create Order
        Order order = new Order();
        order.setOrderNumber(request.getOrderNumber() != null && !request.getOrderNumber().isEmpty() ? request.getOrderNumber() : generateOrderNumber());
        order.setUser(user);
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "BANK_TRANSFER");
        
        order.setStatus("ORDER_PLACED");
        order.setPaymentStatus(paymentService.determineInitialPaymentStatus(order.getPaymentMethod()));

        order.setSubtotal(subtotal);
        order.setDiscountTotal(discountTotal);
        order.setTaxTotal(taxTotal);
        order.setShippingFee(shippingFee);
        order.setGrandTotal(grandTotal);
        order.setShippingAddressSnapshot(request.getShippingAddress());
        order.setNotes(request.getNotes());

        // 3. Map items and Reserve Stock
        for (CartItem ci : cart.getItems()) {
            // Reserve stock synchronously. If it fails, an exception is thrown, rolling back the transaction.
            inventoryService.reserveStock(ci.getBook().getId(), ci.getQuantity(), order.getId());

            OrderItem oi = new OrderItem();
            oi.setBook(ci.getBook());
            oi.setQuantity(ci.getQuantity());
            oi.setUnitPrice(ci.getUnitPriceSnapshot());
            oi.setTotal(ci.getUnitPriceSnapshot().multiply(new BigDecimal(ci.getQuantity())));
            order.addItem(oi);
        }

        Order savedOrder = orderRepository.save(order);

        // 4. Save History
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(savedOrder);
        history.setNewStatus(savedOrder.getStatus());
        history.setNote("Order placed via checkout");
        historyRepository.save(history);

        // 5. Clear Cart
        cart.getItems().clear();
        cartRepository.save(cart);

        // 6. Increment Promo Usage
        if (request.getPromoCode() != null && !request.getPromoCode().isBlank()) {
            promotionService.incrementUsage(request.getPromoCode());
        }

        return orderMapper.toDto(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getMyOrders(UUID userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(orderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(orderMapper::toDto)
                .collect(Collectors.toList());
    }

    /** Forward-only fulfillment pipeline, matching the admin dashboard's delivery-steps slider. */
    private static final java.util.List<String> DELIVERY_STEPS = java.util.List.of(
            "ORDER_PLACED", "PACKING", "LEFT_WAREHOUSE", "HANDED_TO_COURIER", "OUT_FOR_DELIVERY", "DELIVERED"
    );

    private void validateStatusTransition(String oldStatus, String newStatus) {
        if (newStatus.equals(oldStatus)) {
            return;
        }
        if ("CANCELLED".equals(oldStatus) || "DELIVERED".equals(oldStatus) || "REFUNDED".equals(oldStatus)) {
            throw new BadRequestException("Order is already in a terminal state (" + oldStatus + ") and cannot be changed");
        }
        if ("CANCELLED".equals(newStatus)) {
            return; // cancellation is allowed from any non-terminal state
        }
        int oldIdx = DELIVERY_STEPS.indexOf(oldStatus);
        int newIdx = DELIVERY_STEPS.indexOf(newStatus);
        if (newIdx < 0) {
            throw new BadRequestException("Unknown order status: " + newStatus);
        }
        if (oldIdx < 0 || newIdx <= oldIdx) {
            throw new BadRequestException("Cannot move order status from " + oldStatus + " to " + newStatus);
        }
    }

    @Transactional
    public OrderDto updateOrderStatus(UUID orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        String oldStatus = order.getStatus();
        validateStatusTransition(oldStatus, newStatus);
        order.setStatus(newStatus);

        // Reserved stock is deducted once the order reaches or passes LEFT_WAREHOUSE
        // (steps may be skipped), and released on cancel only if it was never deducted.
        int leftWarehouseIdx = DELIVERY_STEPS.indexOf("LEFT_WAREHOUSE");
        boolean wasDeducted = DELIVERY_STEPS.indexOf(oldStatus) >= leftWarehouseIdx;
        if ("CANCELLED".equals(newStatus)) {
            if (!wasDeducted) {
                for (OrderItem item : order.getItems()) {
                    inventoryService.releaseStock(item.getBook().getId(), item.getQuantity(), order.getId());
                }
            }
        } else if (!wasDeducted && DELIVERY_STEPS.indexOf(newStatus) >= leftWarehouseIdx) {
            UUID systemUserId = UUID.randomUUID(); // Mock system user
            for (OrderItem item : order.getItems()) {
                inventoryService.deductStock(item.getBook().getId(), item.getQuantity(), order.getId(), systemUserId);
            }
        }

        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setOldStatus(oldStatus);
        history.setNewStatus(newStatus);
        history.setNote("Status updated by staff");
        historyRepository.save(history);
        
        if (!newStatus.equals(oldStatus)) {
            OrderStatusMessage statusMessage = orderStatusMessageFactory.createMessage(newStatus);

            notificationService.createNotification(
                    order.getUser().getId(),
                    "ORDER_UPDATE",
                    statusMessage.getTitle(),
                    statusMessage.getMessage(),
                    "/profile/orders"
            );
        }

        return orderMapper.toDto(orderRepository.save(order));
    }

    @Transactional
    public OrderDto cancelMyOrder(UUID userId, UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("Not authorized to cancel this order");
        }
        
        if (!"ORDER_PLACED".equals(order.getStatus())) {
            throw new BadRequestException("Order cannot be cancelled at this stage");
        }

        String oldStatus = order.getStatus();
        order.setStatus("CANCELLED");

        // Release reserved stock
        for (OrderItem item : order.getItems()) {
            inventoryService.releaseStock(item.getBook().getId(), item.getQuantity(), order.getId());
        }

        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setOldStatus(oldStatus);
        history.setNewStatus("CANCELLED");
        history.setNote("Order cancelled by customer");
        historyRepository.save(history);

        return orderMapper.toDto(orderRepository.save(order));
    }

    private String generateOrderNumber() {
        return "ORD-" + System.currentTimeMillis();
    }

    @Transactional
    public void deleteOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        String status = order.getStatus();
        if (!"COMPLETED".equals(status) && !"DELIVERED".equals(status) && !"CANCELLED".equals(status) && !"REFUNDED".equals(status)) {
            throw new BadRequestException("Only completed, delivered, refunded, or cancelled orders can be deleted");
        }

        // Use JdbcTemplate for cascading hard deletes
        jdbcTemplate.update("DELETE FROM order_status_history WHERE order_id = ?", orderId);
        jdbcTemplate.update("DELETE FROM order_items WHERE order_id = ?", orderId);
        jdbcTemplate.update("DELETE FROM ticket_messages WHERE ticket_id IN (SELECT id FROM support_tickets WHERE order_id = ?)", orderId);
        jdbcTemplate.update("DELETE FROM support_tickets WHERE order_id = ?", orderId);
        
        orderRepository.delete(order);
    }
}
