package org.example.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

// @Component makes Spring register this as a bean in the application context.
// Without it, @ConfigurationProperties alone won't create a bean —
// causing the "No qualifying bean" error in KeepAliveScheduler.
@Component
@Data
@ConfigurationProperties(prefix = "app.keep-alive")
public class KeepAliveProperties {

    // Whether the keep-alive scheduler is active. Defaults to false (safe off-switch).
    private boolean enabled = false;

    // How often (in ms) to ping services. Default: 10 minutes.
    private long intervalMs = 600000;

    // List of base URLs to ping (e.g. https://my-service.onrender.com).
    // Each URL gets "/actuator/health" appended before pinging.
    private List<String> services = new ArrayList<>();
}