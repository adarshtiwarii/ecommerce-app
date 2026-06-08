package org.example.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@Data
@ConfigurationProperties(prefix = "app.keep-alive")
public class KeepAliveProperties {
    private boolean enabled = false;
    private long intervalMs = 600000;
    private List<String> services = new ArrayList<>();
}