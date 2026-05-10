package org.example.backend.repository;

import org.example.backend.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("""
            SELECT oi.productId,
                   SUM(oi.quantity),
                   SUM(oi.priceAtPurchase * oi.quantity)
            FROM OrderItem oi
            WHERE oi.order.orderDate BETWEEN :start AND :end
            GROUP BY oi.productId
            ORDER BY SUM(oi.quantity) DESC
            """)
    List<Object[]> findTopSellingProducts(@Param("start") LocalDateTime start,
                                          @Param("end") LocalDateTime end);
}
