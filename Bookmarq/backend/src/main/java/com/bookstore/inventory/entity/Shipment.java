package com.bookstore.inventory.entity;

import com.bookstore.common.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "shipments")
@Getter
@Setter
public class Shipment extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(nullable = false, length = 20)
    private String status = "PENDING"; // PENDING, IN_TRANSIT, RECEIVED, CANCELLED

    @Column(length = 100)
    private String trackingNumber;

    private LocalDate expectedDate;

    private LocalDate receivedDate;

    private UUID receivedBy;

    @Column(length = 500)
    private String notes;

    @OneToMany(mappedBy = "shipment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ShipmentItem> items = new ArrayList<>();
    
    public void addItem(ShipmentItem item) {
        items.add(item);
        item.setShipment(this);
    }
}
