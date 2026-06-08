package org.example.backend.config;

import io.netty.channel.ChannelOption;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

@Slf4j
@Component
// This bean is only created when "app.keep-alive.enabled=true" is set in properties.
// If the property is missing entirely, this scheduler will NOT be created (matchIfMissing = false).
@ConditionalOnProperty(name = "app.keep-alive.enabled", havingValue = "true", matchIfMissing = false)
public class KeepAliveScheduler {

    private final WebClient webClient;
    private final KeepAliveProperties properties;

    // Spring injects WebClient.Builder (auto-configured) and KeepAliveProperties bean.
    // KeepAliveProperties must be registered as a bean — see KeepAliveProperties.java.
    public KeepAliveScheduler(WebClient.Builder builder, KeepAliveProperties properties) {
        this.properties = properties;

        // Custom HTTP client with connection and response timeouts to avoid hanging pings.
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofSeconds(10))
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 8000);

        this.webClient = builder
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
    }

    // Runs at a fixed rate defined in properties (default: 600000ms = 10 minutes).
    // The ":600000" fallback ensures it works even if the property is not set.
    @Scheduled(fixedRateString = "${app.keep-alive.interval-ms:600000}")
    public void pingAllServices() {
        log.info("Keep-alive: pinging {} services...", properties.getServices().size());

        // Ping all configured service URLs concurrently using reactive streams.
        Flux.fromIterable(properties.getServices())
                .flatMap(url -> ping(url + "/actuator/health"))
                .subscribe();
    }

    // Sends a GET request to the given URL and logs the result.
    // Returns Mono<Void> — we only care about the side effect (log), not the response body.
    private Mono<Void> ping(String url) {
        return webClient.get()
                .uri(url)
                .exchangeToMono(response -> {
                    if (response.statusCode().is2xxSuccessful()) {
                        log.info("Keep-alive OK   [{}] {}", response.statusCode().value(), url);
                    } else {
                        log.warn("Keep-alive WARN [{}] {}", response.statusCode().value(), url);
                    }
                    // Drain the response body to release the connection, then discard it.
                    return response.bodyToMono(String.class).then();
                })
                .timeout(Duration.ofSeconds(15))
                // Log the error but don't crash the scheduler — other services should still be pinged.
                .doOnError(e -> log.warn("Keep-alive DOWN  [{}] {}", e.getClass().getSimpleName(), url))
                .onErrorComplete();
    }
}