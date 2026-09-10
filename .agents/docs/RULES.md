# VIZOR — Coding Rules

> **Read this file before writing any code.** Every rule below is mandatory.

---

## 1. Golden Rules

1. **Never modify `frontend/`** — it is the legacy Angular app kept for reference only.
2. **All new frontend work goes into `frontend-next/`.**
3. **Never expose JPA entities through REST endpoints** — always use DTOs.
4. **Never store tokens in localStorage, sessionStorage, or JS variables** — auth uses HttpOnly cookies exclusively.
5. **Never hard-code `localhost:8080`** in frontend code — use relative `/api/…` paths.
6. **Always preserve existing comments and docstrings** unless the change directly relates to them.

---

## 2. Language & Framework Constraints

### Backend
- **Java 21** — use modern features (records, pattern matching, sealed classes) where they improve clarity.
- **Spring Boot 3.4** — follow Spring idioms.
- **Maven** build via `mvnw.cmd` (Windows).
- No Lombok — the project uses hand-written builders (see `User.java`, `ClientDto.java`).

### Frontend
- **JavaScript only** (`.js` / `.jsx`) — the project has no TypeScript yet. Do **not** introduce `.ts` / `.tsx` files.
- **Next.js 15** with the **App Router** — do not use the Pages Router.
- **React 19** — functional components with hooks only. No class components.
- Client components **must** start with `'use client';`.

---

## 3. Naming Conventions

### 3.1 Java

| Element | Convention | Example |
|---|---|---|
| Package | lowercase, singular | `com.vizor.backend.controller` |
| Class | PascalCase | `ClientController`, `ProjectService` |
| Method | camelCase | `getAll()`, `createProject()` |
| Field / DTO field | camelCase | `clientName`, `createdAt` |
| REST path | kebab-case, plural nouns | `/api/user-requests` |
| Constants | UPPER_SNAKE_CASE | `MAX_TOKEN_AGE`, `TYPE_ACCESS` |

### 3.2 JavaScript / JSX

| Element | Convention | Example |
|---|---|---|
| Component file | PascalCase `.jsx` | `SharedSearchbar.jsx` |
| CSS file | kebab-case `.css` | `shared-searchbar.css` |
| Service file | camelCase `.js` | `clientService.js` |
| Redux slice | camelCase `.js` | `clientSlice.js` |
| Function / variable | camelCase | `loadClients`, `isArUser` |
| CSS custom property | kebab-case | `--color-primary` |

---

## 4. Styling Rules

1. **Design tokens** live in `:root` inside `src/app/globals.css`. Always reference tokens (`var(--color-primary)`) — never hard-code hex values inline.
2. **Tailwind CSS 3** is enabled with **Preflight disabled** — PrimeReact ships its own reset.
3. Tailwind classes map to design tokens via `tailwind.config.js` — e.g., `text-primary`, `bg-bg-light`.
4. When a component needs styles beyond Tailwind utilities, create a **co-located `.css` file** next to the component.
5. Import CSS with a plain `import './sidebar.css';` — **not** CSS Modules (`.module.css`).
6. **Never override PrimeReact internals** with Tailwind `@apply`. Use `globals.css` overrides with specificity instead.
7. When adding new tokens, add them to **both** `:root` in `globals.css` **and** `tailwind.config.js`.

---

## 5. State Management Rules

| Concern | Where | How |
|---|---|---|
| **Domain data** (projects, clients, users, surveys, roundtables) | Redux Toolkit | Slices in `src/store/<entity>Slice.js`, registered in `src/store/index.js` |
| **Ephemeral UI state** (sidebar toggle, mobile menu) | React Context | `src/context/LayoutContext.jsx` |
| **Auth state** (current user, login status) | React Context | `src/context/AuthContext.jsx` |

- Use `useAppDispatch` / `useAppSelector` from `src/store/hooks.js` — not raw `useDispatch` / `useSelector`.
- **Do NOT mix** Redux and Context for the same concern.
- **Never** store sensitive data (tokens, passwords) in Redux or localStorage.

---

## 6. API & Service Rules

1. All HTTP calls go through the **shared Axios instance** (`src/lib/api.js`). Never create a second `axios.create()`.
2. Service files live in `src/services/<entity>Service.js`. Each module:
   - Imports `{ api }` from `@/lib/api`.
   - Imports `{ store }` from `@/store`.
   - Exports named async functions (`loadX`, `addX`, `updateX`, `deleteX`).
3. All API paths start with `/api/` — Next.js rewrites proxy them to Spring Boot at `localhost:8080`.
4. The Axios instance already provides:
   - `withCredentials: true` for cookie transport.
   - Automatic 401 → refresh → retry interceptor.
   - Global error toast interceptor (debounced, 5 s).
5. Services should `catch` errors for local fallback but must **not** show duplicate toasts.

---

## 7. Backend Architecture Rules

```
Controller → Service → Repository → Entity
     ↕             ↕
    DTO           DTO
```

- **Controllers**: Accept/return DTOs only. Delegate all logic to the service layer. Use constructor injection — **no** `@Autowired` on fields.
- **Services**: All business logic, entity↔DTO conversion.
- **Repositories**: Data access only — extend `JpaRepository`.
- **Entities**: JPA-annotated domain objects. ID strategy: `GenerationType.IDENTITY`.
- Return `ResponseEntity<T>` with correct HTTP status codes (`200`, `201`, `204`, `404`).
- Validate DTOs with `@Valid` + Jakarta Validation annotations.

---

## 8. Security Rules

- JWT authentication with **HttpOnly cookies** (`vizor_token` for access, `vizor_refresh` for refresh).
- **Never return tokens in JSON response bodies.**
- Access cookie path: `/` — sent with every request.
- Refresh cookie path: `/api/auth` — sent only to auth endpoints.
- `SecurityConfig.java` permits `/api/auth/**` and requires authentication on all other `/api/**`.
- Passwords: hashed with **BCrypt** via `PasswordEncoder`.

---

## 9. Import Order

Organize imports in this order, separated by blank lines:

### Java
1. `package` declaration
2. `java.*` / `jakarta.*`
3. Third-party (`com.*`, `org.*`, `io.*`)
4. Project (`com.vizor.backend.*`)

### JavaScript / JSX
1. Third-party (`react`, `next/*`, `primereact/*`, `@reduxjs/toolkit`)
2. Project-absolute (`@/store`, `@/lib/*`, `@/context/*`, `@/services/*`)
3. Relative (`./sidebar.css`, `./utils`)

---

## 10. Testing & Verification

| Layer | Tool | Command |
|---|---|---|
| Backend compile check | Maven | `.\mvnw.cmd compile` (from `backend/`) |
| Backend tests | JUnit 5 | `.\mvnw.cmd test` |
| Frontend build check | Next.js | `npm run build` (from `frontend-next/`) |
| Frontend dev server | Next.js | `npm run dev` (port 4200) |

- Always verify the backend compiles after Java changes.
- Always verify the frontend builds after significant frontend changes.

---

## 11. Git & Code Quality

- **Never commit**: `node_modules/`, `.next/`, `target/`, `*.log`, test output files.
- Keep diffs minimal — do not reformat unrelated code.
- When renaming or refactoring, update **all** references across both frontend and backend.
- One component per file.
- Avoid prop-drilling beyond 2 levels — use Context or Redux.

---

## 12. PrimeReact Usage

- Import from individual paths: `import { Button } from 'primereact/button';`
- Icons: **PrimeIcons** (`pi pi-<name>`) — do not add a separate icon library.
- Toast: use the global `showToast` from `@/lib/toast` — never create local `Toast` refs.
- Do not override PrimeReact styles directly in component CSS — use `globals.css` with specificity.
