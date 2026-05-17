package org.example.backend.service;

import org.example.backend.dto.DeliveryEstimateResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DeliveryEstimateService {
    private static final double EARTH_RADIUS_KM = 6371.0;

    @Value("${warehouse.name}")
    private String warehouseName;

    @Value("${warehouse.latitude}")
    private double warehouseLatitude;

    @Value("${warehouse.longitude}")
    private double warehouseLongitude;

    @Value("${warehouse.base-delivery-hours}")
    private int baseDeliveryHours;

    @Value("${warehouse.average-speed-kmph}")
    private double averageSpeedKmph;

    private record Warehouse(String name, double latitude, double longitude) {}

    // Regional Indian warehouse network used for nearest-origin ETA calculation.
    private List<Warehouse> warehouses() {
        return List.of(
                new Warehouse(warehouseName, warehouseLatitude, warehouseLongitude),
                new Warehouse("Delhi NCR Fulfilment Hub", 28.6139, 77.2090),
                new Warehouse("Mumbai West Hub", 19.0760, 72.8777),
                new Warehouse("Bengaluru South Hub", 12.9716, 77.5946),
                new Warehouse("Kolkata East Hub", 22.5726, 88.3639),
                new Warehouse("Hyderabad Central Hub", 17.3850, 78.4867),
                new Warehouse("Chennai Coastal Hub", 13.0827, 80.2707),
                new Warehouse("Ahmedabad West Hub", 23.0225, 72.5714),
                new Warehouse("Lucknow North Hub", 26.8467, 80.9462)
        );
    }

    public DeliveryEstimateResponse estimate(Double customerLatitude, Double customerLongitude) {
        if (customerLatitude == null || customerLongitude == null) {
            return new DeliveryEstimateResponse(warehouseName, 0, baseDeliveryHours + 48,
                    "Delivery estimate will be confirmed after address verification.");
        }

        Warehouse nearest = warehouses().stream()
                .min((left, right) -> Double.compare(
                        haversine(left.latitude(), left.longitude(), customerLatitude, customerLongitude),
                        haversine(right.latitude(), right.longitude(), customerLatitude, customerLongitude)
                ))
                .orElse(new Warehouse(warehouseName, warehouseLatitude, warehouseLongitude));

        double distance = haversine(nearest.latitude(), nearest.longitude(), customerLatitude, customerLongitude);
        int travelHours = (int) Math.ceil(distance / Math.max(averageSpeedKmph, 1));
        int eta = Math.max(24, baseDeliveryHours + travelHours);
        String message = eta <= 48 ? "Fast delivery available" : "Standard delivery available";
        return new DeliveryEstimateResponse(nearest.name(), round(distance), eta, message);
    }

    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
