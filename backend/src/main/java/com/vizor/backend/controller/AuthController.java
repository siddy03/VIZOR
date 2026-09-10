package com.vizor.backend.controller;

import com.vizor.backend.dto.LoginRequest;
import com.vizor.backend.dto.LoginResponse;
import com.vizor.backend.security.CookieUtil;
import com.vizor.backend.security.JwtUtil;
import com.vizor.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final CookieUtil cookieUtil;

    public AuthController(AuthService authService, JwtUtil jwtUtil, CookieUtil cookieUtil) {
        this.authService = authService;
        this.jwtUtil = jwtUtil;
        this.cookieUtil = cookieUtil;
    }

    /**
     * POST /api/auth/login
     * Authenticates the user, sets HttpOnly access + refresh cookies,
     * and returns the user info (no token in the body).
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        Optional<LoginResponse> result = authService.authenticate(request);

        if (result.isEmpty()) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Invalid email or password"));
        }

        LoginResponse user = result.get();
        return issueTokens(user.getEmail(), user.getRole(), user);
    }

    /**
     * POST /api/auth/refresh
     * Reads the refresh cookie, and (if valid) rotates both tokens.
     * Returns the user info so the client can restore its session.
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request) {
        String refreshToken = CookieUtil.readCookie(request, CookieUtil.REFRESH_COOKIE);

        if (refreshToken == null || !jwtUtil.isTokenOfType(refreshToken, JwtUtil.TYPE_REFRESH)) {
            return unauthorized();
        }

        String email = jwtUtil.getEmailFromToken(refreshToken);
        Optional<LoginResponse> userOpt = authService.getUserByEmail(email);

        if (userOpt.isEmpty()) {
            return unauthorized();
        }

        LoginResponse user = userOpt.get();
        return issueTokens(user.getEmail(), user.getRole(), user);
    }

    /**
     * POST /api/auth/logout
     * Clears both auth cookies.
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookieUtil.clearAccessCookie().toString())
                .header(HttpHeaders.SET_COOKIE, cookieUtil.clearRefreshCookie().toString())
                .body(Map.of("message", "Logged out"));
    }

    /**
     * GET /api/auth/me
     * Returns the current user based on the access cookie, or 401 if not authenticated.
     */
    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null
                || !(authentication.getPrincipal() instanceof String email)
                || "anonymousUser".equals(email)) {
            return unauthorized();
        }

        return authService.getUserByEmail(email)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(this::unauthorized);
    }

    /**
     * Generates fresh access + refresh tokens, attaches them as HttpOnly cookies,
     * and returns the supplied user body.
     */
    private ResponseEntity<?> issueTokens(String email, String role, LoginResponse body) {
        String accessToken = jwtUtil.generateAccessToken(email, role);
        String refreshToken = jwtUtil.generateRefreshToken(email);

        ResponseCookie accessCookie = cookieUtil.accessCookie(accessToken);
        ResponseCookie refreshCookie = cookieUtil.refreshCookie(refreshToken);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(body);
    }

    private ResponseEntity<?> unauthorized() {
        return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
    }
}
