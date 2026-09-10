# VIZOR — AI Context

> Quick-reference context for agents working on the VIZOR codebase.

---

## What Is VIZOR?

VIZOR is an **enterprise internal platform** for managing roundtables, surveys, benchmarks, projects, and clients. It features:

- **Admin portal** — CRUD management for Users, Clients, Projects, Roundtables (AR-role only)
- **Survey system** — Multi-step survey creation with question sections, participant selection, and report publishing
- **Community hub** — Real-time Chat (Socket.IO), Discussion threads, and Polls
- **Interactive Benchmarks** — Data visualization and reporting tools
- **Meetings & Exchange** — Scheduling and content exchange modules

---

## Monorepo Structure

```
VIZOR/
├── backend/               # Java 21 · Spring Boot 3.4 (port 8080)
│   └── src/main/java/com/vizor/backend/
│       ├── config/        # CorsConfig, SecurityConfig, SocketIOConfig, DataSeeder
│       ├── controller/    # REST controllers (7 files)
│       ├── dto/           # Data Transfer Objects (8 files)
│       ├── entity/        # JPA entities (6 files)
│       ├── repository/    # Spring Data JPA repos
│       ├── security/      # JwtUtil, JwtAuthenticationFilter, CookieUtil
│       └── service/       # Business logic + ChatSocketHandler
│
├── frontend-next/         # Next.js 15 · React 19 (port 4200) ← ACTIVE
│   └── src/
│       ├── app/           # App Router pages & layouts
│       │   ├── (app)/     # Authenticated routes (sidebar + header shell)
│       │   │   ├── admin/       # Users, Clients, Projects, Roundtables CRUD
│       │   │   ├── surveys/     # Add, Edit, View, Requests, Published, Report
│       │   │   ├── community/   # Chat, Discussion, Poll tabs
│       │   │   ├── home/        # Dashboard landing page
│       │   │   ├── benchmarks/  # Interactive benchmarks
│       │   │   ├── meetings/    # Meeting management
│       │   │   ├── exchange/    # Auriemma Exchange
│       │   │   ├── tools/       # Utility tools
│       │   │   └── help/        # Help section
│       │   ├── login/     # Public login page
│       │   ├── globals.css # Design tokens + PrimeReact overrides (1169 lines)
│       │   ├── layout.jsx  # Root layout (fonts, CSS imports)
│       │   └── providers.jsx # Redux + PrimeReact + Auth + Layout providers
│       ├── components/
│       │   ├── guards/    # AuthGuard, ArGuard, SurveyGuard
│       │   ├── layout/    # Header, Sidebar
│       │   └── shared/    # Table1, Table2, Stepper, SharedSearchbar, SharedDropdown, Breadcrumb
│       ├── context/       # AuthContext, LayoutContext
│       ├── lib/           # api.js (Axios), toast.js, routeTitles.js
│       ├── services/      # clientService, projectService, etc. (7 files)
│       ├── store/         # Redux slices (6) + index.js + hooks.js
│       └── types/         # (Reserved, empty)
│
├── frontend/              # Angular 21 · PrimeNG 21 ← LEGACY (do NOT modify)
└── .agents/               # Agent documentation (you are here)
```

---

## Technology Stack Summary

| Layer | Technology | Version |
|---|---|---|
| **Backend runtime** | Java | 21 |
| **Backend framework** | Spring Boot | 3.4.4 |
| **Authentication** | JJWT (JWT) | 0.12.6 |
| **Database (prod)** | MySQL | via `mysql-connector-j` |
| **Database (dev)** | H2 | in-memory |
| **Real-time** | Netty Socket.IO | 2.0.11 (port 9092) |
| **Frontend framework** | Next.js | 15.5+ |
| **UI library** | React | 19.x |
| **Component library** | PrimeReact | 10.9+ |
| **State management** | Redux Toolkit | 2.3+ |
| **HTTP client** | Axios | 1.7+ |
| **CSS framework** | Tailwind CSS | 3.4 (Preflight disabled) |
| **Font** | Arimo (via next/font) | metric-compatible with Arial Nova |
| **Rich text** | Quill | 2.x |

---

## Domain Entities

| Entity | Backend Controller | Frontend Service | Redux Slice |
|---|---|---|---|
| **User** | `UserController` → `/api/users` | `userService.js` | `userSlice.js` |
| **Client** | `ClientController` → `/api/clients` | `clientService.js` | `clientSlice.js` |
| **Project** | `ProjectController` → `/api/projects` | `projectService.js` | `projectSlice.js` |
| **Roundtable** | `RoundtableController` → `/api/roundtables` | `roundtableService.js` | `roundtableSlice.js` |
| **Survey** | `SurveyController` → `/api/surveys` | `surveyService.js` | `surveySlice.js` |
| **UserRequest** | `UserRequestController` → `/api/user-requests` | _(inline)_ | — |
| **ChatMessage** | _(Socket.IO handler)_ | `chatSocketService.js` | — |

---

## User Roles

| Role string | Description | Frontend guard |
|---|---|---|
| `"ar"` | Auriemma admin — full access to admin portal and all features | `ArGuard` (checks `isArUser`) |
| `"member"` | Standard user — access to surveys, benchmarks, community, meetings | `AuthGuard` (checks `isLoggedIn`) |

---

## Authentication Flow

```
┌────────────┐      POST /api/auth/login       ┌──────────────┐
│  Browser   │ ──────────────────────────────→  │  Spring Boot │
│            │ ←─────── Set-Cookie (HttpOnly) ─ │              │
│            │    vizor_token  (access, /)      │  JwtUtil     │
│            │    vizor_refresh (refresh, /auth) │  CookieUtil  │
└────────────┘                                  └──────────────┘

Session restore:  GET /api/auth/me  (reads access cookie)
Token refresh:    POST /api/auth/refresh  (reads refresh cookie)
Logout:           POST /api/auth/logout  (clears both cookies)
```

- Frontend `api.js` has an interceptor that auto-refreshes on 401.
- `AuthContext` calls `/api/auth/me` on mount to restore the session.
- If refresh fails, a `vizor:session-expired` custom event redirects to `/login`.

---

## Seeded Test Accounts

| Email | Password | Role |
|---|---|---|
| `ar@ar.com` | `ar123` | `ar` (admin) |
| `user@user.com` | `user123` | `member` |

---

## Key Configuration

| Setting | Source | Default |
|---|---|---|
| JWT secret | `app.jwt.secret` | (in `application.properties`) |
| Access token TTL | `app.jwt.access-expiration-ms` | (configurable) |
| Refresh token TTL | `app.jwt.refresh-expiration-ms` | (configurable) |
| Cookie secure flag | `app.cookie.secure` | `false` (dev) |
| Cookie SameSite | `app.cookie.same-site` | `Lax` |
| Socket.IO port | `socketio.port` | `9092` |
| Socket.IO origin | `socketio.allowed-origin` | `http://localhost:4200` |
| CORS allowed origin | (hardcoded) | `http://localhost:4200` |

---

## How To Run

### Backend
```powershell
cd backend
.\mvnw.cmd spring-boot:run
# Starts on http://localhost:8080
# Socket.IO on port 9092
```

### Frontend
```powershell
cd frontend-next
npm install
npm run dev
# Starts on http://localhost:4200
# API requests proxied to localhost:8080 via next.config.mjs
```

---

## Important Patterns to Preserve

1. **Builder pattern** on entities and DTOs — hand-written (no Lombok).
2. **Service-dispatches-to-store** pattern — frontend services import `store` directly and dispatch actions.
3. **localStorage persistence** — Redux store subscribes and persists projects, roundtables, surveys, clients to `localStorage`.
4. **Single-flight refresh** — multiple concurrent 401s share one refresh promise.
5. **Global toast** — one `Toast` ref in `Providers`, accessible via `showToast()`.
6. **Route title system** — `routeTitles.js` maps pathnames to titles; `(app)/layout.jsx` syncs on navigation.
