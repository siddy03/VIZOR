# Feature Spec: Dashboard (Home Page)

> Specification for the VIZOR Home / Dashboard page.

---

## 1. Overview

The Dashboard is the **landing page** for authenticated users. It lives at `/home` and is the first page shown after login. Currently, it features a welcome message and an **API Sequential Fetch Demo** that demonstrates the Axios integration and real-time UI updates.

---

## 2. Route Information

| Property | Value |
|---|---|
| **Path** | `/home` |
| **File** | `src/app/(app)/home/page.jsx` |
| **CSS** | `src/app/(app)/home/home.css` |
| **Title** | `Home` (from `routeTitles.js`) |
| **Access** | Authenticated users (any role) |
| **Guard** | `AuthGuard` (via `(app)/layout.jsx`) |

---

## 3. Current Features

### 3.1 Welcome Section
- Heading: "Home Page"
- Welcome message: "Welcome to VIZOR!"

### 3.2 API Sequential Fetch Demo

A demonstration widget that sequentially fetches and displays posts from an external API.

**Behavior**:
1. User clicks "Start Sequential Fetch" button
2. Fetches posts (IDs 1-5) from `https://jsonplaceholder.typicode.com/posts`
3. Displays real-time logs with timestamps in a scrollable panel
4. Renders each post sequentially with 1-second delays between them
5. Shows post cards with ID, title, and body

**UI Elements**:
- **Button**: PrimeReact `<Button>` with play/spinner icon toggle
- **Logs Panel**: Real-time log entries with `info`, `success`, `error` styling
- **Results Panel**: Post cards rendered as `<article>` elements

**Accessibility**:
- `role="log"` with `aria-live="polite"` on log container
- `aria-busy` on the fetch button during loading
- Semantic `<section>` and `<article>` elements
- Unique `id` attributes for heading-based `aria-labelledby`

---

## 4. Implementation Pattern

```jsx
'use client';

import { useRef, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from 'primereact/button';
import './home.css';

export default function HomePage() {
  const [logs, setLogs] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  // Uses refs to accumulate during async sequences
  const logsRef = useRef([]);
  const postsRef = useRef([]);

  // ... sequential fetch logic
}
```

**Key Patterns Used**:
- `'use client'` — uses hooks and event handlers
- Shared Axios instance (`api`) from `@/lib/api`
- PrimeReact `Button` component
- PrimeIcons (`pi pi-play`, `pi pi-spinner`)
- Co-located CSS file (`home.css`)
- `useRef` for mutable accumulation during async sequences

---

## 5. Future Enhancement Opportunities

The dashboard is currently a demo page. Planned enhancements may include:

- **Summary cards** — Total counts for clients, projects, roundtables, surveys
- **Recent activity feed** — Latest actions across the platform
- **Quick actions** — Shortcuts to commonly used features
- **Charts & metrics** — Visual benchmarking summaries
- **Upcoming meetings** — Calendar widget
- **Survey status overview** — Active/pending/completed surveys

---

## 6. Key Files

- [page.jsx](file:///c:/react-projects/VIZOR/VIZOR/frontend-next/src/app/(app)/home/page.jsx) — Dashboard page component
- [home.css](file:///c:/react-projects/VIZOR/VIZOR/frontend-next/src/app/(app)/home/home.css) — Dashboard styles
- [routeTitles.js](file:///c:/react-projects/VIZOR/VIZOR/frontend-next/src/lib/routeTitles.js) — Route title mapping (`'/home': 'Home'`)
