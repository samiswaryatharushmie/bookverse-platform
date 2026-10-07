package com.bookstore.payment.service;

import com.bookstore.common.exception.BadRequestException;
import com.bookstore.common.exception.ResourceNotFoundException;
import com.bookstore.order.dto.OrderDto;
import com.bookstore.order.entity.Order;
import com.bookstore.order.entity.OrderStatusHistory;
import com.bookstore.order.mapper.OrderMapper;
import com.bookstore.order.repository.OrderRepository;
import com.bookstore.order.repository.OrderStatusHistoryRepository;
import com.bookstore.payment.factory.PaymentMethodFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository historyRepository;
    private final OrderMapper orderMapper;
    // Initialised inline, so Lombok leaves it out of the injected constructor
    private final PaymentMethodFactory paymentMethodFactory = new PaymentMethodFactory();

    /** Payment status a freshly placed order should start with, based on its payment method. */
    public String determineInitialPaymentStatus(String paymentMethod) {
        return paymentMethodFactory.createPaymentMethod(paymentMethod).getInitialPaymentStatus();
    }

    @Transactional
    public OrderDto updatePaymentStatus(UUID orderId, String paymentStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.setPaymentStatus(paymentStatus);
        return orderMapper.toDto(orderRepository.save(order));
    }

    @Transactional
    public OrderDto uploadPaymentReceipt(UUID orderId, String receiptUrl) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.setPaymentReceiptUrl(receiptUrl);
        return orderMapper.toDto(orderRepository.save(order));
    }

    @Transactional
    public OrderDto refundOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!"CONFIRMED".equals(order.getPaymentStatus())) {
            throw new BadRequestException("Only confirmed payments can be refunded");
        }

        order.setPaymentStatus("REFUNDED");

        String oldStatus = order.getStatus();
        order.setStatus("CANCELLED");

        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setOldStatus(oldStatus);
        history.setNewStatus("CANCELLED");
        history.setNote("Order refunded by admin");
        historyRepository.save(history);

        return orderMapper.toDto(orderRepository.save(order));
    }
}
