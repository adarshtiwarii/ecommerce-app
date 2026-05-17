package org.example.backend.controller;

import org.example.backend.service.DeliveryEstimateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/delivery")
@CrossOrigin(origins = "http://localhost:3000")
public class DeliveryController {
    private final DeliveryEstimateService deliveryEstimateService;

    public DeliveryController(DeliveryEstimateService deliveryEstimateService) {
        this.deliveryEstimateService = deliveryEstimateService;
    }

    @GetMapping("/estimate")
    public ResponseEntity<?> estimate(@RequestParam Double latitude, @RequestParam Double longitude) {
        return ResponseEntity.ok(deliveryEstimateService.estimate(latitude, longitude));
    }
}
