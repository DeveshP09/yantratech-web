# System Design Document — Riggle-One Architecture Reference

> Feed this document to Claude Code at the start of any new project to enforce the same architectural patterns, conventions, and tooling decisions used in this codebase.

---

## 1. PROJECT OVERVIEW

**Type:** Production-scale React SPA (Single Page Application)
**Purpose:** Workspace/HRMS collaboration platform with real-time messaging, video calls, and HR management
**Tech Stack Summary:**
- Frontend: React 19, Vite 4, JavaScript (JSX — not TypeScript)
- State: Redux Toolkit + RTK Query + Redux-Persist
- UI: Ant Design 5 + Tailwind CSS 4 + SCSS
- Real-time: Native WebSocket + Context API
- Offline Storage: IndexedDB via Dexie.js
- Auth: JWT (access + refresh tokens) in localStorage

---

## 2. TECH STACK & DEPENDENCIES

### Core
| Package | Version | Purpose |
|---|---|---|
| react | 19.1.0 | UI library |
| react-dom | 19.1.0 | DOM renderer |
| react-router-dom | 7.6.3 | Client-side routing |
| vite | 4.5.2 | Build tool + dev server |

### State Management
| Package | Version | Purpose |
|---|---|---|
| @reduxjs/toolkit | 2.8.2 | Redux + RTK Query |
| react-redux | 9.2.0 | React bindings |
| redux-persist | 6.0.0 | localStorage persistence |

### UI & Styling
| Package | Version | Purpose |
|---|---|---|
| antd | 5.26.4 | Component library |
| tailwindcss | 4.1.11 | Utility CSS |
| sass | 1.89.2 | SCSS compilation |
| framer-motion | 12.23.0 | Animations |

### Networking
| Package | Version | Purpose |
|---|---|---|
| axios | 1.10.0 | HTTP client |
| react-use-websocket | 4.13.0 | WebSocket hook |

### Utilities
| Package | Version | Purpose |
|---|---|---|
| lodash | 4.17.21 | Utility functions |
| moment | 2.30.1 | Date formatting |
| dexie | 4.2.0 | IndexedDB ORM |

### When adding new dependencies:
- Prefer packages already used in this project over new ones
- Do NOT introduce TypeScript unless the project is already using it
- Do NOT add a new HTTP client if axios is present
- Do NOT add a new state manager if Redux Toolkit is present

---

## 3. FOLDER STRUCTURE

Every new project MUST follow this folder structure under `src/`:

```
src/
├── main.jsx                    # App entry — providers wrapped here
├── App.jsx                     # Minimal shell (routes only)
├── global.css                  # Tailwind imports + global CSS variables
├── custom.scss                 # AntD component overrides
│
├── assets/
│   ├── component-tokens/       # AntD theme token objects (one file per component)
│   ├── images/                 # Static image files
│   ├── svg/                    # SVG icons (as React components or files)
│   └── scss/                   # Component-specific SCSS files
│
├── components/
│   ├── common/                 # Generic reusable UI (inputs, modals, pickers)
│   ├── layout-components/      # Header, Sidebar, Navigation
│   ├── reUsable/               # Feature-specific reusable pieces
│   ├── shared-component/       # Cross-feature shared elements (avatars, tags)
│   └── util-component/         # Utility UI (icons, delete confirm, etc.)
│
├── pages/
│   ├── on-boarding/            # Auth flow (login, signup, setup)
│   ├── [feature]/              # One folder per major feature/section
│   └── index.jsx               # Central router config (ALL routes here)
│
├── redux/
│   ├── store.js                # Redux store + persist config
│   ├── slices/                 # One slice file per domain (login.js, hub.js)
│   └── api/                    # RTK Query API definitions
│       ├── baseQuery.js        # Custom axios adapter for RTK Query
│       └── [feature]Api.js     # One API file per domain
│
├── services/
│   ├── Apiservice.js           # Core axios handler (token refresh, interceptors)
│   └── [Feature]Services.js    # One service file per feature domain
│
├── contexts/
│   ├── ProtectedRoute.jsx      # Auth guard for private routes
│   ├── AuthRedirect.jsx        # Redirect authenticated users away from login
│   ├── AppInitializer.jsx      # App-wide initialization logic
│   └── webSocketServices.jsx   # WebSocket provider (if real-time needed)
│
├── hooks/
│   └── use[Name].jsx           # Custom hooks (camelCase, "use" prefix)
│
├── layouts/
│   └── app-layout/             # Main shell layout (header + sidebar + content)
│       └── index.jsx
│
├── configs/
│   ├── environmentConfig.js    # Env var exports
│   └── axiosRequest.js         # Axios instance factory
│
├── constant/
│   ├── common.js               # API URLs, app-wide constants, enum-like values
│   └── appConstants.js         # Feature constants
│
└── utilities/
    ├── commonUtils.js          # General helpers
    ├── validators.js           # Input validation rules
    └── notification.js         # Browser notification wrapper
```

### Rules:
- **Never put routes in App.jsx** — keep App.jsx minimal, all routes go in `pages/index.jsx`
- **One component per folder** — `components/common/LabeledInput/index.jsx`, not `components/LabeledInput.jsx`
- **Service files are plain JS** — no React inside `services/`
- **Hooks are pure React** — no direct API calls in hooks; call services from components/pages
- **Constants are strings/objects only** — no logic in `constant/`

---

## 4. COMPONENT CONVENTIONS

### File Naming
- Component files: `PascalCase` (e.g., `UserAvatar.jsx`, `SettingsModal.jsx`)
- Hook files: `camelCase` with `use` prefix (e.g., `useModal.jsx`, `useSelectAll.jsx`)
- Service files: `PascalCase` with `Service` suffix (e.g., `AuthServices.js`)
- Utility files: `camelCase` (e.g., `commonUtils.js`, `validators.js`)
- Slice files: `camelCase` (e.g., `login.js`, `hub.js`)

### Component Structure Pattern
```jsx
// Always: named export + default export
// No PropTypes — use inline JSDoc if documentation needed
// No TypeScript interfaces — plain JS

import React, { useState, useEffect } from 'react'
import { Form, Input } from 'antd'

// Functional component with destructured props
const LabeledInput = ({ label, name, rules, placeholder, isDatePicker = false }) => {
  return (
    <Form.Item name={name} rules={rules}>
      {isDatePicker ? <DatePicker /> : <Input placeholder={placeholder} />}
    </Form.Item>
  )
}

export default LabeledInput
```

### Component Categories
| Category | Location | Purpose |
|---|---|---|
| `common/` | `src/components/common/` | Wrappers around AntD (LabeledInput, CustomModal) |
| `layout-components/` | `src/components/layout-components/` | App chrome (header, sidebar) |
| `reUsable/` | `src/components/reUsable/` | Feature-specific but used in 2+ places |
| `shared-component/` | `src/components/shared-component/` | Cross-cutting UI (avatars, tags, user chips) |
| `util-component/` | `src/components/util-component/` | Stateless utility UI (icons, confirm dialogs) |
| Pages | `src/pages/[feature]/` | Route-level components (assembled from above) |

### Do NOT:
- Put business logic in layout components
- Import from `pages/` inside `components/`
- Use class components
- Use `React.FC` TypeScript type (project is plain JS)
- Write component-level PropTypes

---

## 5. STATE MANAGEMENT

### Architecture: Redux Toolkit + RTK Query + Redux-Persist

#### Store Setup (`src/redux/store.js`)
```javascript
import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['login', 'selectedHub', 'hubListing', 'userInfo'],  // Only persist critical state
}

const rootReducer = combineReducers({
  login: loginReducer,
  userInfo: userInfoReducer,
  selectedHub: selectedHubReducer,
  hubListing: hubListingReducer,
  // RTK Query reducers added here
  [featureApi.reducerPath]: featureApi.reducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(featureApi.middleware),
})
```

#### Slice Pattern (`src/redux/slices/login.js`)
```javascript
import { createSlice } from '@reduxjs/toolkit'

const loginSlice = createSlice({
  name: 'login',
  initialState: { tokens: null },
  reducers: {
    setTokens: (state, action) => { state.tokens = action.payload },
    clearTokens: (state) => { state.tokens = null },
  },
})

export const { setTokens, clearTokens } = loginSlice.actions
export default loginSlice.reducer
```

#### RTK Query API Pattern (`src/redux/api/usersApi.js`)
```javascript
import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from './baseQuery'

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: ({ hubId }) => ({ url: `/api/users/?hub=${hubId}`, method: 'GET' }),
      providesTags: ['User'],
    }),
  }),
})

export const { useGetUsersQuery } = usersApi
```

#### BaseQuery (`src/redux/api/baseQuery.js`)
```javascript
// Custom adapter that delegates to existing Apiservice functions
// DO NOT bypass Apiservice for RTK Query — always route through it
export const axiosBaseQuery = () => async ({ url, method, data }) => {
  try {
    let result
    if (method === 'GET') result = await apiGet(url)
    else if (method === 'POST') result = await apiPost(url, data)
    return { data: result }
  } catch (error) {
    return { error }
  }
}
```

### Rules:
- **Persist only critical state:** auth tokens, selected workspace, user info
- **Do NOT persist UI state** (open modals, active tabs, form values)
- **Use RTK Query for server state** — don't manually track loading/error in slices
- **Use slices only for client state** — auth tokens, workspace selection, user profile
- **One slice per domain** — don't create a mega-slice

---

## 6. API SERVICE LAYER

### Core Service (`src/services/Apiservice.js`)

All HTTP calls MUST go through `Apiservice.js`. This service handles:
- Authorization headers (Bearer token)
- Token refresh on 401 responses
- Request queuing during token refresh
- Email field normalization (trim + lowercase)
- FormData handling for file uploads
- Custom headers (`X-App-Name`, `X-Hub-ID`)

#### Exported Methods
```javascript
apiGet(url, queryParams = {}, isAuth = true)
apiPost(url, payload = {}, isFormData = false, isAuth = true)
apiPut(url, payload = {}, isFormData = false, isAuth = true)
apiPatch(url, payload = {}, isFormData = false, isAuth = true)
apiDelete(url, payload = {}, isAuth = true)
```

#### Token Refresh Pattern
```javascript
// When a 401 is received with "token_expired":
// 1. Pause all in-flight requests
// 2. Call refresh endpoint with refresh token
// 3. Store new tokens
// 4. Replay all queued requests with new token
```

#### Feature Service Pattern (`src/services/AuthServices.js`)
```javascript
// Each feature gets its own service file
// Services are plain functions — no classes, no singletons
// All functions are named exports

import { apiPost, apiGet } from './Apiservice'

export const login = (payload) => apiPost('/api/users/auth/login/', payload)
export const sendOtp = (payload) => apiPost('/api/users/auth/send_otp/', payload)
export const getUserProfile = () => apiGet('/api/users/me/')
```

### Rules:
- **Never use fetch() directly** — always use Apiservice methods
- **Never use axios directly** inside components or services — only in Apiservice.js
- **Never import axios in feature services** — they import from Apiservice.js only
- **One service file per feature domain** — AuthServices, ProfileServices, DashboardServices
- **Services return raw API response** — no transformation in services; transform in components or RTK Query

---

## 7. ROUTING

### Configuration (`src/pages/index.jsx`)

All routes defined in ONE place. No distributed routing.

```javascript
import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'

// Always lazy-load page-level components
const Dashboard = lazy(() => import('./dashboard'))
const Settings = lazy(() => import('./settings'))

const router = createBrowserRouter([
  // Public routes (no auth required)
  { path: '/welcome', element: <AuthRedirect><Login /></AuthRedirect> },
  { path: '/join/:slug', element: <JoinSlug /> },

  // Protected section
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <Outlet />
        </AppLayout>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <Suspense fallback={null}><Dashboard /></Suspense> },
      { path: 'settings/*', element: <Suspense fallback={null}><Settings /></Suspense> },
    ],
  },

  // Catch-all
  { path: '*', element: <Navigate to="/app" replace /> },
])
```

### Route Guards
- **`ProtectedRoute`** — wraps all authenticated routes; checks token + profile completion
- **`AuthRedirect`** — wraps auth pages; redirects logged-in users to app

```javascript
// ProtectedRoute logic:
// 1. No auth_token in localStorage → redirect to /welcome
// 2. No hub_id selected → redirect to hub selection
// 3. is_profile_complete === false → redirect to /setup-profile
// 4. All checks pass → render children
```

### Rules:
- **Always lazy-load** all page components with `React.lazy()`
- **Wrap lazy routes in `<Suspense fallback={null}>`**
- **Use `<Outlet />` for nested layouts** — never render children directly in layout
- **Catch-all `*` route redirects to app home** — never renders a 404 page unless explicitly required
- **`AuthRedirect` wraps login/signup** — prevents double-login

---

## 8. AUTHENTICATION & AUTHORIZATION

### Token Storage
```javascript
// Tokens stored in localStorage under key "auth_token"
// Structure:
{
  access: { token: "eyJ..." },
  refresh: { token: "eyJ..." }
}

// Hub ID stored separately:
localStorage.setItem('hub_id', hubId)
```

### Auth Flow
```
1. User submits login form
   → AuthServices.login(credentials)
   → On success: dispatch setTokens(tokens)
   → redux-persist saves to localStorage
   → Navigate to hub selection or app

2. Every API request:
   → Apiservice reads auth_token from localStorage
   → Adds "Authorization: Bearer {access.token}" header
   → On 401 "token_expired": refresh and retry

3. Logout:
   → clearTokens() dispatch
   → localStorage.removeItem('auth_token')
   → localStorage.removeItem('hub_id')
   → Navigate to /welcome
```

### Headers Added by Apiservice
```javascript
{
  'Authorization': `Bearer ${accessToken}`,
  'X-App-Name': 'rigglex-web',        // App identifier
  'X-Hub-ID': localStorage.hub_id,    // Current workspace
}
```

### Rules:
- **Never store tokens in Redux only** — also keep in localStorage for Apiservice access
- **Never decode JWT in components** — use `utilities/jwtDecode.js`
- **Hub selection is mandatory** before accessing app routes
- **Profile completion check runs after login** — incomplete profiles redirect to setup

---

## 9. STYLING SYSTEM

### Layer Order (highest to lowest specificity)
1. **Inline styles** — dynamic values only (animations, conditional colors)
2. **Component-specific SCSS** — `src/assets/scss/[component].scss`
3. **AntD overrides** — `src/custom.scss` (900+ lines of `:global` overrides)
4. **Tailwind utilities** — primary styling layer for layout and spacing
5. **AntD component tokens** — `src/assets/component-tokens/` for theme-level overrides

### Tailwind Configuration (`tailwind.config.js`)
```javascript
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#fc8c4d',       // Orange
        secondary: '#ff4d4f',     // Red
        'text-main': '#263238',
        'text-secondary': '#3c516d',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
}
```

### AntD Theme Configuration (`src/main.jsx`)
```javascript
// Theme tokens are imported from src/assets/component-tokens/
// Each file exports an object matching AntD component token structure
import buttonTokens from './assets/component-tokens/button'
import inputTokens from './assets/component-tokens/input'

const theme = {
  token: {
    colorPrimary: '#fc8c4d',
    borderRadius: 8,
    fontFamily: 'Poppins',
  },
  components: {
    Button: buttonTokens,
    Input: inputTokens,
    // ...
  },
}
```

### Styling Rules:
- **Tailwind for layout/spacing** — `flex`, `grid`, `mt-4`, `px-6`, `w-full`, etc.
- **AntD tokens for component theme** — don't override AntD with ad-hoc CSS if a token exists
- **SCSS only for AntD structural overrides** — things tokens can't reach
- **Never use Bootstrap or Material UI** — AntD is the component library
- **Never write plain CSS files** — use Tailwind or SCSS only
- **Color palette** — always use the custom Tailwind colors, never hardcode hex values in JSX

---

## 10. FORM HANDLING

### Pattern: AntD Form + LabeledInput wrapper

```jsx
// All forms use AntD Form
// Wrap Form.Item in a LabeledInput component for consistency

import { Form, Button } from 'antd'
import LabeledInput from 'components/common/LabeledInput'

const LoginForm = () => {
  const [form] = Form.useForm()

  const handleSubmit = async (values) => {
    // values are already trimmed by Form normalize
    await AuthServices.login(values)
  }

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      <LabeledInput
        label="Email"
        name="email"
        rules={[
          { required: true, message: 'Email is required' },
          { type: 'email', message: 'Enter a valid email' },
        ]}
        placeholder="you@example.com"
      />
      <LabeledInput
        label="Password"
        name="password"
        rules={[{ required: true, message: 'Password is required' }]}
        isPassword
      />
      <Button type="primary" htmlType="submit">Login</Button>
    </Form>
  )
}
```

### Validation Rules:
- Use AntD `rules` array — `required`, `type`, `min`, `max`, `pattern`, custom `validator`
- `validateTrigger={['onBlur', 'onChange']}` — validate on both events
- Email fields: normalize with `(value) => value?.trim().toLowerCase()`
- Numeric inputs: filter non-numeric keystrokes in `onKeyDown`

### Rules:
- **Always use `Form.useForm()`** — never use `ref` for form access
- **Never use uncontrolled inputs** without AntD Form wrapping
- **Validation is in the rules array** — never `if/else` validate in submit handler
- **Submit handler receives already-validated values** — trust the Form

---

## 11. REAL-TIME COMMUNICATION (WebSocket)

### Architecture: Context Provider Pattern

```javascript
// src/contexts/webSocketServices.jsx
// Single WebSocket connection managed as a Context
// All features subscribe via useContext(WebSocketContext)

const WebSocketProvider = ({ children }) => {
  const wsRef = useRef(null)
  const [connected, setConnected] = useState(false)

  // Connection lifecycle
  useEffect(() => {
    wsRef.current = new WebSocket(WS_URL)
    wsRef.current.onopen = () => setConnected(true)
    wsRef.current.onclose = () => reconnectWithBackoff()
    wsRef.current.onmessage = (event) => handleMessage(JSON.parse(event.data))
    return () => wsRef.current?.close()
  }, [authToken])

  const send = (type, payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, ...payload }))
    } else {
      queueMessage({ type, payload }) // IndexedDB pending queue
    }
  }

  return (
    <WebSocketContext.Provider value={{ connected, send }}>
      {children}
    </WebSocketContext.Provider>
  )
}
```

### Offline Message Queue:
- Messages sent while disconnected are stored in IndexedDB (`pending` table)
- On reconnect, pending messages are flushed in order
- Optimistic UI: message appears immediately with `isSending: true` flag
- On confirmation: flag removed; on failure: message marked as failed

### Rules:
- **One WebSocket connection for the entire app** — managed in Context
- **Never open WebSocket in a component** — use the context's `send` function
- **Always handle disconnect** — reconnect with exponential backoff
- **Queue offline messages** — never silently drop messages

---

## 12. OFFLINE STORAGE (IndexedDB)

### Library: Dexie.js

```javascript
// src/configs/chatDB.js
import Dexie from 'dexie'

const db = new Dexie('AppDatabase')

db.version(1).stores({
  messages: '++id, conversation_id, created_at',
  pendingMessages: '++id, conversation_id, queued_at',
  attachments: 'media_key, conversation_id',
  reactions: '++id, message_id',
})

export default db
```

### Usage Pattern:
```javascript
// Store messages
await db.messages.bulkPut(messages)

// Query messages for a conversation
const msgs = await db.messages
  .where('conversation_id')
  .equals(conversationId)
  .sortBy('created_at')

// Queue pending message
await db.pendingMessages.add({ ...message, queued_at: Date.now() })

// Flush pending on reconnect
const pending = await db.pendingMessages.toArray()
pending.forEach(msg => ws.send(msg))
await db.pendingMessages.clear()
```

### Rules:
- **IndexedDB for messages only** — not for app state (use Redux-Persist for that)
- **Always check IndexedDB before API** for chat history (cache-first)
- **Dexie.js only** — never use raw `indexedDB` API

---

## 13. MAIN.JSX PROVIDER STACK

Provider nesting order MUST be:
```jsx
<Provider store={store}>                    {/* Redux */}
  <PersistGate loading={null} persistor={persistor}>  {/* Redux Persist */}
    <WebSocketProvider>                     {/* Real-time (if applicable) */}
      <BrowserRouter>                       {/* Router */}
        <ConfigProvider theme={theme}>      {/* AntD theme */}
          <AppInitializer>                  {/* App init side effects */}
            <AppRouter />                   {/* Route definitions */}
          </AppInitializer>
        </ConfigProvider>
      </BrowserRouter>
    </WebSocketProvider>
  </PersistGate>
</Provider>
```

---

## 14. ENVIRONMENT CONFIGURATION

### Vite Config (`vite.config.js`)
```javascript
export default {
  plugins: [react()],
  envPrefix: 'RG_',            // Only RG_ prefixed vars are exposed to client
  server: {
    proxy: {
      '/api': {
        target: 'https://stag.api.rigglex.in',
        changeOrigin: true,
      },
    },
  },
}
```

### Environment Variables (`src/configs/environmentConfig.js`)
```javascript
// All env vars accessed through one file — never use import.meta.env directly in components
export const API_BASE_URL = import.meta.env.RG_API_BASE_URL || 'https://stag.api.rigglex.in'
export const WSS_URL = import.meta.env.RG_WSS_URL || 'wss://stag.api.rigglex.in/ws/'
```

### Rules:
- **All `import.meta.env` access in `environmentConfig.js` only**
- **Prefix all custom env vars with `RG_`** (or project-specific prefix)
- **API proxy in vite.config.js** for local dev (no CORS issues)
- **Never hardcode API URLs** in components or services

---

## 15. CODE QUALITY RULES

### ESLint
```javascript
// eslint.config.js
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh } },
  { rules: { ...reactHooks.configs.recommended.rules } },
]
```

### General Rules (enforced in this codebase):
- **No TypeScript** — project uses plain JSX
- **No PropTypes** — lean on runtime checks and code review
- **No class components** — function components only
- **No default exports from slices** unless it's the reducer
- **No direct DOM manipulation** — all through React state
- **No `var`** — use `const` and `let` only
- **Destructure props** in function signature, not inside the body
- **Named exports for utilities and hooks** — default exports for components and pages

---

## 16. LAYOUT SYSTEM

### App Layout (`src/layouts/app-layout/index.jsx`)
```
┌─────────────────────────────────┐
│         HeaderNav (fixed)       │
├──────────┬──────────────────────┤
│          │                      │
│ SideNav  │   <Outlet />         │
│(collapse)│   (page content)     │
│          │                      │
└──────────┴──────────────────────┘
```

- Mobile breakpoint: `< 768px` — sidebar hidden, hamburger menu
- Sidebar: collapsible, stores state in localStorage
- Header: workspace switcher, notifications, user menu

### Rules:
- **AppLayout wraps all authenticated pages** via the router
- **Never nest AppLayout** — one instance at the route level
- **Use `<Outlet />` for content injection** — never pass children to AppLayout

---

## 17. NAMING CONVENTIONS SUMMARY

| Item | Convention | Example |
|---|---|---|
| React components | PascalCase | `UserAvatar`, `SettingsModal` |
| React hook files | camelCase + `use` prefix | `useModal.jsx`, `useSelectAll.jsx` |
| Service files | PascalCase + `Services` | `AuthServices.js` |
| Redux slices | camelCase | `login.js`, `selectedHub.js` |
| RTK Query APIs | camelCase + `Api` | `usersApi.js` |
| Utility files | camelCase | `commonUtils.js` |
| Constants | `UPPER_SNAKE_CASE` for values | `const API_BASE_URL = ...` |
| CSS classes (Tailwind) | kebab-case (standard) | `text-main`, `shadow-card` |
| Context files | PascalCase | `WebSocketContext.js` |
| Page folders | kebab-case | `on-boarding/`, `r-one/` |

---

## 18. ANTI-PATTERNS — NEVER DO THESE

1. **Don't fetch data in `useEffect` directly in components** — use RTK Query hooks or call services inside event handlers
2. **Don't put route definitions in feature files** — all routes in `pages/index.jsx`
3. **Don't use React Context for global server state** — use RTK Query
4. **Don't import components from `pages/`** — pages import from `components/`, not vice versa
5. **Don't use `useState` for auth tokens** — always Redux + localStorage
6. **Don't use `setTimeout` for async UX feedback** — use loading states from RTK Query
7. **Don't hardcode colors in JSX** — use Tailwind custom color tokens
8. **Don't create new axios instances** — all requests through `Apiservice.js`
9. **Don't use `index.js` as a barrel re-export** — import directly from component files
10. **Don't create utility functions inside components** — move to `utilities/`

---

## 19. FEATURE DEVELOPMENT CHECKLIST

When building a new feature, follow this sequence:

1. **Constants** — add any API URLs to `constant/common.js`
2. **Service** — create or update `services/[Feature]Services.js`
3. **Redux** — add slice (`redux/slices/`) or RTK Query endpoint (`redux/api/`)
4. **Components** — build UI in `components/` (atomic) first
5. **Page** — assemble components in `pages/[feature]/`
6. **Route** — register route in `pages/index.jsx`
7. **Permissions** — wrap route with `ProtectedRoute` if auth required

---

## 20. PROJECT SETUP COMMANDS

```bash
# Install
npm install

# Dev server (with API proxy)
npm run dev

# Production build
npm run build

# Lint
npm run lint

# Preview production build
npm run preview
```

---

*This document describes the architecture of the Riggle-One project. Apply all patterns described here when building any new features or companion projects.*
