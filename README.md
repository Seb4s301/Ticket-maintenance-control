# Ticket Maintenance Control

REST API + React frontend that digitalizes maintenance reports: a user logs in,
creates a ticket, an operator moves it through a controlled workflow (state
machine), and every important action is stored in an append-only history for
traceability. Invalid transitions are rejected with HTTP 409, never a generic
500.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Backend | .NET 10 (C#), ASP.NET Core | Requested by the course; fast, first-class HTTP APIs |
| Auth | JWT bearer + PBKDF2 password hashes | Basic but real security without extra infrastructure |
| Data access | Dapper + MySqlConnector | Thin, transparent SQL; no ORM magic over stored procedures |
| Database | MySQL 8 (Railway) | The state machine, transactions and referential integrity live in the DB |
| API docs | Swagger (Swashbuckle) | Interactive public documentation |
| Frontend | React 19 + Vite | Lightweight SPA, fast dev server |
| Deploy | Docker + Railway | Reproducible builds, free tier for the demo |

Design rule: **the database enforces integrity** (stored procedures validate the
transition and write the history in one transaction), the **API enforces input
and application rules** (DTO validation, error translation, CORS), and
**controllers stay thin** (they only call services).

## Repository layout

```text
Ticket-maintenance-control/
├── TicketMaintenance.slnx
├── TicketMaintenance.API/          # backend (Controllers → Services → Repositories → DB)
│   ├── Controllers/
│   ├── Auth/                       # JWT config + claims helpers
│   ├── Services/                   # + password hasher, token service, auth service
│   ├── Repositories/
│   ├── Data/                       # connection factory + DB error translator
│   ├── Dtos/
│   ├── Models/
│   ├── Exceptions/
│   ├── Middleware/                 # global error handler
│   ├── Serialization/              # UTC-aware DateTime JSON converter
│   ├── Dockerfile
│   └── .env.example
├── ticket-maintenance-frontend/    # React + Vite
│   └── src/
│       ├── api/                    # fetch client + endpoint functions
│       ├── hooks/                  # useAuth (session + profile)
│       └── components/             # login, panel, drawer, modals, header
├── img/
│   └── fractal-logo.png            # brand logo (imported by the frontend)
├── mokups/                         # design mockups (source of truth for the UI)
├── database/
│   └── Ticket-maintance-control-railway.sql   # schema (applied on Railway)
├── README.md
└── PROMPTS.md
```

## Run locally

### Prerequisites

- .NET SDK 10
- Node.js 20+
- A MySQL 8 database (Railway public host/port works from your machine)

### 1. Configuration

```bash
cd TicketMaintenance.API
cp .env.example .env      # then fill in your DB values + JWT_SECRET
```

`.env` is git-ignored; only `.env.example` (placeholders) is committed.
`JWT_SECRET` (≥ 32 random characters) is required — the API refuses to start
without it. Optional: `JWT_ISSUER`, `JWT_AUDIENCE`, `JWT_EXPIRY_HOURS` (8).

Seeded demo accounts (password `demo1234`, stored as PBKDF2 hashes):

| Email | Role |
|---|---|
| `demo.user@example.com` | USER |
| `demo.operator@example.com` | OPERATOR |

### 2. Backend

```bash
cd TicketMaintenance.API
dotnet run
```

- Swagger UI: http://localhost:5135/swagger
- Health check: http://localhost:5135/health

### 3. Frontend

```bash
cd ticket-maintenance-frontend
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:5135
npm run dev               # http://localhost:5173
```

The interface (Spanish, based on `mokups/`) is a single maintenance panel.
In every form the label sits above the box and the hint text sits below it:

- **Login screen**: the app opens on a login card (email + password) with the
  FRACTAL logo; without a valid token nothing else is rendered. Failed attempts
  show a generic Spanish error; after 10 attempts/minute the API answers 429.
- **Header**: the brand logo (imported from `img/fractal-logo.png`, falls back
  to the FRACTAL text if the file is missing), breadcrumb, and the logged-in
  user (avatar initials + role). The user menu offers **Mi perfil** and
  **Cerrar sesión**.
- **Mi perfil** modal: update name and email, and change the password
  (requires the current password; min 8 characters). A fresh token is issued
  on every change.
- **Stat cards**: total, pendientes, en proceso, resueltos (computed from the
  loaded tickets).
- **Nuevo ticket** form on the left (title, priority, category, description).
- **Tablero de tickets**: kanban board with the five statuses as columns,
  client-side search, an operator filter (server-side `assignedTo`) and a
  **Cargar más** button that pages through the list (200 tickets per request).
- **Detail drawer** (right side): operator assignment, ticket data, diagnosis /
  resolution drafts (persisted in `localStorage` per ticket), actions for the
  state machine, an **Editar** mode that saves via `PUT /api/tickets/{id}`, and
  the history timeline. Success notices confirm assign/transition/edit;
  `Esc` closes the transition modal first, then the drawer.
- **Transition modal**: collects the diagnosis/resolution/comment required by
  each transition (resolution to resolve, comment to cancel/reopen).

## API reference

All routes except `POST /api/auth/login` and `GET /health` require
`Authorization: Bearer <token>` (each of them can answer 401). The
authenticated user is the actor recorded in the history — request bodies do
not carry `performedBy`/`createdBy`.

| Method | Route | Description | Success | Errors |
|---|---|---|---|---|
| POST | `/api/auth/login` | Login (`email`, `password`) → `{ token, expiresInSeconds, user }` (rate-limited) | 200 | 400, 401, 429 |
| GET | `/api/auth/me` | Current account | 200 | 401 |
| PUT | `/api/auth/profile` | Update `name`, `email`; optional `currentPassword` + `newPassword` (≥ 8) → new token | 200 | 400, 401, 409 |
| POST | `/api/tickets` | Create ticket (PENDING) | 201 | 400, 401 |
| GET | `/api/tickets` | List tickets, newest first (filters: `status`, `assignedTo`, `from`, `to`, `limit` ≤ 200, `offset`) | 200 | 401 |
| GET | `/api/tickets/{id}` | Get ticket | 200 | 401, 404 |
| PUT | `/api/tickets/{id}` | Edit ticket (`title`, `description`, `priorityId`, `categoryId`; records an `EDITED` history entry) | 200 | 400, 401, 404 |
| GET | `/api/tickets/{id}/history` | Ticket history | 200 | 401, 404 |
| POST | `/api/tickets/{id}/assign` | Assign operator (`operatorId`) | 200 | 400, 401, 404, 409 |
| POST | `/api/tickets/{id}/transition` | Change status (`targetStatusId`, `comment?`, `resolution?`) | 200 | 400, 401, 404, 409 |
| GET | `/api/lookups` | Statuses, priorities, categories, operators | 200 | 401 |
| GET | `/health` | Health check (verifies the DB connection) | 200 | 503 |

### Error format

```json
{ "status": 409, "error": "INVALID_TRANSITION", "message": "Invalid state transition" }
```

| HTTP | Error code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` / `INVALID_REFERENCE` | Missing/invalid fields, missing comment/resolution, unknown ids, wrong current password |
| 401 | `UNAUTHORIZED` | Missing/invalid/expired token, invalid email or password (generic message, no user enumeration) |
| 404 | `NOT_FOUND` | Ticket does not exist, unknown endpoint (same JSON shape) |
| 409 | `INVALID_TRANSITION` / `CONFLICT` | Transition not allowed, ticket assigned to another operator, email already in use |
| 429 | `RATE_LIMITED` | More than 10 login attempts per minute from the same IP |
| 503 | `SERVICE_UNAVAILABLE` | Infrastructure/database failures and unexpected errors (logged server-side) |

### Security

- **Passwords**: PBKDF2-SHA256, 100 000 iterations, 16-byte salt, 32-byte
  hash, format `PBKDF2-SHA256$iterations$saltBase64$hashBase64`,
  constant-time comparison. Never stored or returned in plain text.
- **Tokens**: HMAC-SHA256 JWTs signed with `JWT_SECRET`, 8 h expiry by default
  (`JWT_EXPIRY_HOURS`), carrying only `sub` (user id) and `role`. The API
  derives the actor of every write from the token, so clients cannot
  impersonate other users.
- **Login**: rate-limited to 10 attempts/minute/IP; identical generic error for
  unknown email, wrong password and inactive account.
- **Frontend**: token + user kept in `localStorage` (fine for this demo; a
  production app would prefer httpOnly cookies). A 401 anywhere clears the
  session and returns to the login screen.
- The stored procedures remain the last line of defense: they validate the
  actor's role/active state for assign and transition regardless of the API.

## State machine

| From | To | Requirement |
|---|---|---|
| PENDING | IN_PROGRESS | Operator assigned |
| PENDING | CANCELLED | Comment (cancellation reason) |
| IN_PROGRESS | DIAGNOSED | — |
| IN_PROGRESS | CANCELLED | Comment (cancellation reason) |
| DIAGNOSED | RESOLVED | Resolution text |
| RESOLVED | IN_PROGRESS | Comment (reopen reason) |

Anything else is invalid (e.g. `PENDING → RESOLVED` → HTTP 409).

## Deploy (Railway)

1. Create a Railway project with a MySQL service and apply
   `database/Ticket-maintance-control-railway.sql` to it (already applied on
   the instance used for this project).
2. Add a service from this repo with **Root Directory** = `TicketMaintenance.API`
   (Railway detects the Dockerfile).
3. Set the API variables referencing the MySQL service:

   ```text
   DB_HOST     = ${{MySQL.MYSQLHOST}}
   DB_PORT     = ${{MySQL.MYSQLPORT}}
   DB_NAME     = ${{MySQL.MYSQLDATABASE}}
   DB_USER     = ${{MySQL.MYSQLUSER}}
   DB_PASSWORD = ${{MySQL.MYSQLPASSWORD}}
   CORS_ALLOWED_ORIGINS = https://<your-frontend-domain>
   JWT_SECRET  = <long random string, 32+ characters>
   ```

4. Settings → Networking → Generate Domain, then verify `/health` and `/swagger`.

5. Frontend: build with `VITE_API_URL=https://<your-api-domain>` (`npm run
   build` in `ticket-maintenance-frontend/`) and serve the resulting `dist/`
   folder from any static host; add its domain to `CORS_ALLOWED_ORIGINS`
   above.
