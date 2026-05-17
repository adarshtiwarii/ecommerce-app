package org.example.backend.service;

import org.example.backend.dto.CreatePaymentOrderRequest;
import org.example.backend.dto.PlaceOrderRequest;
import org.example.backend.exception.BadRequestException;
import org.example.backend.model.Product;
import org.example.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderPricingService {
    private final ProductRepository productRepository;

    public OrderPricingService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public BigDecimal calculateFromOrderItems(List<PlaceOrderRequest.OrderItemRequest> items) {
        if (items == null || items.isEmpty()) {
            throw new BadRequestException("Order must contain at least one item");
        }
        BigDecimal total = BigDecimal.ZERO;
        for (PlaceOrderRequest.OrderItemRequest item : items) {
            Product product = getPurchasableProduct(item.getProductId(), item.getQuantity());
            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }
        return total;
    }

    public BigDecimal calculateFromPaymentItems(List<CreatePaymentOrderRequest.Item> items) {
        if (items == null || items.isEmpty()) {
            throw new BadRequestException("Payment order must contain at least one item");
        }
        BigDecimal total = BigDecimal.ZERO;
        for (CreatePaymentOrderRequest.Item item : items) {
            Product product = getPurchasableProduct(item.getProductId(), item.getQuantity());
            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }
        return total;
    }

    public Product getPurchasableProduct(Long productId, Integer quantity) {
        if (productId == null || quantity == null || quantity <= 0) {
            throw new BadRequestException("Invalid product or quantity");
        }
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BadRequestException("Product not found: " + productId));
        if (!product.isEnabled()) {
            throw new BadRequestException("Product is not available: " + productId);
        }
        if (product.getStockQuantity() == null || product.getStockQuantity() < quantity) {
            throw new BadRequestException("Insufficient stock for product: " + product.getName());
        }
        return product;
    }
}
