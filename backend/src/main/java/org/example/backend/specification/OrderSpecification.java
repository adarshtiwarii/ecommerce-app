package org.example.backend.specification;

import org.example.backend.model.Order;
import org.springframework.data.jpa.domain.Specification;
import java.time.LocalDateTime;

public class OrderSpecification {

    public static Specification<Order> hasStatus(String status) {
        return (root, query, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    public static Specification<Order> orderDateBetween(LocalDateTime start, LocalDateTime end) {
        return (root, query, cb) -> {
            if (start == null && end == null) return cb.conjunction();
            if (start == null) return cb.lessThanOrEqualTo(root.get("orderDate"), end);
            if (end == null) return cb.greaterThanOrEqualTo(root.get("orderDate"), start);
            return cb.between(root.get("orderDate"), start, end);
        };
    }

    public static Specification<Order> totalAmountBetween(Double min, Double max) {
        return (root, query, cb) -> {
            if (min == null && max == null) return cb.conjunction();
            if (min == null) return cb.le(root.get("totalAmount"), max);
            if (max == null) return cb.ge(root.get("totalAmount"), min);
            return cb.between(root.get("totalAmount"), min, max);
        };
    }

    public static Specification<Order> userIdEquals(Long userId) {
        return (root, query, cb) -> userId == null ? cb.conjunction() : cb.equal(root.get("userId"), userId);
    }
}