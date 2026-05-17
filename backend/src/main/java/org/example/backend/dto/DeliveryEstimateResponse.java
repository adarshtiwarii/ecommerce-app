package org.example.backend.dto;

public class DeliveryEstimateResponse {
    private String warehouseName;
    private double distanceKm;
    private int estimatedHours;
    private String message;

    public DeliveryEstimateResponse(String warehouseName, double distanceKm, int estimatedHours, String message) {
        this.warehouseName = warehouseName;
        this.distanceKm = distanceKm;
        this.estimatedHours = estimatedHours;
        this.message = message;
    }

    public String getWarehouseName() { return warehouseName; }
    public double getDistanceKm() { return distanceKm; }
    public int getEstimatedHours() { return estimatedHours; }
    public String getMessage() { return message; }
}
