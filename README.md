# School Management System REST API

A backend-only School Management System API built with **Node.js** and **Express.js**.
It uses **in-memory arrays** instead of a real database, **JWT** authentication, **bcrypt**
password hashing, strict request validation, role-based authorization, request logging
and rate limiting.

---

## 1. Features

| Area | What is implemented |
| --- | --- |
| Authentication | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Authorization | Role-based middleware for `admin`, `teacher`, `student` |
| Passwords | Hashed with bcrypt, never stored or returned in plain text |
| Validation | Schema-driven validation of body, params and query (all errors reported at once) |
| CRUD | Students, Teachers, Classes, Subjects, Results |
| Relations | Student → Result → Subject, Student → Class, Teacher → Subject |
| Security | helmet headers, 10 kB body cap, rate limiting, safe error messages |
| Observability | Request logger: method, URL, status code, timestamp |
| Errors | One global error handler, consistent JSON responses |
| Testing | Postman collection with 64 requests (happy paths + 400/401/403/404/409) |

---

## 2. Tech stack

- Node.js 18+ (tested on 20)
- Express 4
- `jsonwebtoken`, `bcryptjs`, `dotenv`, `helmet`, `express-rate-limit`

No database, no frontend, no extra frameworks.

---

## 3. Setup

```bash
npm install
cp .env.example .env      # then edit JWT_SECRET
npm run dev               # development (nodemon)
# or
npm start                 # production
```

Generate a strong secret for `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

The server refuses to start if `JWT_SECRET` is missing or shorter than 32 characters.

Health check:

```bash
curl http://localhost:5000/api/health
```

> All data lives in memory: restarting the server resets it to the seeded demo data.

---

## 4. Environment variables (`.env`)

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `PORT` | no | `5000` | Port the API listens on |
| `JWT_SECRET` | **yes** | – | Secret used to sign/verify tokens (min 32 chars) |
| `JWT_EXPIRES_IN` | no | `1h` | Token lifetime |
| `BCRYPT_SALT_ROUNDS` | no | `10` | bcrypt cost factor |
| `NODE_ENV` | no | `development` | Environment name |

`.env` is git-ignored. Use `.env.example` as the template.

---

## 5. Seeded demo data

Accounts (passwords are bcrypt hashes in `src/data/users.js`):

| Role | Email | Password |
| --- | --- | --- |
| admin | `admin@school.test` | `Admin@123` |
| teacher | `teacher@school.test` | `Teacher@123` |
| student | `student@school.test` | `Student@123` |

Also seeded: 3 classes, 5 subjects, 4 students, 2 teachers, 4 results, all linked by id
(student 1 → results 1 & 2 → subjects 1 & 2, and so on).

### How the tables relate

```
User (login, holds the role)
 ├── role=student → studentId ──► Student ──► classId ──► Class
 ├── role=teacher → teacherId ──► Teacher ──► subjectId ──► Subject
 └── role=admin   → full access

Result ──► studentId ──► Student
        └► subjectId ──► Subject
```

Registering as `student` or `teacher` also creates the matching school record, so the new
account is immediately linked to its profile and results.

---

## 6. API reference

Every protected route needs `Authorization: Bearer <token>`.
`PUT` routes are **partial updates** – send only the fields you want to change.

### Authentication

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | public | Create an account (role `student` or `teacher`) |
| POST | `/api/auth/login` | public | Returns `{ token, user }` |
| GET | `/api/auth/me` | any role | Current identity + linked profile |
| GET | `/api/health` | public | Liveness check |

```jsonc
// POST /api/auth/register
{
  "name": "Zainab Bello",
  "email": "zainab.bello@school.test",
  "password": "Str0ng!pass",
  "role": "student",          // optional, defaults to "student"
  "phone": "+2348030000001",  // optional
  "classId": 1,               // optional (students)
  "subjectId": 3              // optional (teachers)
}
```

Password rules: 8–72 characters, at least one lowercase letter, one uppercase letter,
one number and one special character.

> `admin` accounts are **not** self-registered. Public registration only accepts
> `student` and `teacher`; the admin account is provisioned as seed data. This prevents
> anyone on the internet from granting themselves full access.

### Students

| Method | Endpoint | admin | teacher | student |
| --- | --- | :---: | :---: | :---: |
| POST | `/api/students` | ✅ | 403 | 403 |
| GET | `/api/students` | ✅ | ✅ | 403 |
| GET | `/api/students/:id` | ✅ | ✅ | own record only |
| PUT | `/api/students/:id` | ✅ | 403 | 403 |
| DELETE | `/api/students/:id` | ✅ | 403 | 403 |

```jsonc
// student record
{ "id": 1, "userId": 3, "name": "Amina Yusuf", "email": "student@school.test",
  "phone": "+2348010000001", "classId": 1, "createdAt": "2025-09-02T09:00:00.000Z" }
```

Query parameters for `GET /api/students`: `page`, `limit`, `search`, `classId`.
Deleting a student also deletes their results and their login account.

### Teachers

| Method | Endpoint | admin | teacher | student |
| --- | --- | :---: | :---: | :---: |
| POST | `/api/teachers` | ✅ | 403 | 403 |
| GET | `/api/teachers` | ✅ | ✅ | 403 |
| GET | `/api/teachers/:id` | ✅ | ✅ | 403 |
| PUT | `/api/teachers/:id` | ✅ | 403 | 403 |
| DELETE | `/api/teachers/:id` | ✅ | 403 | 403 |

```jsonc
{ "id": 1, "userId": 2, "name": "Bello Adamu", "email": "teacher@school.test",
  "phone": "+2348020000001", "subjectId": 1, "createdAt": "2025-09-02T09:10:00.000Z" }
```

Query parameters: `page`, `limit`, `search`, `subjectId`.

### Classes

| Method | Endpoint | admin | teacher | student |
| --- | --- | :---: | :---: | :---: |
| POST | `/api/classes` | ✅ | 403 | 403 |
| GET | `/api/classes` | ✅ | ✅ | ✅ |
| GET | `/api/classes/:id` | ✅ | ✅ | ✅ |
| PUT | `/api/classes/:id` | ✅ | 403 | 403 |
| DELETE | `/api/classes/:id` | ✅ | 403 | 403 |

```jsonc
{ "id": 1, "name": "Grade 10 - Science", "level": 10, "createdAt": "2025-09-01T08:00:00.000Z" }
```

Name and level are unique. A class that still has students returns `409`.

### Subjects

| Method | Endpoint | admin | teacher | student |
| --- | --- | :---: | :---: | :---: |
| POST | `/api/subjects` | ✅ | 403 | 403 |
| GET | `/api/subjects` | ✅ | ✅ | ✅ |
| GET | `/api/subjects/:id` | ✅ | ✅ | ✅ |
| PUT | `/api/subjects/:id` | ✅ | 403 | 403 |
| DELETE | `/api/subjects/:id` | ✅ | 403 | 403 |

```jsonc
{ "id": 1, "name": "Mathematics", "code": "MATH",
  "description": "Numbers, quantity, space and change.", "createdAt": "2025-09-01T08:10:00.000Z" }
```

Name and code are unique (codes are normalised to uppercase). A subject that already has
results returns `409`.

### Results

| Method | Endpoint | admin | teacher | student |
| --- | --- | :---: | :---: | :---: |
| POST | `/api/results` | ✅ | ✅ | 403 |
| GET | `/api/results` | ✅ | ✅ | own results only |
| GET | `/api/results/:id` | ✅ | ✅ | own results only |
| PUT | `/api/results/:id` | ✅ | ✅ | 403 |
| DELETE | `/api/results/:id` | ✅ | 403 | 403 |

```jsonc
{ "id": 1, "studentId": 1, "subjectId": 1, "score": 88, "grade": "B",
  "term": 1, "session": "2025/2026", "createdAt": "2025-10-05T10:00:00.000Z" }
```

- `score` must be 0–100. `grade` is **always derived** (90+ A, 80+ B, 70+ C, 60+ D,
  else F) and is rejected if a client sends it.
- `term` is `1`, `2` or `3`; `session` must look like `2025/2026`.
- One result per student + subject + term + session (`409` otherwise).
- Query parameters: `page`, `limit`, `studentId`, `subjectId`, `term`, `session`.
  For students the `studentId` filter is ignored so they cannot read other students' results.

---

## 7. Response format

Success:

```json
{
  "success": true,
  "message": "Student retrieved successfully.",
  "data": { "id": 1, "name": "Amina Yusuf" },
  "meta": { "total": 4, "page": 1, "limit": 20, "pages": 1 }
}
```

`meta` is only present on list endpoints.

Failure:

```json
{ "success": false, "message": "Student not found" }
```

Validation failure (all problems listed at once):

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    { "field": "email", "message": "email must be a valid email address." },
    { "field": "password", "message": "password must be at least 8 characters long." }
  ]
}
```

### Status codes

| Code | When |
| --- | --- |
| 200 / 201 | Success / resource created |
| 400 | Validation failed, malformed JSON, invalid id in the path |
| 401 | Missing, invalid or expired token; wrong credentials |
| 403 | Authenticated but the role is not allowed |
| 404 | Resource or route not found |
| 409 | Duplicate email/class/subject/result, or delete blocked by related records |
| 413 | Body larger than 10 kB |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error (message is generic, details only in the console) |

---

## 8. Project structure

```
src/
├── config/
│   └── env.js                 # loads .env, fails fast on a weak/missing secret
├── data/                      # in-memory "database"
│   ├── store.js               # createCollection() – auto-increment ids, CRUD helpers
│   ├── users.js               # accounts + toPublicUser (password never exposed)
│   ├── students.js
│   ├── teachers.js
│   ├── classes.js
│   ├── subjects.js
│   └── results.js
├── middleware/
│   ├── authenticate.js        # Bearer token → verify → load user → req.user
│   ├── authorize.js           # role guard
│   ├── validate.js            # runs a schema validator on body/params/query
│   ├── errorHandler.js        # global error handler
│   ├── logger.js              # method, url, status, timestamp
│   └── rateLimiter.js         # apiLimiter + authLimiter
├── validators/
│   ├── schema.js              # validation engine (types, coercion, uniqueness)
│   ├── authValidator.js
│   ├── studentValidator.js
│   ├── teacherValidator.js
│   ├── classValidator.js
│   ├── subjectValidator.js
│   └── resultValidator.js
├── controllers/               # request handling + business rules
│   ├── authController.js
│   ├── studentController.js
│   ├── teacherController.js
│   ├── classController.js
│   ├── subjectController.js
│   └── resultController.js
├── routes/                    # endpoint + authorization wiring
│   ├── authRoutes.js
│   ├── studentRoutes.js
│   ├── teacherRoutes.js
│   ├── classRoutes.js
│   ├── subjectRoutes.js
│   └── resultRoutes.js
├── utils/
│   ├── AppError.js            # operational error with status code
│   ├── asyncHandler.js        # forwards rejected promises to next()
│   ├── response.js            # ok() / created()
│   ├── paginate.js            # page slicing + search helper
│   └── grade.js               # score → grade
├── app.js                     # express app assembly
└── server.js                  # http server + graceful shutdown
```

Request flow:

```
request → logger → helmet → json parser → rate limiter → router
        → authenticate → authorize → validate → controller → response
        → errorHandler (any thrown AppError) → consistent JSON
```

---

## 9. Testing with Postman / Thunder Client

`postman_collection.json` (Postman v2.1 format) is included at the project root and works
in Thunder Client too.

**Postman**

1. Import `postman_collection.json`.
2. The collection ships with variables (`baseUrl`, `adminToken`, `teacherToken`,
   `studentToken`, `studentId`, `classId`, `subjectId`, `teacherId`, `resultId`).
3. Start the server, then run the folders in order: `Authentication` → `Students` →
   `Teachers` → `Classes` → `Subjects` → `Results` → `Security & error handling`.
   The login requests store their token in the environment automatically.
4. Every request name states the expected status code, e.g.
   `Create student - forbidden for teacher (403)`.

**Thunder Client**

Import the same file, set the `baseUrl` variable to `http://localhost:5000`, log in and
copy the token from `data.token` into the `Authorization: Bearer <token>` header.

Manual checks worth doing:

```bash
# login
curl -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@school.test","password":"Admin@123"}'

# protected route without a token → 401
curl -i http://localhost:5000/api/students

# forbidden: teacher creating a student → 403
curl -X POST http://localhost:5000/api/students \
  -H "Authorization: Bearer $TEACHER_TOKEN" -H 'Content-Type: application/json' \
  -d '{"name":"Nope","email":"nope@school.test","classId":1}'

# rate limit: 21 rapid login attempts → 429
for i in $(seq 1 21); do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:5000/api/auth/login \
    -H 'Content-Type: application/json' -d '{"email":"admin@school.test","password":"x"}'
done
```

Restart the server between full collection runs so the seeded data is fresh.

---

## 10. Security notes

- Passwords are hashed with bcrypt (cost 10) and never leave the server: `toPublicUser()`
  builds every user payload explicitly, and no endpoint returns a hash.
- Password comparison happens in constant-ish time via `bcrypt.compare`; a missing user and
  a wrong password return the identical `401` message so accounts cannot be enumerated.
- JWTs are signed with `JWT_SECRET` from `.env` and carry only `id` and `role`.
  The full user is reloaded from the store on every request, so deleted accounts lose
  access immediately even if they still hold a valid token.
- Ownership is enforced server side: a student token can only read its own profile and
  results, and query filters cannot be used to escape that.
- Validation rejects unknown fields, so a client can never set `id`, `grade` or `role`
  on a record it is not allowed to control.
- `helmet` sets the usual security headers, bodies are capped at 10 kB, and
  unexpected errors return a generic message (stack traces stay in the console).
- Rate limits: 20 requests / 15 min on `register` and `login`, 300 requests / 15 min
  across the whole API, standard `RateLimit-*` headers included.

### Deliberate design choices

1. **No self-registered admins.** Public registration is limited to `student` and
   `teacher`; the admin account is seed data. Privileges are not handed out by the client.
2. **Grades are derived, never posted.** A grade can never disagree with its score.
3. **Deleting a class or subject is blocked (`409`) while related records exist** instead
   of silently cascading – the caller decides what should happen to the data.
4. **Deleting a student cascades** to their results and their login, because those rows
   only exist to serve that student.

---

## 11. Possible next steps

- Swap `src/data/*` for a real database by implementing the same small collection
  interface (`all`, `findById`, `filter`, `create`, `update`, `remove`).
- Add refresh tokens, email verification and password reset.
- Add a Swagger/OpenAPI document for the endpoints above.
# School-Management-System-REST-API
