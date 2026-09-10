# VIZOR — Components Reference

> Catalog of all reusable and layout components in `frontend-next/src/components/`.

---

## 1. Component Inventory

| Component | Path | Type | Description |
|---|---|---|---|
| **Sidebar** | `components/layout/Sidebar.jsx` | Layout | Main navigation sidebar with collapsible menu groups |
| **Header** | `components/layout/Header.jsx` | Layout | Top header bar with breadcrumbs, search, and user menu |
| **AuthGuard** | `components/guards/AuthGuard.jsx` | Guard | Redirects to `/login` if user is not authenticated |
| **ArGuard** | `components/guards/ArGuard.jsx` | Guard | Redirects to `/login` if user is not an AR admin |
| **SurveyGuard** | `components/guards/SurveyGuard.jsx` | Guard | Route protection for survey-specific pages |
| **Table1** | `components/shared/Table1.jsx` | Shared | Primary data table with sorting, filtering, and actions |
| **Table2** | `components/shared/Table2.jsx` | Shared | Secondary data table variant |
| **SharedSearchbar** | `components/shared/SharedSearchbar.jsx` | Shared | Reusable search input with debounce |
| **SharedDropdown** | `components/shared/SharedDropdown.jsx` | Shared | Styled dropdown wrapper around PrimeReact Dropdown |
| **Stepper** | `components/shared/Stepper.jsx` | Shared | Multi-step form wizard navigation |
| **Breadcrumb** | `components/shared/Breadcrumb.jsx` | Shared | Breadcrumb trail navigation |
| **PlaceholderPage** | `components/shared/PlaceholderPage.jsx` | Shared | Empty-state placeholder for pages under construction |

---

## 2. Layout Components

### 2.1 Sidebar

**File**: `components/layout/Sidebar.jsx` + `sidebar.css`
**Size**: ~13 KB (largest frontend component)

**Responsibilities**:
- Renders the main navigation menu with collapsible groups
- Highlights active route
- Supports collapsed state (icons only) and mobile overlay mode
- Uses PrimeIcons for menu item icons
- Reads/writes sidebar state via `LayoutContext`

**Props**: None (reads from context and Redux)

**Dependencies**:
- `useLayout()` from `LayoutContext` — sidebar collapsed state
- `useAuth()` from `AuthContext` — role-based menu visibility
- `next/navigation` — `usePathname()` for active route
- `next/link` — `<Link>` for navigation

**CSS**: `sidebar.css` (6.9 KB) — extensive styling for expanded, collapsed, mobile, and hover states.

---

### 2.2 Header

**File**: `components/layout/Header.jsx` + `header.css`

**Responsibilities**:
- Displays the current page title from `LayoutContext`
- Renders breadcrumb navigation
- Provides a search bar
- Shows user menu with logout action
- Hamburger toggle for mobile sidebar

**Props**: None (reads from context)

**Dependencies**:
- `useLayout()` — page title, sidebar toggle
- `useAuth()` — current user info, logout function

---

## 3. Guard Components

### 3.1 AuthGuard

**File**: `components/guards/AuthGuard.jsx`

**Purpose**: Wraps the `(app)` route group layout. Blocks rendering and redirects to `/login` if the user is not authenticated.

**Logic**:
```
if (ready && !isLoggedIn) → router.replace('/login')
if (!ready || !isLoggedIn) → render null (blank screen during check)
else → render children
```

**Usage**: Used in `src/app/(app)/layout.jsx` to wrap the entire authenticated shell.

---

### 3.2 ArGuard

**File**: `components/guards/ArGuard.jsx`

**Purpose**: Restricts access to AR-only pages (admin portal). Redirects non-AR users to `/login`.

**Logic**:
```
if (ready && !(isLoggedIn && isArUser)) → router.replace('/login')
```

**Usage**: Wrap admin pages that require the `"ar"` role.

---

### 3.3 SurveyGuard

**File**: `components/guards/SurveyGuard.jsx`

**Purpose**: Validates survey-specific route access (e.g., ensuring a survey ID exists before rendering).

---

## 4. Shared Components

### 4.1 Table1

**File**: `components/shared/Table1.jsx` + `table1.css`
**Size**: ~5 KB

**Purpose**: Primary data table used across admin CRUD pages.

**Features**:
- Column sorting
- Row selection
- Action buttons (edit, delete)
- Empty state
- Integrates with PrimeReact `DataTable`

**Usage Pattern**:
```jsx
<Table1
  data={items}
  columns={columnDefinitions}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

---

### 4.2 Table2

**File**: `components/shared/Table2.jsx` + `table2.css`
**Size**: ~3.5 KB

**Purpose**: Alternative table variant — typically used for read-only listings or secondary data displays.

---

### 4.3 SharedSearchbar

**File**: `components/shared/SharedSearchbar.jsx` + `shared-searchbar.css`

**Purpose**: Reusable search input with consistent styling across all list pages.

**Features**:
- Controlled input with `value` and `onChange` props
- Search icon integration (PrimeIcons)
- Consistent design token styling

---

### 4.4 SharedDropdown

**File**: `components/shared/SharedDropdown.jsx` + `shared-dropdown.css`

**Purpose**: Styled wrapper around PrimeReact's `Dropdown` component with consistent visual treatment.

---

### 4.5 Stepper

**File**: `components/shared/Stepper.jsx` + `stepper.css`
**Size**: ~2.7 KB

**Purpose**: Multi-step form wizard used in survey creation and other multi-step workflows.

**Features**:
- Step indicators with numbered circles
- Active/completed/upcoming step states
- Click navigation between completed steps
- Responsive design

---

### 4.6 Breadcrumb

**File**: `components/shared/Breadcrumb.jsx` + `breadcrumb.css`

**Purpose**: Breadcrumb trail showing the current navigation path.

**Features**:
- Auto-generates from the current route
- Clickable parent segments
- Styled with design tokens (`--color-bold-breadcrumb`, `--color-normal-breadcrumb`)

---

### 4.7 PlaceholderPage

**File**: `components/shared/PlaceholderPage.jsx`
**Size**: ~400 bytes

**Purpose**: Lightweight empty-state component for pages that haven't been built yet. Shows a "Coming Soon" or similar message.

---

## 5. Component Creation Rules

When creating a new component, follow these conventions:

### File Structure
```
components/shared/
├── MyComponent.jsx      # PascalCase component file
└── my-component.css     # kebab-case co-located CSS
```

### Template
```jsx
'use client';

import React from 'react';
import './my-component.css';

export function MyComponent({ prop1, prop2 }) {
  return (
    <div className="my-component">
      {/* ... */}
    </div>
  );
}
```

### Checklist
- [ ] `'use client';` if using hooks, events, or browser APIs
- [ ] Functional component with destructured props
- [ ] PascalCase file name, named export
- [ ] Co-located kebab-case CSS file
- [ ] Use design tokens (`var(--color-primary)`) not hard-coded colors
- [ ] Use PrimeReact components for standard UI elements
- [ ] Use PrimeIcons (`pi pi-<name>`) for icons
- [ ] Use `showToast()` from `@/lib/toast` for notifications
- [ ] One component per file
