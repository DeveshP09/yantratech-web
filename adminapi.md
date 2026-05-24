# YantraTech — Admin API Reference

Endpoints available to institute admins for managing batches, teachers, students, and subjects.

> All endpoints require `Authorization: Bearer <access_token>` where the token belongs to a user with `role: "admin"`.

---

## Base URLs

| Environment | Base URL |
|---|---|
| Production | `https://yantratech-backend.onrender.com` |
| Local dev | `http://127.0.0.1:8000` |

---

## Batch Endpoints

### GET `/api/batches/`

List all batches belonging to the logged-in admin's institute.

**Headers**
```
Authorization: Bearer <access_token>
```

**Success — `200 OK`**
```json
[
  { "id": 1, "name": "10", "section": "A" },
  { "id": 2, "name": "10", "section": "B" },
  { "id": 3, "name": "JEE Main", "section": "" }
]
```

**Errors**

| HTTP | When |
|---|---|
| 401 | Missing or expired token |
| 403 | Token belongs to a non-admin user |

---

### POST `/api/batches/`

Create a new batch under the admin's institute.

**Headers**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | yes | Batch label, e.g. `"10"`, `"XII"`, `"JEE Main Batch 1"` |
| `section` | string | no | Section label, e.g. `"A"`. Omit or send `""` if no sections. |

```json
{ "name": "10", "section": "A" }
```

**Success — `201 Created`**
```json
{ "id": 4, "name": "10", "section": "A" }
```

**Errors**

| HTTP | `error` | When |
|---|---|---|
| 400 | `batch_exists` | A batch with the same name + section already exists in this institute |
| 400 | (validation shape) | Missing required field |
| 401 | — | Missing or expired token |
| 403 | — | Token belongs to a non-admin user |

---

## Teacher Endpoints

### GET `/api/teachers/`

List all teachers in the logged-in admin's institute. Use this to populate the teacher dropdown when creating a subject.

**Headers**
```
Authorization: Bearer <access_token>
```

**Success — `200 OK`**
```json
[
  { "id": 5, "name": "Ramesh Kumar",  "phone": "+919999900010" },
  { "id": 6, "name": "Sunita Desai",  "phone": "+919999900011" }
]
```

**Errors**

| HTTP | When |
|---|---|
| 401 | Missing or expired token |
| 403 | Token belongs to a non-admin user |

---

## Student Endpoints

### POST `/api/students/`

Create a new student and assign them to a batch.

- Password is automatically set to `Welcome@123`
- `must_change_password` is `true` — student must set a new password on first login
- Student is scoped to the admin's institute automatically

**Headers**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `phone` | string | yes | E.164 format, e.g. `+919999900005`. Must be unique. |
| `name` | string | yes | Full name |
| `email` | string | no | Valid email address |
| `address` | string | no | Home address |
| `batch_id` | integer | yes | ID of a batch from `GET /api/batches/` |

```json
{
  "phone": "+919999900005",
  "name": "Priya Patil",
  "email": "priya@example.com",
  "address": "123 Main St, Pune",
  "batch_id": 1
}
```

**Success — `201 Created`**
```json
{
  "id": 12,
  "name": "Priya Patil",
  "phone": "+919999900005",
  "email": "priya@example.com",
  "address": "123 Main St, Pune",
  "batch_id": 1,
  "batch_name": "10 A"
}
```

**Errors**

| HTTP | `error` | When |
|---|---|---|
| 400 | `invalid_batch` | `batch_id` does not belong to this admin's institute |
| 400 | (validation shape) | Phone already exists, missing required field |
| 401 | — | Missing or expired token |
| 403 | — | Token belongs to a non-admin user |

---

### GET `/api/students/?batch_id=<id>`

List all students in a specific batch. The batch must belong to the admin's institute.

**Headers**
```
Authorization: Bearer <access_token>
```

**Query params**

| Param | Required | Notes |
|---|---|---|
| `batch_id` | yes | ID of the batch to fetch students for |

```
GET /api/students/?batch_id=1
```

**Success — `200 OK`**
```json
[
  {
    "id": 12,
    "name": "Priya Patil",
    "phone": "+919999900005",
    "email": "priya@example.com",
    "address": "123 Main St, Pune",
    "batch_id": 1,
    "batch_name": "10 A"
  },
  {
    "id": 13,
    "name": "Rahul Sharma",
    "phone": "+919999900006",
    "email": "",
    "address": "",
    "batch_id": 1,
    "batch_name": "10 A"
  }
]
```

**Errors**

| HTTP | `error` | When |
|---|---|---|
| 400 | `batch_id_required` | `batch_id` query param not provided |
| 400 | `invalid_batch` | `batch_id` does not belong to this admin's institute |
| 401 | — | Missing or expired token |
| 403 | — | Token belongs to a non-admin user |

---

## Subject Endpoints

### POST `/api/subjects/`

Create a new subject under a specific batch and optionally assign a teacher.

**Headers**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | yes | Subject name, e.g. `"Mathematics"`, `"Physics"` |
| `batch_id` | integer | yes | ID of a batch from `GET /api/batches/` |
| `teacher_id` | integer | no | `id` of a teacher from `GET /api/teachers/`. Omit or send `null` to leave unassigned. |

```json
{ "name": "Mathematics", "batch_id": 1, "teacher_id": 5 }
```

**Success — `201 Created`**
```json
{
  "id": 1,
  "name": "Mathematics",
  "batch_id": 1,
  "batch_name": "10 A",
  "teacher_id": 5,
  "teacher_name": "Ramesh Kumar"
}
```

If no teacher is assigned, `teacher_id` and `teacher_name` are `null`.

**Errors**

| HTTP | `error` | When |
|---|---|---|
| 400 | `invalid_batch` | `batch_id` does not belong to this admin's institute |
| 400 | `invalid_teacher` | `teacher_id` does not belong to this admin's institute |
| 400 | `subject_exists` | A subject with the same name already exists in this batch |
| 400 | (validation shape) | Missing required field |
| 401 | — | Missing or expired token |
| 403 | — | Token belongs to a non-admin user |

---

### GET `/api/subjects/?batch_id=<id>`

List all subjects for a specific batch.

**Headers**
```
Authorization: Bearer <access_token>
```

**Query params**

| Param | Required | Notes |
|---|---|---|
| `batch_id` | yes | ID of the batch to fetch subjects for |

```
GET /api/subjects/?batch_id=1
```

**Success — `200 OK`**
```json
[
  { "id": 1, "name": "Mathematics", "batch_id": 1, "batch_name": "10 A", "teacher_id": 5, "teacher_name": "Ramesh Kumar" },
  { "id": 2, "name": "Science",     "batch_id": 1, "batch_name": "10 A", "teacher_id": 6, "teacher_name": "Sunita Desai" },
  { "id": 3, "name": "English",     "batch_id": 1, "batch_name": "10 A", "teacher_id": null, "teacher_name": null }
]
```

**Errors**

| HTTP | `error` | When |
|---|---|---|
| 400 | `batch_id_required` | `batch_id` query param not provided |
| 400 | `invalid_batch` | `batch_id` does not belong to this admin's institute |
| 401 | — | Missing or expired token |
| 403 | — | Token belongs to a non-admin user |

---

## Attendance Endpoints

### GET `/api/attendance/`

Fetch attendance for a batch on a specific date. Returns all students in the batch with their present/absent status. Students with no record yet default to `is_present: false`.

**Headers**
```
Authorization: Bearer <access_token>
```

**Query params**

| Param | Required | Notes |
|---|---|---|
| `batch_id` | yes | ID of the batch |
| `date` | no | Format `YYYY-MM-DD`. Defaults to today's date if omitted. |

```
GET /api/attendance/?batch_id=1&date=2026-05-24
```

**Success — `200 OK`**
```json
{
  "date": "2026-05-24",
  "batch_id": 1,
  "students": [
    {
      "student_id": 12,
      "name": "Priya Patil",
      "phone": "+919999900005",
      "email": "priya@example.com",
      "roll_number": "01",
      "is_present": true,
      "attendance_id": 5
    },
    {
      "student_id": 13,
      "name": "Rahul Sharma",
      "phone": "+919999900006",
      "email": null,
      "roll_number": "02",
      "is_present": false,
      "attendance_id": null
    }
  ]
}
```

`attendance_id` is `null` when no record exists yet for that student on that date (i.e. attendance has not been marked at all for that day).

**Errors**

| HTTP | `error` | When |
|---|---|---|
| 400 | `batch_id_required` | `batch_id` query param not provided |
| 400 | `invalid_batch` | `batch_id` does not belong to this admin's institute |
| 401 | — | Missing or expired token |
| 403 | — | Token belongs to a non-admin user |

---

### POST `/api/attendance/mark/`

Mark or update attendance for students in a batch on a given date. Send the complete list of students with their status. Re-submitting the same date updates existing records.

**Headers**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `batch_id` | integer | yes | ID of the batch |
| `date` | string | yes | Format `YYYY-MM-DD` |
| `records` | array | yes | At least one entry required |
| `records[].student_id` | integer | yes | `student_id` from `GET /api/attendance/` |
| `records[].is_present` | boolean | yes | `true` for present, `false` for absent |

```json
{
  "batch_id": 1,
  "date": "2026-05-24",
  "records": [
    { "student_id": 12, "is_present": true  },
    { "student_id": 13, "is_present": false },
    { "student_id": 14, "is_present": true  }
  ]
}
```

**Success — `200 OK`**
```json
{
  "date": "2026-05-24",
  "batch_id": 1,
  "records": [
    { "student_id": 12, "is_present": true,  "attendance_id": 5 },
    { "student_id": 13, "is_present": false, "attendance_id": 6 },
    { "student_id": 14, "is_present": true,  "attendance_id": 7 }
  ]
}
```

**Errors**

| HTTP | `error` | When |
|---|---|---|
| 400 | `invalid_batch` | `batch_id` does not belong to this admin's institute |
| 400 | `invalid_students` | One or more `student_id` values are not in this batch |
| 400 | (validation shape) | Missing required field, empty records array |
| 401 | — | Missing or expired token |
| 403 | — | Token belongs to a non-admin user |

---

## Frontend Integration

### Typical flow for adding a student

```
1. GET /api/batches/
   → Populate batch dropdown in the UI

2. Admin fills: name, phone, email (optional), address (optional), selects batch

3. POST /api/students/ with the form data

4. On 201 → show success, student appears in the batch list
   On 400 phone exists → show "Phone number already registered"
   On 400 invalid_batch → batch selection error (shouldn't happen in normal flow)
```

### Fetching students for a batch screen

```
1. GET /api/students/?batch_id=<selected_batch_id>
   → Render student list for that batch

2. On 200 → display list
   On 400 invalid_batch → batch no longer exists, refresh batch list
```

### Attendance screen flow

```
On screen load:
  1. GET /api/batches/        → populate batch filter (select first batch by default)
  2. GET /api/attendance/?batch_id=<first_batch>&date=<today>
                              → render student list with toggle switches

On filter change (batch or date):
  3. GET /api/attendance/?batch_id=<selected>&date=<selected>
                              → re-render list

Admin toggles students, then taps Save:
  4. POST /api/attendance/mark/ with full records array

  On 200 → show "Attendance saved"
  On 400 invalid_students → one or more students changed batch (edge case — refetch list)
```

---

### Typical flow for managing subjects

```
1. GET /api/batches/
   → Populate batch dropdown

2. GET /api/teachers/
   → Populate teacher dropdown for subject assignment

3. GET /api/subjects/?batch_id=<id>
   → Show existing subjects for the selected batch

4. Admin fills subject name, selects batch, optionally selects teacher
   → POST /api/subjects/

5. On 201 → append to subject list
   On 400 subject_exists  → show "Subject already added to this batch"
   On 400 invalid_teacher → teacher selection error (shouldn't happen in normal flow)
```
