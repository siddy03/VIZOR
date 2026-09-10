# VIZOR — Architecture

> System-level architecture reference for the VIZOR full-stack monorepo.

---

## 1. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         Browser (port 4200)                      │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │               Next.js 15 / React 19 SPA                   │  │
│  │  ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌─────────────┐  │  │
│  │  │ Pages   │ │Components│ │  Redux    │ │  Services   │  │  │
│  │  │ (App    │ │(Shared,  │ │  Toolkit  │ │ (Axios +    │  │  │
│  │  │ Router) │ │ Layout,  │ │  Store    │ │  Store      │  │  │
│  │  │         │ │ Guards)  │ │           │ │  dispatch)  │  │  │
│  │  └────┬────┘ └────┬─────┘ └─────┬─────┘ └──────┬──────┘  │  │
│  │       │           │             │               │         │  │
│  │       └───────────┴─────────────┴───────────────┘         │  │
│  │                          │                                 │  │
│  │            Axios (withCredentials: true)                   │  │
│  │            + 401 refresh interceptor                       │  │
│  └──────────────────────────┬─────────────────────────────────┘  │
│                             │ /api/*                              │
│              Next.js rewrite│(proxy)                              │
└─────────────────────────────┼────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                   Spring Boot 3.4 (port 8080)                    │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌──────────────┐  │
│  │ Security │  │Controller│  │  Service   │  │  Repository  │  │
│  │ Filter   │→ │  Layer   │→ │  Layer     │→ │   Layer      │  │
│  │ Chain    │  │  (DTOs)  │  │  (Logic)   │  │ (JPA/Hibern.)│  │
│  └──────────┘  └──────────┘  └────────────┘  └──────┬───────┘  │
│       │                                              │           │
│  JWT Filter                                          │           │
│  (reads HttpOnly cookies)                            ▼           │
│                                              ┌──────────────┐   │
│                                              │   Database   │   │
│                                              │ MySQL / H2   │   │
│                                              └──────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │      Netty Socket.IO Server (port 9092)                  │   │
│  │      ChatSocketHandler — Community Chat                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Backend Architecture

### 2.1 Layered Architecture

The backend follows a **strict 4-layer architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                    Controller Layer                          │
│  @RestController — accepts/returns DTOs                     │
│  Maps to /api/<plural-entity>                               │
│  Uses constructor injection (no @Autowired)                 │
│  Returns ResponseEntity<T>                                  │
├─────────────────────────────────────────────────────────────┤
│                    Service Layer                             │
│  @Service — all business logic                              │
│  Entity ↔ DTO conversion                                   │
│  Transaction boundaries                                     │
├─────────────────────────────────────────────────────────────┤
│                    Repository Layer                          │
│  JpaRepository interfaces                                   │
│  Custom query methods (e.g., existsByEmailIgnoreCase)       │
│  Data access only — no logic                                │
├─────────────────────────────────────────────────────────────┤
│                    Entity Layer                              │
│  @Entity — JPA-annotated domain objects                     │
│  @Table, @Column, @GeneratedValue(IDENTITY)                 │
│  Hand-written Builder pattern (no Lombok)                   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Security Architecture

```
Request → CorsFilter → JwtAuthenticationFilter → SecurityFilterChain → Controller
                            │
                    reads "vizor_token" cookie
                    validates JWT (signature + expiry + type=access)
                    sets SecurityContext authentication
```

- **Stateless sessions** — `SessionCreationPolicy.STATELESS`
- **Public paths**: `/api/auth/**` (login, refresh, logout, me)
- **Protected paths**: all other `/api/**`
- **Password hashing**: `BCryptPasswordEncoder`

### 2.3 Real-Time Architecture

```
Browser (Socket.IO Client)  ←→  Netty Socket.IO Server (port 9092)
                                      │
                                ChatSocketHandler
                                      │
                      Events: "chat:send" → "chat:message"
```

- Separate TCP port from Spring Boot (not a Spring WebSocket).
- Per-tab UUID as `senderId` for left/right bubble alignment.
- Ping interval: 25s, timeout: 60s.

---

## 3. Frontend Architecture

### 3.1 Rendering Model

```
┌───────────────────────────────────────────────────────┐
│                  Root Layout (Server Component)       │
│  - CSS imports (PrimeReact theme → globals.css)       │
│  - Font loading (Arimo via next/font)                 │
│  - <Providers> wrapper                                │
│     ├── Redux Provider                                │
│     ├── PrimeReact Provider                           │
│     ├── AuthProvider (session restore)                │
│     ├── LayoutProvider (sidebar state)                │
│     └── Global <Toast />                              │
├───────────────────────────────────────────────────────┤
│          (app) Route Group Layout (Client Component)  │
│  - AuthGuard (redirect if not logged in)              │
│  - Shell (Sidebar + Header + content area)            │
│  - Route title sync from routeTitles.js               │
│  - Responsive sidebar handling                        │
├───────────────────────────────────────────────────────┤
│                  Page Components                      │
│  - Each page in src/app/(app)/<route>/page.jsx        │
│  - 'use client' where hooks/events needed             │
│  - Server Components by default                       │
└───────────────────────────────────────────────────────┘
```

### 3.2 State Architecture

```
┌────────────────────────────────┐
│         Redux Store            │
│  ┌──────────────────────────┐  │
│  │ projectSlice             │  │
│  │ roundtableSlice          │  │
│  │ surveySlice              │  │
│  │ clientSlice              │  │
│  │ userSlice                │  │
│  │ layoutSlice              │  │
│  └──────────────────────────┘  │
│  Persistence: localStorage    │
│  (vizor_projects,             │
│   vizor_roundtables,          │
│   vizor_surveys,              │
│   vizor_clients)              │
└────────────────────────────────┘

┌────────────────────────────────┐
│       React Context            │
│  AuthContext  → auth state     │
│  LayoutContext → sidebar/title │
└────────────────────────────────┘
```

### 3.3 Data Flow Pattern

```
User Action → Component → Service Function → Axios (api.js)
                                                 │
                                        POST /api/clients
                                                 │
                                          ← response data
                                                 │
                               Service dispatches to Redux store
                                                 │
                               Component re-renders via useAppSelector
```

### 3.4 Route Architecture

```
src/app/
├── page.js                    # Root redirect
├── login/page.jsx             # Public login page
└── (app)/                     # Authenticated route group
    ├── layout.jsx             # AuthGuard + Shell (Sidebar + Header)
    ├── home/page.jsx          # Dashboard
    ├── admin/
    │   ├── page.jsx           # Admin landing
    │   ├── users/             # CRUD + add
    │   ├── clients/           # CRUD + add + edit
    │   ├── projects/          # CRUD + add + edit
    │   └── roundtables/       # CRUD + add + edit
    ├── surveys/
    │   ├── add/               # Multi-step survey wizard
    │   ├── edit/              # Survey editing
    │   ├── view/              # Survey viewer
    │   ├── requests/          # Non-survey requests
    │   ├── published/         # Published surveys
    │   ├── modify/            # Response modification
    │   └── report/            # Report builder
    ├── community/
    │   ├── layout.jsx         # Tab navigation (Chat, Discussion, Poll)
    │   ├── chat/              # Socket.IO real-time chat
    │   ├── discussion/        # Discussion threads
    │   └── poll/              # Polls
    ├── benchmarks/            # Interactive benchmarks
    ├── meetings/              # Meetings
    ├── exchange/              # Auriemma Exchange
    ├── tools/                 # Tools
    └── help/                  # Help
```

---

## 4. Network & Ports

| Service | Port | Protocol |
|---|---|---|
| Spring Boot API | 8080 | HTTP REST |
| Next.js dev server | 4200 | HTTP |
| Netty Socket.IO | 9092 | WebSocket (Socket.IO) |

### Proxy Configuration

```
Browser → localhost:4200/api/* → (Next.js rewrite) → localhost:8080/api/*
```

Defined in `next.config.mjs`:
```js
async rewrites() {
  return [{ source: '/api/:path*', destination: `${API_TARGET}/api/:path*` }];
}
```

---

## 5. Database Schema (Entities)

| Entity | Table | Key Fields |
|---|---|---|
| `User` | `users` | id, email (unique), password (bcrypt), role, name, firstName, lastName, clientName, roundtables, active, locked, suspended |
| `Client` | _(auto)_ | id, name, abbreviation, parentClient, domains (List), active, status |
| `Project` | _(auto)_ | id, name, abbreviation, clientsWithAccess, directors, associates, projectType, status |
| `Roundtable` | _(auto)_ | id, name, abbreviation, clientsWithAccess, directors, associates, status |
| `Survey` | _(auto)_ | id, source, entity, surveyType, surveyName, period, year, startDate, endDate, isActive, lastStep, status, questionSections (JSON), participantSelections (JSON) |
| `UserRequest` | _(auto)_ | id, _(fields TBD)_ |

---

## 6. Component Hierarchy

```
RootLayout
└── Providers (Redux + PrimeReact + Auth + Layout + Toast)
    ├── LoginPage (public)
    └── AppLayout (authenticated)
        ├── AuthGuard
        └── Shell
            ├── Sidebar (navigation menu, collapsible)
            ├── Header (breadcrumb, search, user menu)
            └── Content Area
                └── [Page Component]
                    └── Shared Components
                        ├── Table1 / Table2 (data tables)
                        ├── SharedSearchbar
                        ├── SharedDropdown
                        ├── Stepper (multi-step forms)
                        ├── Breadcrumb
                        └── PlaceholderPage
```
