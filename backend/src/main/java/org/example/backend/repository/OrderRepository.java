package org.example.backend.repository;

import org.example.backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    List<Order> findByUserId(Long userId);

    // For daily sales summary (native query)
    @Query(value = "SELECT DATE(o.order_date) as date, COUNT(o.order_id) as orders, SUM(o.total_amount) as sales " +
            "FROM orders o WHERE o.order_date BETWEEN :start AND :end " +
            "GROUP BY DATE(o.order_date) ORDER BY date DESC", nativeQuery = true)
    List<Object[]> getDailySalesSummary(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
