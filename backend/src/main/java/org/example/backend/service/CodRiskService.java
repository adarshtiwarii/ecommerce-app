package org.example.backend.service;

import org.example.backend.exception.BadRequestException;
import org.example.backend.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Set;

@Service
public class CodRiskService {
    private static final BigDecimal COD_MAX_AMOUNT = new BigDecimal("25000");
    private static final Set<String> BLOCKED_PINCODES = Set.of("000000", "999999");

    private final OrderRepository orderRepository;

    public CodRiskService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public void validateCod(Long userId, BigDecimal amount, String shippingAddress) {
        if (amount.compareTo(COD_MAX_AMOUNT) > 0) {
            throw new BadRequestException("Cash on Delivery is not available above Rs 25,000");
        }
        String pincode = extractPincode(shippingAddress);
        if (pincode != null && BLOCKED_PINCODES.contains(pincode)) {
            throw new BadRequestException("Cash on Delivery is not available for this pincode");
        }
        long cancelledOrders = orderRepository.countByUserIdAndStatusIgnoreCase(userId, "CANCELLED");
        if (cancelledOrders >= 3) {
            throw new BadRequestException("Cash on Delivery is temporarily disabled for this account");
        }
    }

    private String extractPincode(String address) {
        if (address == null) return null;
        java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("\\b\\d{6}\\b").matcher(address);
        return matcher.find() ? matcher.group() : null;
    }
}
