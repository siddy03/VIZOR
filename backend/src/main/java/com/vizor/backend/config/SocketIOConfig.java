package com.vizor.backend.config;

import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.Configuration;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;

/**
 * Configures and exposes a standalone Socket.IO server (netty-socketio).
 *
 * It runs on its own TCP port (default 9092) alongside the regular Tomcat
 * server on 8080. This is used exclusively by the Community -> Chat tab.
 * The Discussion tab keeps using its own raw WebSocket.
 */
@org.springframework.context.annotation.Configuration
public class SocketIOConfig {

    private static final Logger log = LoggerFactory.getLogger(SocketIOConfig.class);

    @Value("${socketio.host:0.0.0.0}")
    private String host;

    @Value("${socketio.port:9092}")
    private int port;

    @Value("${socketio.allowed-origin:http://localhost:4200}")
    private String allowedOrigin;

    private SocketIOServer server;

    @Bean
    public SocketIOServer socketIOServer() {
        Configuration config = new Configuration();
        config.setHostname(host);
        config.setPort(port);
        // Allow the Angular dev server to connect (Socket.IO has its own CORS layer)
        config.setOrigin(allowedOrigin);
        config.setPingInterval(25_000);
        config.setPingTimeout(60_000);

        this.server = new SocketIOServer(config);
        this.server.start();
        log.info("Socket.IO server started on {}:{} (origin: {})", host, port, allowedOrigin);
        return this.server;
    }

    @PreDestroy
    public void stopServer() {
        if (server != null) {
            log.info("Stopping Socket.IO server on port {}", port);
            server.stop();
        }
    }
}
