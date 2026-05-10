package org.example.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderReportDTO {
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Double totalSales;
    private Long totalOrders;
    private Double averageOrderValue;
    private List<OrderSummaryDTO> orders;
    private List<TopProductDTO> topProducts;

    @Data
    public static class OrderSummaryDTO {
        private Long orderId;
        private Long userId;
        private Double totalAmount;
        private String status;
        private LocalDateTime orderDate;
    }

    @Data
    public static class TopProductDTO {
        private Long productId;
        private Long totalQuantitySold;
        private Double totalRevenue;
    }
}