package com.vizor.backend.dto;

/**
 * Authenticated-user payload returned by the auth endpoints.
 *
 * The JWTs are delivered as HttpOnly cookies (see CookieUtil), NOT in this body,
 * so the token is intentionally absent here.
 */
public class LoginResponse {

    private String email;
    private String role;
    private String name;

    public LoginResponse() {}

    public LoginResponse(String email, String role, String name) {
        this.email = email;
        this.role = role;
        this.name = name;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    // Builder
    public static LoginResponseBuilder builder() { return new LoginResponseBuilder(); }

    public static class LoginResponseBuilder {
        private String email;
        private String role;
        private String name;

        public LoginResponseBuilder email(String email) { this.email = email; return this; }
        public LoginResponseBuilder role(String role) { this.role = role; return this; }
        public LoginResponseBuilder name(String name) { this.name = name; return this; }

        public LoginResponse build() {
            return new LoginResponse(email, role, name);
        }
    }
}
