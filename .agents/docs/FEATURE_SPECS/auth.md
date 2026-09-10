# Feature Spec: Authentication

> Complete specification of the VIZOR authentication system.

---

## 1. Overview

VIZOR uses a **JWT-based authentication system** with **HttpOnly cookies**. Tokens are never exposed to JavaScript — they travel exclusively via `Set-Cookie` headers, making the system immune to XSS token theft.

---

## 2. Architecture

### 2.1 Backend Components

| Component | File | Role |
|---|---|---|
| `AuthController` | `controller/AuthController.java` | Login, refresh, logout, me endpoints |
| `AuthService` | `service/AuthService.java` | User authentication and lookup |
| `JwtUtil` | `security/JwtUtil.java` | Token generation, validation, claim extraction |
| `CookieUtil` | `security/CookieUtil.java` | Cookie creation, clearing, reading |
| `JwtAuthenticationFilter` | `security/JwtAuthenticationFilter.java` | Request filter — reads access cookie, sets SecurityContext |
| `SecurityConfig` | `config/SecurityConfig.java` | Filter chain, CORS, password encoder |

### 2.2 Frontend Components

| Component | File | Role |
|---|---|---|
| `AuthContext` | `context/AuthContext.jsx` | Session state, login/logout functions, session restore |
| `AuthGuard` | `components/guards/AuthGuard.jsx` | Route protection — redirect if not logged in |
| `ArGuard` | `components/guards/ArGuard.jsx` | AR-role route protection |
| `api.js` | `lib/api.js` | Axios interceptors for 401 refresh and error toasts |
| `Login page` | `app/login/page.jsx` | Login form UI |

---

## 3. Token Architecture

### 3.1 Token Types

| Type | Claim | Lifetime | Cookie Name | Cookie Path | Contains Role |
|---|---|---|---|---|---|
| **Access** | `type: "access"` | Short (configurable) | `vizor_token` | `/` | Yes |
| **Refresh** | `type: "refresh"` | Long (configurable) | `vizor_refresh` | `/api/auth` | No |

### 3.2 JWT Claims

**Access Token**:
```json
{
  "sub": "ar@ar.com",
  "role": "ar",
  "type": "access",
  "iat": 1719746400,
  "exp": 1719750000
}
```

**Refresh Token**:
```json
{
  "sub": "ar@ar.com",
  "type": "refresh",
  "iat": 1719746400,
  "exp": 1720351200
}
```

### 3.3 Cookie Properties

| Property | Access Cookie | Refresh Cookie |
|---|---|---|
| Name | `vizor_token` | `vizor_refresh` |
| Path | `/` | `/api/auth` |
| HttpOnly | `true` | `true` |
| Secure | Configurable (`app.cookie.secure`) | Same |
| SameSite | Configurable (`app.cookie.same-site`) | Same |
| MaxAge | `app.jwt.access-expiration-ms` | `app.jwt.refresh-expiration-ms` |

---

## 4. Authentication Flows

### 4.1 Login Flow

```
1. User submits email + password on /login page
2. Frontend calls POST /api/auth/login { email, password }
3. AuthService authenticates against DB (BCrypt comparison)
4. On success:
   - JwtUtil generates access + refresh tokens
   - CookieUtil creates HttpOnly cookies
   - Response: 200 + LoginResponse body + Set-Cookie headers
5. AuthContext.applySession() sets isLoggedIn, isArUser, currentUser
6. Router navigates to /home
```

### 4.2 Session Restore Flow (Page Reload)

```
1. AuthContext mounts (useEffect on startup)
2. Calls GET /api/auth/me
3. Browser automatically sends vizor_token cookie
4. JwtAuthenticationFilter validates the access token
5. On success: AuthController returns LoginResponse
6. AuthContext.applySession() restores session state
7. If 401: Axios interceptor tries /api/auth/refresh
   - If refresh succeeds: retries /api/auth/me → session restored
   - If refresh fails: clearSession() → user stays logged out
```

### 4.3 Token Refresh Flow (Transparent)

```
1. Any API call returns 401 (access token expired)
2. Axios interceptor catches it (if not an auth endpoint)
3. Single-flight: POST /api/auth/refresh
   - Browser sends vizor_refresh cookie
   - Server validates refresh token
   - Server issues new access + refresh tokens via Set-Cookie
4. Original request is retried with new access cookie
5. If refresh fails: window.dispatchEvent('vizor:session-expired')
   - AuthContext clears session, redirects to /login
```

### 4.4 Logout Flow

```
1. User clicks logout in Header
2. AuthContext.logout() called
3. POST /api/auth/logout → server clears cookies (maxAge=0)
4. clearSession() → isLoggedIn = false
5. Router navigates to /login
```

---

## 5. Role-Based Access

### 5.1 Roles

| Role | Value | Description |
|---|---|---|
| **AR Admin** | `"ar"` | Full access — admin portal, all features |
| **Member** | `"member"` | Standard access — surveys, benchmarks, community, meetings |

### 5.2 Frontend Guards

| Guard | Check | Redirect |
|---|---|---|
| `AuthGuard` | `isLoggedIn === true` | `/login` |
| `ArGuard` | `isLoggedIn && isArUser` | `/login` |
| `SurveyGuard` | Survey-specific validation | Varies |

### 5.3 Backend Security

- `/api/auth/**` → `permitAll()` (public)
- `/api/**` → `authenticated()` (requires valid access token)
- No endpoint-level role checks (all authenticated users can access all APIs)

---

## 6. Security Considerations

1. **XSS Protection**: Tokens in HttpOnly cookies — invisible to JavaScript
2. **CSRF**: Disabled (`csrf.disable()`) — acceptable for API-only backends with SameSite cookies
3. **Cookie Scope**: Refresh cookie restricted to `/api/auth` path — not sent with general API calls
4. **Single-Flight Refresh**: Multiple concurrent 401s share one refresh promise — prevents token rotation storms
5. **Stateless**: No server-side session storage — JWT is self-contained
6. **Password Storage**: BCrypt hashing via `PasswordEncoder`

---

## 7. Seeded Accounts

| Email | Password | Role | Client |
|---|---|---|---|
| `ar@ar.com` | `ar123` | `ar` | Auriemma |
| `user@user.com` | `user123` | `member` | c1 |

Created by `DataSeeder.java` on startup (only if not already present).

---

## 8. Configuration Properties

```properties
# JWT
app.jwt.secret=<min-256-bit-secret>
app.jwt.access-expiration-ms=900000       # 15 minutes
app.jwt.refresh-expiration-ms=604800000   # 7 days

# Cookies
app.cookie.secure=false                   # true in production
app.cookie.same-site=Lax

# Socket.IO
socketio.allowed-origin=http://localhost:4200
```

---

## 9. Key Implementation Files

### Backend
- [AuthController.java](file:///c:/react-projects/VIZOR/VIZOR/backend/src/main/java/com/vizor/backend/controller/AuthController.java)
- [JwtUtil.java](file:///c:/react-projects/VIZOR/VIZOR/backend/src/main/java/com/vizor/backend/security/JwtUtil.java)
- [CookieUtil.java](file:///c:/react-projects/VIZOR/VIZOR/backend/src/main/java/com/vizor/backend/security/CookieUtil.java)
- [JwtAuthenticationFilter.java](file:///c:/react-projects/VIZOR/VIZOR/backend/src/main/java/com/vizor/backend/security/JwtAuthenticationFilter.java)
- [SecurityConfig.java](file:///c:/react-projects/VIZOR/VIZOR/backend/src/main/java/com/vizor/backend/config/SecurityConfig.java)
- [DataSeeder.java](file:///c:/react-projects/VIZOR/VIZOR/backend/src/main/java/com/vizor/backend/config/DataSeeder.java)

### Frontend
- [AuthContext.jsx](file:///c:/react-projects/VIZOR/VIZOR/frontend-next/src/context/AuthContext.jsx)
- [AuthGuard.jsx](file:///c:/react-projects/VIZOR/VIZOR/frontend-next/src/components/guards/AuthGuard.jsx)
- [ArGuard.jsx](file:///c:/react-projects/VIZOR/VIZOR/frontend-next/src/components/guards/ArGuard.jsx)
- [api.js](file:///c:/react-projects/VIZOR/VIZOR/frontend-next/src/lib/api.js)
