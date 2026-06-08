package org.example.backend.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

// REMOVED: WebClient, WebFlux, Reactor, Netty imports
// REASON: spring-boot-starter-webflux was removed from pom.xml to reduce
// startup time on Render free tier (~40s saved). RestTemplate is a lightweight
// synchronous HTTP client — sufficient for simple keep-alive pings.

@Slf4j
@Component
// This bean is only created when "app.keep-alive.enabled=true" is set in properties.
// If the property is missing entirely, this scheduler will NOT be created (matchIfMissing = false).
@ConditionalOnProperty(name = "app.keep-alive.enabled", havingValue = "true", matchIfMissing = false)
public class KeepAliveScheduler {

    // RestTemplate is a simple synchronous HTTP client — no Netty or reactor needed.
    // It is created directly here since we only need basic GET requests.
    private final RestTemplate restTemplate = new RestTemplate();

    private final KeepAliveProperties properties;

    // Spring injects KeepAliveProperties bean (configured via application.properties).
    public KeepAliveScheduler(KeepAliveProperties properties) {
        this.properties = properties;
    }

    // Runs at a fixed rate defined in properties (default: 600000ms = 10 minutes).
    // The ":600000" fallback ensures it works even if the property is not set.
    @Scheduled(fixedRateString = "${app.keep-alive.interval-ms:600000}")
    public void pingAllServices() {
        log.info("Keep-alive: pinging {} service(s)...", properties.getServices().size());

        // Ping each configured service URL sequentially.
        // Synchronous is fine here — pings are infrequent and non-critical.
        for (String url : properties.getServices()) {
            ping(url + "/api/health");
        }
    }

    // Sends a GET request to the given URL and logs success or failure.
    // Errors are caught and logged — a failed ping should never crash the scheduler.
    private void ping(String url) {
        try {
            String response = restTemplate.getForObject(url, String.class);
            log.info("Keep-alive OK   [200] {}", url);
        } catch (Exception e) {
            // Log the error class and message but continue — other services still need pinging.
            log.warn("Keep-alive DOWN [{}] {} — {}", e.getClass().getSimpleName(), url, e.getMessage());
        }
    }
}