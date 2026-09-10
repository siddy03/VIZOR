package com.vizor.backend.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * Builds and clears the HttpOnly auth cookies.
 *
 * - Access token  -> "vizor_token"   (path "/",         sent to every API call)
 * - Refresh token -> "vizor_refresh" (path "/api/auth", sent only to auth endpoints)
 *
 * Both are HttpOnly (invisible to JavaScript), so XSS cannot read them.
 */
@Component
public class CookieUtil {

    public static final String ACCESS_COOKIE = "vizor_token";
    public static final String REFRESH_COOKIE = "vizor_refresh";

    private static final String ACCESS_PATH = "/";
    private static final String REFRESH_PATH = "/api/auth";

    private final boolean secure;
    private final String sameSite;
    private final long accessMaxAgeMs;
    private final long refreshMaxAgeMs;

    public CookieUtil(
            @Value("${app.cookie.secure}") boolean secure,
            @Value("${app.cookie.same-site}") String sameSite,
            @Value("${app.jwt.access-expiration-ms}") long accessMaxAgeMs,
            @Value("${app.jwt.refresh-expiration-ms}") long refreshMaxAgeMs) {
        this.secure = secure;
        this.sameSite = sameSite;
        this.accessMaxAgeMs = accessMaxAgeMs;
        this.refreshMaxAgeMs = refreshMaxAgeMs;
    }

    public ResponseCookie accessCookie(String token) {
        return baseBuilder(ACCESS_COOKIE, token, ACCESS_PATH)
                .maxAge(Duration.ofMillis(accessMaxAgeMs))
                .build();
    }

    public ResponseCookie refreshCookie(String token) {
        return baseBuilder(REFRESH_COOKIE, token, REFRESH_PATH)
                .maxAge(Duration.ofMillis(refreshMaxAgeMs))
                .build();
    }

    public ResponseCookie clearAccessCookie() {
        return baseBuilder(ACCESS_COOKIE, "", ACCESS_PATH).maxAge(0).build();
    }

    public ResponseCookie clearRefreshCookie() {
        return baseBuilder(REFRESH_COOKIE, "", REFRESH_PATH).maxAge(0).build();
    }

    /**
     * Read a cookie value from the incoming request, or null if absent.
     */
    public static String readCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) {
            return null;
        }
        for (Cookie cookie : request.getCookies()) {
            if (name.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private ResponseCookie.ResponseCookieBuilder baseBuilder(String name, String value, String path) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path(path);
    }
}
