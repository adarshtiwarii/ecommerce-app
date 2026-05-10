package org.example.backend.controller;

import org.example.backend.model.Order;
import org.example.backend.service.CheckoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
public class CheckoutController {

    private final CheckoutService checkoutService;

    @PostMapping
    public Order checkout(@RequestParam Long userId,
                          @RequestParam String address,
                          @RequestParam String paymentMethod) {
        return checkoutService.checkout(userId, address, paymentMethod);
    }
}