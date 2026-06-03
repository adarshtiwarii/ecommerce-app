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
@ConditionalOnProperty(name = "app.keep-alive.enabled", havingValue = "true", matchIfMissing = false)
public class KeepAliveScheduler {

    private final WebClient webClient;
    private final KeepAliveProperties properties;

    public KeepAliveScheduler(WebClient.Builder builder, KeepAliveProperties properties) {
        this.properties = properties;

        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofSeconds(10))
                // FIX: Moved ChannelOption import to top-level — avoids inline 'io.netty' path
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 8000);

        this.webClient = builder
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
    }

    // FIX: Removed redundant default value — interval-ms is already declared in
    //      @Scheduled; the ":600000" fallback is fine but caused an IDE warning.
    //      Keep it if you want a safe default when the property is missing.
    @Scheduled(fixedRateString = "${app.keep-alive.interval-ms:600000}")
    public void pingAllServices() {
        log.info("Keep-alive: pinging {} services...", properties.getServices().size());

        Flux.fromIterable(properties.getServices())
                .flatMap(url -> ping(url + "/actuator/health"))
                .subscribe();
    }

    private Mono<Void> ping(String url) {
        return webClient.get()
                .uri(url)
                .exchangeToMono(response -> {
                    if (response.statusCode().is2xxSuccessful()) {
                        log.info("Keep-alive OK   [{}] {}", response.statusCode().value(), url);
                    } else {
                        log.warn("Keep-alive WARN [{}] {}", response.statusCode().value(), url);
                    }
                    return response.bodyToMono(String.class).then();
                })
                .timeout(Duration.ofSeconds(15))
                .doOnError(e -> log.warn("Keep-alive DOWN  [{}] {}", e.getClass().getSimpleName(), url))
                .onErrorComplete();
    }
}