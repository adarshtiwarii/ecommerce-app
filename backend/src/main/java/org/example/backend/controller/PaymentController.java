package org.example.backend.controller;

import jakarta.validation.Valid;
import org.example.backend.dto.CreatePaymentOrderRequest;
import org.example.backend.dto.VerifyPaymentRequest;
import org.example.backend.service.OrderPricingService;
import org.example.backend.service.RazorpayPaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {
    private final RazorpayPaymentService razorpayPaymentService;
    private final OrderPricingService orderPricingService;

    public PaymentController(RazorpayPaymentService razorpayPaymentService,
                             OrderPricingService orderPricingService) {
        this.razorpayPaymentService = razorpayPaymentService;
        this.orderPricingService = orderPricingService;
    }

    @PostMapping("/razorpay/order")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createRazorpayOrder(@Valid @RequestBody CreatePaymentOrderRequest request) {
        BigDecimal amount = orderPricingService.calculateFromPaymentItems(request.getItems());
        return ResponseEntity.ok(razorpayPaymentService.createOrder(amount));
    }

    @PostMapping("/razorpay/verify")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> verifyRazorpayPayment(@Valid @RequestBody VerifyPaymentRequest request) {
        boolean verified = razorpayPaymentService.verifySignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );
        return ResponseEntity.ok(Map.of("verified", verified));
    }
}
