package org.example.backend.service;

import org.example.backend.dto.OrderReportDTO;
import org.example.backend.model.Order;
import org.example.backend.repository.OrderRepository;
import org.example.backend.repository.OrderItemRepository;
import org.example.backend.specification.OrderSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    public OrderReportDTO getDynamicOrderReport(LocalDateTime startDate, LocalDateTime endDate,
                                                String status, Double minAmount, Double maxAmount, Long userId) {
        Specification<Order> spec = Specification
                .where(OrderSpecification.orderDateBetween(startDate, endDate))
                .and(OrderSpecification.hasStatus(status))
                .and(OrderSpecification.totalAmountBetween(minAmount, maxAmount))
                .and(OrderSpecification.userIdEquals(userId));

        List<Order> orders = orderRepository.findAll(spec);

        double totalSales = orders.stream()
                .map(Order::getTotalAmount)
                .map(BigDecimal::doubleValue)
                .mapToDouble(Double::doubleValue)
                .sum();

        long totalOrders = orders.size();
        double avgOrderValue = totalOrders == 0 ? 0 : totalSales / totalOrders;

        List<OrderReportDTO.OrderSummaryDTO> orderSummaries = orders.stream()
                .map(o -> {
                    OrderReportDTO.OrderSummaryDTO dto = new OrderReportDTO.OrderSummaryDTO();
                    dto.setOrderId(o.getOrderId());
                    dto.setUserId(o.getUserId());
                    dto.setTotalAmount(o.getTotalAmount().doubleValue());
                    dto.setStatus(o.getStatus());
                    dto.setOrderDate(o.getOrderDate());
                    return dto;
                }).collect(Collectors.toList());

        List<OrderReportDTO.TopProductDTO> topProducts = getTopProducts(startDate, endDate);

        OrderReportDTO report = new OrderReportDTO();
        report.setStartDate(startDate);
        report.setEndDate(endDate);
        report.setTotalSales(totalSales);
        report.setTotalOrders(totalOrders);
        report.setAverageOrderValue(avgOrderValue);
        report.setOrders(orderSummaries);
        report.setTopProducts(topProducts);
        return report;
    }

    private List<OrderReportDTO.TopProductDTO> getTopProducts(LocalDateTime start, LocalDateTime end) {
        List<Object[]> results = orderItemRepository.findTopSellingProducts(start, end);
        return results.stream()
                .map(row -> {
                    OrderReportDTO.TopProductDTO dto = new OrderReportDTO.TopProductDTO();
                    dto.setProductId((Long) row[0]);
                    dto.setTotalQuantitySold((Long) row[1]);
                    dto.setTotalRevenue(((Number) row[2]).doubleValue());
                    return dto;
                }).collect(Collectors.toList());
    }

    public List<Object[]> getDailySalesSummary(LocalDateTime start, LocalDateTime end) {
        return orderRepository.getDailySalesSummary(start, end);
    }
}
