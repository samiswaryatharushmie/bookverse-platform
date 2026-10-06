package com.bookstore.order.entity;

import com.bookstore.common.AuditableEntity;
import com.bookstore.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Getter
@Setter
public class Order extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 30, unique = true)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 20)
    private String status = "ORDER_PLACED";

    @Column(nullable = false, length = 20)
    private String paymentStatus = "PENDING"; // PENDING | CONFIRMED

    @Column(length = 20)
    private String paymentMethod; // CARD | BANK_TRANSFER

    @Column(length = 500)
    private String paymentReceiptUrl;

    @Column(nullable = false)
    private BigDecimal subtotal;

    @Column(nullable = false)
    private BigDecimal discountTotal = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal taxTotal = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal shippingFee = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal grandTotal;

    @Column(length = 4000)
    private String shippingAddressSnapshot;

    private UUID promotionId;

    @Column(length = 500)
    private String notes;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }
}
