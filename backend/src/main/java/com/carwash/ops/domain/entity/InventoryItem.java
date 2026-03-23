package com.carwash.ops.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItem extends BaseEntity {

    @Column(nullable = false)
    private String itemName;

    @Column(length = 1000)
    private String description;

    @Column(name = "item_category")
    private String category; // SOAP, WAX, TOWELS, CHEMICALS, EQUIPMENT

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_of_measure")
    private String unitOfMeasure; // LITERS, PIECES, KG, BOXES

    @Column(name = "min_stock_level")
    private Integer minStockLevel;

    @Column(name = "current_stock", nullable = false)
    private Integer currentStock;

    @Column(name = "unit_cost", precision = 10, scale = 2)
    private BigDecimal unitCost;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    @Column(name = "last_restock_date")
    private LocalDateTime lastRestockDate;

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;

    @Column(nullable = false)
    private Boolean active = true;
}
