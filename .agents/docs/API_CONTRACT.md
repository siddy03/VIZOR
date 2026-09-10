# VIZOR — API Contract

> Complete REST API and Socket.IO event contract between frontend and backend.

---

## 1. General Conventions

- **Base URL**: All endpoints are under `/api/`
- **Content-Type**: `application/json`
- **Authentication**: HttpOnly cookies (`vizor_token` for access, `vizor_refresh` for refresh)
- **Error shape**: `{ "message": "..." }` with appropriate HTTP status
- **ID type**: `Long` (auto-generated, `GenerationType.IDENTITY`)

### HTTP Status Codes

| Status | Usage |
|---|---|
| `200 OK` | Successful GET, PUT |
| `201 Created` | Successful POST (with `Location` header) |
| `204 No Content` | Successful DELETE |
| `401 Unauthorized` | Missing/invalid/expired auth |
| `404 Not Found` | Resource not found |

---

## 2. Authentication — `/api/auth`

### `POST /api/auth/login`

Authenticates a user. Sets `vizor_token` and `vizor_refresh` HttpOnly cookies.

**Request Body** (`LoginRequest`):
```json
{
  "email": "ar@ar.com",        // @NotBlank, @Email
  "password": "ar123"          // @NotBlank
}
```

**Success Response** (`200 OK`, `LoginResponse`):
```json
{
  "email": "ar@ar.com",
  "role": "ar",
  "name": "AR Admin"
}
```
_+ `Set-Cookie: vizor_token=<JWT>; HttpOnly; Path=/`_
_+ `Set-Cookie: vizor_refresh=<JWT>; HttpOnly; Path=/api/auth`_

**Failure Response** (`401`):
```json
{ "message": "Invalid email or password" }
```

---

### `POST /api/auth/refresh`

Rotates both tokens using the refresh cookie. No request body needed.

**Success Response** (`200 OK`, `LoginResponse`):
```json
{
  "email": "ar@ar.com",
  "role": "ar",
  "name": "AR Admin"
}
```
_+ new `Set-Cookie` headers for both tokens_

**Failure Response** (`401`):
```json
{ "message": "Unauthorized" }
```

---

### `POST /api/auth/logout`

Clears both auth cookies. No request body needed.

**Response** (`200 OK`):
```json
{ "message": "Logged out" }
```
_+ `Set-Cookie` with `maxAge=0` for both cookies_

---

### `GET /api/auth/me`

Returns the current authenticated user based on the access cookie.

**Success Response** (`200 OK`, `LoginResponse`):
```json
{
  "email": "ar@ar.com",
  "role": "ar",
  "name": "AR Admin"
}
```

**Failure Response** (`401`):
```json
{ "message": "Unauthorized" }
```

---

## 3. Users — `/api/users`

> Protected (requires valid access cookie)

### `GET /api/users`
Returns all users.

**Response** (`200 OK`, `UserDto[]`):
```json
[
  {
    "id": 1,
    "email": "ar@ar.com",
    "role": "ar",
    "name": "AR Admin",
    "firstName": "AR",
    "lastName": "Admin",
    "title": "Administrator",
    "countryCode": "+1",
    "phone": "0000000000",
    "salesforceCode": null,
    "primaryContact": null,
    "clientName": "Auriemma",
    "roundtables": "RONE, RTHIRD",
    "active": true,
    "locked": false,
    "suspended": false,
    "enableNotifications": true,
    "expiryDate": null,
    "lastLoggedIn": null,
    "password": null
  }
]
```

### `GET /api/users/{id}`
Returns a single user by ID.

**Response** (`200 OK`, `UserDto`) or `404 Not Found`.

### `POST /api/users`
Creates a new user.

**Request Body** (`UserDto`): Full user payload.

**Response** (`201 Created`, `UserDto`) + `Location: /api/users/{id}`.

### `PUT /api/users/{id}`
Updates an existing user.

**Request Body** (`UserDto`): Full user payload.

**Response** (`200 OK`, `UserDto`) or `404 Not Found`.

### `DELETE /api/users/{id}`
Deletes a user.

**Response** (`204 No Content`) or `404 Not Found`.

---

## 4. Clients — `/api/clients`

> Protected

### `GET /api/clients`
**Response** (`200 OK`, `ClientDto[]`):
```json
[
  {
    "id": 1,
    "name": "Auriemma",
    "abbreviation": "AR",
    "parentClient": null,
    "peerGroups": "PG1",
    "roundtables": "RONE",
    "projects": "Project Alpha",
    "domains": ["auriemma.com"],
    "identityProvider": null,
    "active": true,
    "selfDatabase": false,
    "status": "Active",
    "peerGroupIds": null,
    "roundtableIds": null,
    "projectIds": null
  }
]
```

### `GET /api/clients/{id}`
**Response** (`200 OK`, `ClientDto`) or `404 Not Found`.

### `POST /api/clients`
**Request Body** (`ClientDto`): Full client payload.

**Response** (`201 Created`, `ClientDto`) + `Location: /api/clients/{id}`.

### `PUT /api/clients/{id}`
**Request Body** (`ClientDto`): Full client payload.

**Response** (`200 OK`, `ClientDto`) or `404 Not Found`.

### `DELETE /api/clients/{id}`
**Response** (`204 No Content`) or `404 Not Found`.

---

## 5. Projects — `/api/projects`

> Protected

### `GET /api/projects`
**Response** (`200 OK`, `ProjectDto[]`):
```json
[
  {
    "id": 1,
    "name": "Project Alpha",
    "abbreviation": "PA",
    "clientsWithAccess": "Auriemma",
    "directors": "Jane Doe",
    "associates": "John Smith",
    "projectType": "Research",
    "description": "...",
    "status": "Active",
    "clientIds": null,
    "directorIds": null,
    "associateIds": null,
    "primaryDirector": null,
    "primaryAssociate": null,
    "selectedProjectType": null
  }
]
```

### `GET /api/projects/{id}`
**Response** (`200 OK`, `ProjectDto`) or `404 Not Found`.

### `POST /api/projects`
**Response** (`201 Created`, `ProjectDto`) + `Location: /api/projects/{id}`.

### `PUT /api/projects/{id}`
**Response** (`200 OK`, `ProjectDto`) or `404 Not Found`.

### `DELETE /api/projects/{id}`
**Response** (`204 No Content`) or `404 Not Found`.

---

## 6. Roundtables — `/api/roundtables`

> Protected

### `GET /api/roundtables`
**Response** (`200 OK`, `RoundtableDto[]`):
```json
[
  {
    "id": 1,
    "name": "RONE",
    "abbreviation": "R1",
    "clientsWithAccess": 5,
    "directors": "Jane Doe",
    "associates": "John Smith",
    "description": "...",
    "status": "Active",
    "clientIds": null,
    "directorIds": null,
    "associateIds": null,
    "primaryDirector": null,
    "primaryAssociate": null
  }
]
```

### `GET /api/roundtables/{id}`
**Response** (`200 OK`, `RoundtableDto`) or `404 Not Found`.

### `POST /api/roundtables`
**Response** (`201 Created`, `RoundtableDto`) + `Location: /api/roundtables/{id}`.

### `PUT /api/roundtables/{id}`
**Response** (`200 OK`, `RoundtableDto`) or `404 Not Found`.

### `DELETE /api/roundtables/{id}`
**Response** (`204 No Content`) or `404 Not Found`.

---

## 7. Surveys — `/api/surveys`

> Protected

### `GET /api/surveys`
**Response** (`200 OK`, `SurveyDto[]`):
```json
[
  {
    "id": 1,
    "source": "Internal",
    "entity": "Auriemma",
    "surveyType": "Quarterly",
    "surveyName": "Q1 2025 Survey",
    "period": "Q1",
    "periodNumber": "1",
    "year": 2025,
    "startDate": "2025-01-01",
    "endDate": "2025-03-31",
    "firstAlertDate": "2024-12-15",
    "reminderDate": "2025-03-15",
    "isInteractiveReports": true,
    "isActive": true,
    "lastStep": 3,
    "status": "Published",
    "questionSections": [...],
    "participantSelections": [...]
  }
]
```

### `GET /api/surveys/{id}`
**Response** (`200 OK`, `SurveyDto`) or `404 Not Found`.

### `POST /api/surveys`
**Response** (`201 Created`, `SurveyDto`) + `Location: /api/surveys/{id}`.

### `PUT /api/surveys/{id}`
**Response** (`200 OK`, `SurveyDto`) or `404 Not Found`.

### `DELETE /api/surveys/{id}`
**Response** (`204 No Content`) or `404 Not Found`.

---

## 8. User Requests — `/api/user-requests`

> Protected. **Note**: This controller currently exposes the entity directly (no DTO layer).

### `GET /api/user-requests`
**Response** (`200 OK`, `UserRequest[]`).

### `POST /api/user-requests`
**Request Body** (`UserRequest`): Raw entity payload.

**Response** (`200 OK`, `UserRequest`).

### `DELETE /api/user-requests/{id}`
**Response** (`204 No Content`) or `404 Not Found`.

---

## 9. Socket.IO — Community Chat

> Server: `localhost:9092` (Netty Socket.IO)

### Connection
```js
const socket = io('http://localhost:9092', {
  withCredentials: true,
  transports: ['websocket', 'polling']
});
```

### Client → Server Events

| Event | Payload | Description |
|---|---|---|
| `chat:send` | `{ senderId, senderName, text }` | Send a chat message |

### Server → Client Events

| Event | Payload | Description |
|---|---|---|
| `chat:message` | `{ id, senderId, senderName, text, timestamp }` | Broadcasted to all connected clients |

### Payload Schema (`ChatMessageDto`)
```json
{
  "id": "uuid-string",          // Server-generated
  "senderId": "per-tab-uuid",   // Client-generated (sessionStorage)
  "senderName": "AR Admin",     // Display name
  "text": "Hello everyone",     // Message content
  "timestamp": 1719746400000    // Server-stamped epoch ms
}
```

---

## 10. Frontend API Integration Summary

| Frontend Service | Backend Endpoint | Redux Slice |
|---|---|---|
| `clientService.js` | `/api/clients` | `clientSlice.js` |
| `projectService.js` | `/api/projects` | `projectSlice.js` |
| `roundtableService.js` | `/api/roundtables` | `roundtableSlice.js` |
| `surveyService.js` | `/api/surveys` | `surveySlice.js` |
| `userService.js` | `/api/users` | `userSlice.js` |
| `chatSocketService.js` | Socket.IO `:9092` | _(local state)_ |
| `AuthContext.jsx` | `/api/auth/*` | _(React Context)_ |

### Axios Interceptor Behavior

1. **401 on a protected endpoint** → auto-refresh via `POST /api/auth/refresh` → retry original request.
2. **401 on auth endpoints** (`/api/auth/login`, `/api/auth/refresh`) → no auto-refresh (avoids loop).
3. **Any error (non-auth)** → global toast notification (debounced 5s).
4. **Refresh failure** → `vizor:session-expired` custom event → redirect to `/login`.
