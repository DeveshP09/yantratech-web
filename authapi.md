# YantraTech Backend — Authentication API Reference

Frontend integration guide for React Native (mobile) and React (web admin) clients.

> **Live base URL:** `https://yantratech-backend.onrender.com`
> **Phase status:** Auth endpoints (login, change-password, refresh, logout) are live.
> Profile and resource endpoints (Phase 3) are not yet built.

---

## Base URLs

| Environment | Base URL | Notes |
|---|---|---|
| Production (Render) | `https://yantratech-backend.onrender.com` | Free tier — 30–60s cold start after 15 min idle |
| Local dev | `http://127.0.0.1:8000` | After `python manage.py runserver` |
| Android emulator → host | `http://10.0.2.2:8000` | Android's loopback alias for host machine |
| Physical device on LAN | `http://<host-LAN-IP>:8000` | Run `runserver 0.0.0.0:8000`, add IP to `ALLOWED_HOSTS` |

All auth endpoints live under `/api/auth/`.

---

## Global Conventions

### Request headers
Every request with a body must send:
```
Content-Type: application/json
```

Authenticated endpoints additionally require:
```
Authorization: Bearer <access_token>
```

### Error response shapes

There are two distinct shapes — always check which one you're getting.

**Application error** (auth failures, business logic):
```json
{ "error": "stable_machine_code", "detail": "Human readable message" }
```
Branch on `error`, never on `detail`. `detail` is for display only.

**Validation error** (missing or invalid fields):
```json
{ "field_name": ["Error message."] }
```
Or for non-field errors:
```json
{ "non_field_errors": ["Error message."] }
```

### Token lifetimes
| Token | Lifetime | Notes |
|---|---|---|
| Access token | 30 min (production) | 1 year in local dev (`JWT_ACCESS_MINUTES` env) |
| Refresh token | 30 days | Single-use, rotates on every refresh call |

**Rotation policy:** `ROTATE_REFRESH_TOKENS=True` + `BLACKLIST_AFTER_ROTATION=True`.
Every successful `/refresh/` call issues a new refresh token and blacklists the old one immediately. Always replace both stored tokens after a refresh — never keep the old refresh token.

### Decoded JWT payload
```json
{
  "token_type":   "access",
  "exp":          1809288784,
  "iat":          1777752787,
  "jti":          "45ba5f83...",
  "user_id":      "1",
  "role":         "student",
  "name":         "Rahul Sharma",
  "institute_id": 1
}
```

`must_change_password` is **not** in the JWT. It is returned in the `user` object of `/login/` and `/change-password/` responses only. Route off the response body, not the token.

---

## Endpoints

---

### POST `/api/auth/login/`

Exchange phone + role + password for a JWT pair.

**Public** — no Authorization header required.

#### Request body

```json
{
  "phone": "+919999900001",
  "role": "student",
  "password": "Welcome@123"
}
```

| Field | Type | Required | Validation |
|---|---|---|---|
| `phone` | string | yes | E.164 format, e.g. `+919999900001` |
| `role` | string | yes | `student` \| `teacher` \| `admin` |
| `password` | string | yes | Plaintext over HTTPS |

#### Success — `200 OK`

```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Rahul Sharma",
    "role": "student",
    "institute_id": 1,
    "must_change_password": true
  }
}
```

If `must_change_password` is `true`, store the tokens and immediately route the user to the **Set New Password** screen. Do not allow access to any other screen until `/change-password/` succeeds.

#### Errors

| HTTP | `error` field | When |
|---|---|---|
| 400 | — (validation shape) | Missing or invalid field, e.g. `{"phone": ["This field is required."]}` |
| 401 | `invalid_credentials` | Wrong phone, wrong role, or wrong password — single error code so phone existence is not leaked |

---

### POST `/api/auth/change-password/`

Update the user's password and clear `must_change_password`. Returns a fresh JWT pair.

**Authenticated** — requires `Authorization: Bearer <access_token>`.

#### Request body

```json
{
  "old_password": "Welcome@123",
  "new_password": "NewPass456"
}
```

| Field | Type | Required | Validation |
|---|---|---|---|
| `old_password` | string | yes | Current password |
| `new_password` | string | yes | Min 8 chars, at least 1 letter, at least 1 digit, must differ from old |

#### Success — `200 OK`

```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Rahul Sharma",
    "role": "student",
    "institute_id": 1,
    "must_change_password": false
  }
}
```

A fresh JWT pair is returned. Replace both stored tokens immediately so the new state (`must_change_password: false`) takes effect.

#### Errors

| HTTP | `error` / shape | When |
|---|---|---|
| 400 | `wrong_old_password` | `old_password` does not match the current password |
| 400 | `{"new_password": ["..."]}` | New password failed complexity rules |
| 400 | `{"new_password": ["New password must be different from the old one."]}` | New password is same as old |
| 401 | — | Missing or expired Bearer token |

---

### POST `/api/auth/refresh/`

Rotate an expiring access token using the refresh token.

**Public** — no Authorization header required.

#### Request body

```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Success — `200 OK`

```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Both tokens are rotated. Store both. The old refresh token is blacklisted the moment this succeeds.

#### Errors

| HTTP | When |
|---|---|
| 401 | Refresh token is invalid, expired, or already used/blacklisted |

---

### POST `/api/auth/logout/`

Blacklist the refresh token so it cannot be used again.

**Public** — no Authorization header required (access token may already be expired at logout time).

#### Request body

```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Success — `200 OK`

Empty body.

#### Errors

| HTTP | When |
|---|---|
| 401 | Refresh token is invalid or already blacklisted |

> Access tokens are JWTs — they remain valid until natural expiry (30 min) even after logout. Clear both tokens from local storage immediately on logout regardless.

---

## Frontend Integration Guide

### Token storage

| Client | Recommended storage |
|---|---|
| React Native | `react-native-keychain` (iOS Keychain / Android Keystore) — **not** AsyncStorage |
| React web admin | `localStorage` is acceptable for a non-public admin tool |

Store two values: `accessToken` and `refreshToken`.

---

### Complete login flow

```
┌─────────────────────────────────────────────────────────────────┐
│  LOGIN SCREEN                                                   │
│                                                                 │
│  1. User selects role tab (Student / Teacher / Admin)           │
│  2. User enters phone + password                                │
│  3. POST /api/auth/login/                                       │
│                                                                 │
│  On 200:                                                        │
│    a. Store access + refresh tokens in secure storage           │
│    b. if user.must_change_password == true                      │
│         → route to SET NEW PASSWORD screen                      │
│       else                                                      │
│         → route to HOME (based on user.role)                   │
│                                                                 │
│  On 401 (error = "invalid_credentials"):                        │
│    → Show: "Phone, role, or password is incorrect"              │
│                                                                 │
│  On 400 (validation shape):                                     │
│    → Show field-level error inline                              │
└─────────────────────────────────────────────────────────────────┘
```

---

### Set new password flow (must_change_password = true)

```
┌─────────────────────────────────────────────────────────────────┐
│  SET NEW PASSWORD SCREEN                                        │
│  (shown immediately after login if must_change_password=true)   │
│                                                                 │
│  Fields: current password, new password, confirm new password   │
│                                                                 │
│  1. Validate new password == confirm password (client-side)     │
│  2. POST /api/auth/change-password/                             │
│     Headers: Authorization: Bearer <access from login>          │
│                                                                 │
│  On 200:                                                        │
│    a. Replace both stored tokens with response's fresh pair     │
│    b. Route to HOME                                             │
│                                                                 │
│  On 400 (wrong_old_password):                                   │
│    → Show: "Current password is incorrect"                      │
│                                                                 │
│  On 400 (new_password field error):                             │
│    → Show validator message inline under new password field     │
└─────────────────────────────────────────────────────────────────┘
```

---

### Authenticated request with auto-refresh

Every API call should go through a central `apiCall` wrapper that handles 401s automatically.

**JavaScript / React Native:**

```js
const BASE_URL = 'https://yantratech-backend.onrender.com';

async function apiCall(method, path, body = null) {
  const makeRequest = async (accessToken) => {
    return fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: body ? JSON.stringify(body) : null,
    });
  };

  let accessToken = await getStoredToken('access');
  let response = await makeRequest(accessToken);

  if (response.status === 401) {
    // Access token expired — try to refresh
    const refreshToken = await getStoredToken('refresh');
    const refreshResponse = await fetch(`${BASE_URL}/api/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (refreshResponse.status !== 200) {
      // Refresh token expired or blacklisted — force logout
      await clearStoredTokens();
      navigateTo('Login');
      throw new Error('session_expired');
    }

    const newTokens = await refreshResponse.json();
    await storeTokens(newTokens.access, newTokens.refresh); // store BOTH
    response = await makeRequest(newTokens.access);          // retry original request
  }

  return response;
}
```

---

### Logout

```js
async function logout() {
  const refreshToken = await getStoredToken('refresh');

  try {
    await fetch(`${BASE_URL}/api/auth/logout/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });
  } catch (_) {
    // Ignore network errors — clear tokens regardless
  }

  await clearStoredTokens();
  navigateTo('Login');
}
```

Always clear tokens locally even if the logout request fails.

---

### Cold start handling (Render free tier)

The Render free tier sleeps after 15 min of inactivity. The first request after sleep takes **30–60 seconds**.

- Set a minimum timeout of **90 seconds** on the login request
- Show a loading state like "Connecting to server…" that handles multi-second delays
- Optional: on app launch, fire a cheap warm-up request (e.g. `POST /api/auth/refresh/` with an empty body — it will return 401 immediately but starts the Render container waking up before the user types)

---

### Role-based routing after login

```js
function routeAfterLogin(user) {
  if (user.must_change_password) {
    navigateTo('SetNewPassword');
    return;
  }
  switch (user.role) {
    case 'student': navigateTo('StudentHome'); break;
    case 'teacher': navigateTo('TeacherHome'); break;
    case 'admin':   navigateTo('AdminHome');   break;
  }
}
```

---

## What is NOT implemented yet

| Phase | Endpoint | Status |
|---|---|---|
| Phase 3 | `GET /api/me/` — read own profile | not built |
| Phase 3 | `PATCH /api/me/` — update own profile | not built |
| Phase 3 | Role-scoped resource endpoints (students list, classes, etc.) | not built |
| Phase 4 | `POST /api/auth/forgot-password/` — self-service reset | not built |
| Paused | `POST /api/auth/request-otp/`, `/verify-otp/` | Code intact, URL routes commented out (Render SMTP blocked) |

---

## Change log

| Version | Notes |
|---|---|
| Phase 2.5 (current) | Password-based login, change-password, refresh, logout live on Render |
| Phase 2 (paused) | OTP request + verify — code preserved, routes commented |
| Phase 1 | Models, onboarding via Django admin |
