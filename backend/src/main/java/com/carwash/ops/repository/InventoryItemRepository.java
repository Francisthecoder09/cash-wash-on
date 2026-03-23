package com.carwash.ops.repository;

import com.carwash.ops.domain.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {

    List<InventoryItem> findByActiveTrue();

    List<InventoryItem> findByBranch_Id(Long branchId);

    List<InventoryItem> findByCategory(String category);

    @Query("SELECT i FROM InventoryItem i WHERE i.currentStock <= i.minStockLevel AND i.active = true")
    List<InventoryItem> findLowStockItems();

    @Query("SELECT i FROM InventoryItem i WHERE i.branch.id = :branchId AND i.currentStock <= i.minStockLevel AND i.active = true")
    List<InventoryItem> findLowStockByBranch(@Param("branchId") Long branchId);
}
