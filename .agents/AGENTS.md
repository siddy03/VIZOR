# VIZOR — Project Rules

> These rules apply to all agent-generated code across the VIZOR monorepo.

---

## 1. Project Architecture Overview

VIZOR is a full-stack monorepo with **three** subprojects:

| Layer | Path | Stack |
|---|---|---|
| **Backend** | `backend/` | Java 21 · Spring Boot 3.4 · Spring Security · JPA/Hibernate · MySQL (prod) / H2 (dev) · JJWT · Netty Socket.IO |
| **Frontend (active)** | `frontend-next/` | Next.js 15 · React 19 · Redux Toolkit · PrimeReact 10 · Tailwind CSS 3 · Axios · Socket.IO Client |
| **Frontend (legacy)** | `frontend/` | Angular 21 · NgRx · PrimeNG 21 · RxJS — **do NOT modify**; kept for reference only |

### Critical Rule
- **All new frontend work MUST go into `frontend-next/`.**
- **Never modify files under `frontend/`** unless the user explicitly asks to.

---

## 2. Directory Conventions

### 2.1 Backend (`backend/`)

```
src/main/java/com/vizor/backend/
├── config/          # Spring configuration (CORS, Security, Socket.IO, DataSeeder)
├── controller/      # REST controllers — one per domain entity
├── dto/             # Data Transfer Objects — one per entity
├── entity/          # JPA entities — annotated @Entity classes
├── repository/      # Spring Data JPA repositories
├── security/        # JWT filter, JWT util, cookie util
├── service/         # Business logic — one service per entity
└── VizorBackendApplication.java
```

### 2.2 Frontend-Next (`frontend-next/`)

```
src/
├── app/             # Next.js App Router pages & layouts
│   ├── (app)/       # Authenticated route group with sidebar/header layout
│   ├── login/       # Public login page
│   ├── globals.css  # All design tokens, global resets & PrimeReact overrides
│   ├── layout.jsx   # Root layout (fonts, metadata)
│   └── providers.jsx # Redux + PrimeReact + Auth + Layout providers
├── components/
│   ├── guards/      # Route protection (AuthGuard)
│   ├── layout/      # Shell chrome (Header, Sidebar)
│   └── shared/      # Reusable UI components (tables, search, stepper, dropdowns)
├── context/         # React Context providers (AuthContext, LayoutContext)
├── lib/             # Shared utilities (Axios instance, toast helper, route titles)
├── services/        # Domain service modules — mirror backend controllers
├── store/           # Redux Toolkit slices + store configuration
└── types/           # (Reserved for TypeScript type definitions)
```

---

## 3. Frontend Rules

### 3.1 Language & Framework

- Use **JavaScript (`.js` / `.jsx`)** — the project does not use TypeScript yet.
- Use **Next.js App Router** conventions:
  - Pages go in `src/app/(app)/<route>/page.jsx`.
  - Layouts go in the nearest `layout.jsx`.
  - Client components MUST start with `'use client';` at the top.
  - Server-side logic stays in Server Components or Route Handlers — **never** import `store`, `useEffect`, or browser APIs in a Server Component.

### 3.2 Component Conventions

- **File naming**: Use **PascalCase** for component files (`SharedSearchbar.jsx`) and **kebab-case** for CSS files (`shared-searchbar.css`).
- **One component per file** — keep components focused.
- Co-locate the CSS module file next to its component (e.g., `Sidebar.jsx` + `sidebar.css`).
- Import CSS via a plain `import './sidebar.css';` — the project does **not** use CSS Modules (`.module.css`).
- Prefer **functional components** with hooks — never use class components.
- Destructure props in the function signature.

### 3.3 Styling Rules

- **Design tokens** live in `:root` in `src/app/globals.css` — always reference existing CSS custom properties (e.g., `var(--color-primary)`) rather than hard-coding hex values.
- **Tailwind CSS 3** is enabled **but Preflight is disabled** (`corePlugins: { preflight: false }`) to avoid clobbering PrimeReact styles.
- Use Tailwind utility classes mapped to design tokens (defined in `tailwind.config.js`) — e.g., `text-primary`, `bg-bg-light`, `rounded-dialog`.
- For component-specific styles that go beyond utilities, create a co-located `.css` file.
- **Never override PrimeReact component internals** with Tailwind `@apply` — use `globals.css` overrides with specificity instead.
- When adding new design tokens, add them to **both** `:root` in `globals.css` **and** the corresponding section in `tailwind.config.js`.

### 3.4 State Management

- Use **Redux Toolkit** via `@reduxjs/toolkit`:
  - Slices go in `src/store/<entityName>Slice.js`.
  - Export the slice reducer as default, and named action creators.
  - Register new reducers in `src/store/index.js`.
- Use the typed hooks from `src/store/hooks.js` (`useAppDispatch`, `useAppSelector`) inside components.
- For **ephemeral UI state** (sidebar collapse, dialogs), use React Context (`src/context/`).
- For **auth state** (current user, login status), use `AuthContext`.
- **Do NOT mix** Redux and Context for the same concern.

### 3.5 API & Services

- All HTTP calls go through the **shared Axios instance** exported from `src/lib/api.js` — never create a separate `axios.create()`.
- Service files live in `src/services/<entityName>Service.js`.
- Each service module:
  - Imports `{ api }` from `@/lib/api`.
  - Imports `{ store }` from `@/store` (for direct dispatch — this mirrors the Angular service pattern).
  - Exports named async functions (e.g., `loadClients`, `addClient`, `updateClient`, `deleteClient`).
- All API paths start with `/api/` — Next.js rewrites proxy them to the Spring Boot backend.
- Authentication uses **HttpOnly cookies** (access + refresh tokens) — do NOT store tokens in localStorage or JS variables.
- The Axios instance already has:
  - `withCredentials: true` for cookie transport.
  - A 401 response interceptor that auto-refreshes the session.
  - A global error toast interceptor.

### 3.6 Routing & Navigation

- Authenticated pages live under `src/app/(app)/` (route group with sidebar + header layout).
- Public pages (login) live directly under `src/app/`.
- Use Next.js `<Link>` for internal navigation.
- Route titles are defined in `src/lib/routeTitles.js` — update this when adding new routes.

### 3.7 UI Library — PrimeReact

- Use **PrimeReact** components for all standard UI elements (buttons, dialogs, tables, dropdowns, menus, toasts).
- Import PrimeReact components from their individual paths: `import { Button } from 'primereact/button';`.
- Icons: use **PrimeIcons** (`pi pi-<name>`) — do NOT add a separate icon library.
- Toast: use the global toast via `import { showToast } from '@/lib/toast';` — do NOT create local `Toast` refs.

### 3.8 Real-Time (WebSocket / Socket.IO)

- Socket.IO client services live in `src/services/` (`chatSocketService.js`, `websocketService.js`).
- Connect to the netty-socketio server running on the backend.
- Always disconnect sockets in cleanup functions (return from `useEffect`).

---

## 4. Backend Rules

### 4.1 Language & Framework

- **Java 21** — use modern language features (records, pattern matching, sealed classes) where appropriate.
- **Spring Boot 3.4** — follow Spring conventions.
- Build tool: **Maven** (via `mvnw.cmd`).

### 4.2 Layered Architecture (Strictly Enforced)

```
Controller → Service → Repository → Entity
     ↕             ↕
    DTO           DTO
```

- **Controllers** (`@RestController`): accept/return **DTOs only**, delegate all logic to the service layer.
- **Services** (`@Service`): contain all business logic, convert between entities and DTOs, call repositories.
- **Repositories** (`@Repository` / `JpaRepository`): data access only — no business logic.
- **Entities** (`@Entity`): JPA-annotated domain objects — no business methods beyond getters/setters.
- **DTOs**: plain Java classes (or records) for API request/response payloads — never expose entities directly.

### 4.3 Controller Conventions

- Map to `/api/<pluralEntity>` (e.g., `/api/clients`, `/api/projects`).
- Use constructor injection — **no** `@Autowired` on fields.
- Return `ResponseEntity<T>` — always use appropriate HTTP status codes:
  - `200 OK` for successful reads/updates.
  - `201 Created` (with `Location` header) for creates.
  - `204 No Content` for deletes.
  - `404 Not Found` for missing resources.
- Validate request bodies with `@Valid` + Jakarta Validation annotations on DTOs.

### 4.4 Security

- Authentication is JWT-based with **HttpOnly cookies** (access + refresh tokens).
- JWT utilities live in `security/JwtUtil.java`; filter in `security/JwtAuthenticationFilter.java`.
- Cookie utilities live in `security/CookieUtil.java`.
- CORS config is in `config/CorsConfig.java`.
- Security filter chain is in `config/SecurityConfig.java`.
- **Never** return JWT tokens in JSON response bodies — they travel only via `Set-Cookie`.

### 4.5 Database

- Production: **MySQL** via `mysql-connector-j`.
- Development/testing: **H2** in-memory.
- JPA entity classes must use `@GeneratedValue(strategy = GenerationType.IDENTITY)` for IDs.
- Use descriptive `@Column` annotations with constraints.

### 4.6 Naming Conventions (Java)

| Element | Convention | Example |
|---|---|---|
| Package | lowercase, singular | `com.vizor.backend.controller` |
| Class | PascalCase | `ClientController` |
| Method | camelCase | `getAll()`, `createProject()` |
| DTO fields | camelCase | `clientName`, `createdAt` |
| REST path | kebab-case, plural | `/api/user-requests` |
| Constants | UPPER_SNAKE_CASE | `MAX_TOKEN_AGE` |

---

## 5. Cross-Cutting Rules

### 5.1 Error Handling

- **Backend**: Let Spring's `@ExceptionHandler` or `@ControllerAdvice` handle exceptions. Return meaningful error messages in a consistent JSON shape (`{ "message": "..." }`).
- **Frontend**: The global Axios error interceptor shows toasts — services should still `catch` for local fallback logic but must **not** show duplicate toasts.

### 5.2 Environment & Ports

| Service | Default Port |
|---|---|
| Spring Boot backend | `8080` |
| Next.js dev server | `4200` |
| Socket.IO (netty) | Configured in `SocketIOConfig.java` |

- The Next.js dev server proxies `/api/*` to `http://localhost:8080` via `next.config.mjs` rewrites.
- **Never hard-code `localhost:8080`** in frontend code — always use relative `/api/...` paths.

### 5.3 Git & Code Quality

- Do **not** commit `node_modules/`, `.next/`, `target/`, `*.log`, or test output files.
- Keep imports organized: third-party first, then project-absolute (`@/`), then relative.
- Preserve all existing comments and docstrings unless the change directly relates to them.
- When renaming or refactoring, update **all** references across both frontend and backend.

### 5.4 Testing

- **Backend**: Spring Boot Test + JUnit 5 — test files go in `src/test/java/`.
- **Frontend (legacy)**: Vitest — tests would go alongside components.
- Always verify the backend compiles (`mvnw.cmd compile`) after Java changes.
- Always verify the frontend builds (`npm run build`) after significant frontend changes.

### 5.5 Performance & Best Practices

- Use **Server Components** by default in Next.js — only add `'use client'` when the component needs hooks, event handlers, or browser APIs.
- Lazy-load heavy components with `dynamic(() => import(...))`.
- Avoid prop-drilling beyond 2 levels — use Context or Redux.
- Never store sensitive data (tokens, passwords) in Redux, localStorage, or component state.

---

## 6. Adding a New Feature (Checklist)

When adding a new domain entity or feature end-to-end:

### Backend
1. Create the **Entity** in `entity/`.
2. Create the **DTO** in `dto/`.
3. Create the **Repository** in `repository/`.
4. Create the **Service** in `service/`.
5. Create the **Controller** in `controller/`.
6. Add seed data in `config/DataSeeder.java` if needed.

### Frontend
1. Create a **Redux slice** in `store/<name>Slice.js` and register it in `store/index.js`.
2. Create a **service** in `services/<name>Service.js`.
3. Create the **page** in `app/(app)/<route>/page.jsx`.
4. Create **shared components** in `components/shared/` if reusable.
5. Add the route title in `lib/routeTitles.js`.
6. Update the **Sidebar** navigation in `components/layout/Sidebar.jsx`.
