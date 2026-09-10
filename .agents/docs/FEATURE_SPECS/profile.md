# Feature Spec: User Profile & Admin User Management

> Specification covering user profiles, user management CRUD, and the User entity data model.

---

## 1. Overview

VIZOR has two user-related features:
1. **User Profile** — The currently logged-in user's session identity (via `AuthContext`)
2. **Admin User Management** — Full CRUD for managing all users in the system (AR admin only)

---

## 2. User Data Model

### 2.1 Entity — `User.java`

**Table**: `users`

| Field | Type | Column | Constraints |
|---|---|---|---|
| `id` | `Long` | `id` | PK, `@GeneratedValue(IDENTITY)` |
| `email` | `String` | `email` | `NOT NULL`, `UNIQUE` |
| `password` | `String` | `password` | `NOT NULL` (BCrypt hash) |
| `role` | `String` | `role` | `NOT NULL` (`"ar"` or `"member"`) |
| `name` | `String` | `name` | `NOT NULL` (display name) |
| `firstName` | `String` | `first_name` | — |
| `lastName` | `String` | `last_name` | — |
| `title` | `String` | `title` | — |
| `countryCode` | `String` | `country_code` | — |
| `phone` | `String` | `phone` | — |
| `salesforceCode` | `String` | `salesforce_code` | — |
| `primaryContact` | `Boolean` | `primary_contact` | — |
| `clientName` | `String` | `client_name` | — |
| `roundtables` | `String` | `roundtables` | `TEXT` (comma-separated) |
| `active` | `Boolean` | `is_active` | — |
| `locked` | `Boolean` | `is_locked` | — |
| `suspended` | `Boolean` | `is_suspended` | — |
| `enableNotifications` | `Boolean` | `enable_notifications` | — |
| `expiryDate` | `LocalDateTime` | `expiry_date` | — |
| `lastLoggedIn` | `LocalDateTime` | `last_logged_in` | — |

### 2.2 DTO — `UserDto.java`

Mirrors all entity fields. Includes `password` field (used on create/update; should be null on read responses to avoid leaking hashes).

### 2.3 Login DTOs

**`LoginRequest`**: `email` (@NotBlank, @Email) + `password` (@NotBlank)
**`LoginResponse`**: `email`, `role`, `name` (no token — cookies only)

---

## 3. API Endpoints

### 3.1 User CRUD — `/api/users`

| Method | Path | Description | Response |
|---|---|---|---|
| `GET` | `/api/users` | List all users | `200` + `UserDto[]` |
| `GET` | `/api/users/{id}` | Get user by ID | `200` + `UserDto` or `404` |
| `POST` | `/api/users` | Create a new user | `201` + `UserDto` + `Location` |
| `PUT` | `/api/users/{id}` | Update a user | `200` + `UserDto` or `404` |
| `DELETE` | `/api/users/{id}` | Delete a user | `204` or `404` |

### 3.2 Auth Profile — `/api/auth/me`

| Method | Path | Description | Response |
|---|---|---|---|
| `GET` | `/api/auth/me` | Get current user profile | `200` + `LoginResponse` or `401` |

---

## 4. Frontend Architecture

### 4.1 User Profile (AuthContext)

The logged-in user's profile is managed by `AuthContext`, **not** Redux.

**State shape**:
```js
{
  isLoggedIn: boolean,
  isArUser: boolean,       // true if role === 'ar'
  currentUser: {
    email: string,
    role: string,
    name: string
  } | null,
  ready: boolean           // true after initial /api/auth/me resolves
}
```

**Exposed functions**:
- `login(email, password)` — POST to `/api/auth/login`
- `logout()` — POST to `/api/auth/logout` + clear state + redirect
- `useAuth()` — hook to consume the context

### 4.2 User Management (Redux + Service)

**Redux Slice**: `src/store/userSlice.js`
- `loadUsers(users)` — set the full user list
- `addUser(user)` — add a new user
- `updateUser(user)` — update an existing user
- `deleteUser(id)` — remove a user

**Service**: `src/services/userService.js`
- `loadUsers()` — GET `/api/users` → dispatch `loadUsers`
- `addUser(user)` — POST `/api/users` → dispatch `addUser`
- `updateUser(user)` — PUT `/api/users/{id}` → dispatch `updateUser`
- `deleteUser(id)` — DELETE `/api/users/{id}` → dispatch `deleteUser`

### 4.3 Admin Pages

| Page | Route | File | Guard |
|---|---|---|---|
| User list | `/admin/users` | `app/(app)/admin/users/page.jsx` | `ArGuard` |
| Add user | `/admin/users/add` | `app/(app)/admin/users/add/page.jsx` | `ArGuard` |

**Route Titles** (from `routeTitles.js`):
- `/admin/users` → `"Users"`
- `/admin/users/add` → `"Add New User"`

---

## 5. User Lifecycle

### 5.1 Account States

| Flag | Purpose |
|---|---|
| `active` | Whether the user can access the system |
| `locked` | Account locked (e.g., too many failed logins) |
| `suspended` | Administratively suspended |
| `expiryDate` | Account expiration date |

### 5.2 Relationships

| Field | Relationship | Format |
|---|---|---|
| `clientName` | Client association | String (client name) |
| `roundtables` | Roundtable memberships | Comma-separated string (e.g., `"RONE, RTHIRD"`) |

---

## 6. Key Files

### Backend
- [User.java](file:///c:/react-projects/VIZOR/VIZOR/backend/src/main/java/com/vizor/backend/entity/User.java) — JPA entity with Builder
- [UserDto.java](file:///c:/react-projects/VIZOR/VIZOR/backend/src/main/java/com/vizor/backend/dto/UserDto.java) — Data transfer object
- [UserController.java](file:///c:/react-projects/VIZOR/VIZOR/backend/src/main/java/com/vizor/backend/controller/UserController.java) — REST controller
- [UserService.java](file:///c:/react-projects/VIZOR/VIZOR/backend/src/main/java/com/vizor/backend/service/UserService.java) — Business logic
- [LoginRequest.java](file:///c:/react-projects/VIZOR/VIZOR/backend/src/main/java/com/vizor/backend/dto/LoginRequest.java) — Login payload
- [LoginResponse.java](file:///c:/react-projects/VIZOR/VIZOR/backend/src/main/java/com/vizor/backend/dto/LoginResponse.java) — Auth response payload

### Frontend
- [AuthContext.jsx](file:///c:/react-projects/VIZOR/VIZOR/frontend-next/src/context/AuthContext.jsx) — Auth state management
- [userSlice.js](file:///c:/react-projects/VIZOR/VIZOR/frontend-next/src/store/userSlice.js) — Redux slice
- [userService.js](file:///c:/react-projects/VIZOR/VIZOR/frontend-next/src/services/userService.js) — API service
- [AuthGuard.jsx](file:///c:/react-projects/VIZOR/VIZOR/frontend-next/src/components/guards/AuthGuard.jsx) — Auth route guard
- [ArGuard.jsx](file:///c:/react-projects/VIZOR/VIZOR/frontend-next/src/components/guards/ArGuard.jsx) — AR-role route guard

---

## 7. Notes & Gotchas

1. **Password handling**: `UserDto.password` is included in the DTO but should be null in GET responses to avoid leaking BCrypt hashes. When creating/updating, the service should hash via `PasswordEncoder`.
2. **No dedicated profile page** yet — the logged-in user's info is shown in the `Header` component (name + email from `AuthContext`).
3. **Role is a string**, not an enum — currently only `"ar"` and `"member"` are used, but the system is extensible.
4. **Roundtables are comma-separated strings** — not a relational join table. This is a known simplification.
