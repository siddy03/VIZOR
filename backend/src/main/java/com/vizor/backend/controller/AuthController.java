package com.vizor.backend.controller;

import com.vizor.backend.dto.LoginRequest;
import com.vizor.backend.dto.LoginResponse;
import com.vizor.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * POST /api/auth/login
     * Authenticates user and returns JWT token + user info.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        Optional<LoginResponse> result = authService.authenticate(request);

        if (result.isPresent()) {
            return ResponseEntity.ok(result.get());
        }

        return ResponseEntity.status(401)
                .body(Map.of("message", "Invalid email or password"));
    }
}
