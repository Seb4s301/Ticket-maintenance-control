# Ticket Maintenance Control

REST API + React frontend that digitalizes maintenance reports: a user creates a
ticket, an operator moves it through a controlled workflow (state machine), and
every important action is stored in an append-only history for traceability.
Invalid transitions are rejected with HTTP 409, never a generic 500.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Backend | .NET 10 (C#), ASP.NET Core | Requested by the course; fast, first-class HTTP APIs |
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
│   ├── Services/
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
│       ├── pages/
│       └── components/
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
cp .env.example .env      # then fill in your DB values
```

`.env` is git-ignored; only `.env.example` (placeholders) is committed.

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

## API reference

| Method | Route | Description | Success | Errors |
|---|---|---|---|---|
| POST | `/api/tickets` | Create ticket (PENDING) | 201 | 400 |
| GET | `/api/tickets` | List tickets, newest first (filters: `status`, `assignedTo`, `from`, `to`, `limit` ≤ 200, `offset`) | 200 | |
| GET | `/api/tickets/{id}` | Get ticket | 200 | 404 |
| GET | `/api/tickets/{id}/history` | Ticket history | 200 | 404 |
| POST | `/api/tickets/{id}/assign` | Assign operator (`operatorId`, `performedBy`) | 200 | 400, 404, 409 |
| POST | `/api/tickets/{id}/transition` | Change status (`targetStatusId`, `performedBy`, `comment?`, `resolution?`) | 200 | 400, 404, 409 |
| GET | `/api/lookups` | Statuses, priorities, categories, operators | 200 | |
| GET | `/health` | Health check (verifies the DB connection) | 200 | 503 |

### Error format

```json
{ "status": 409, "error": "INVALID_TRANSITION", "message": "Invalid state transition" }
```

| HTTP | Error code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` / `INVALID_REFERENCE` | Missing/invalid fields, missing comment/resolution, unknown ids |
| 404 | `NOT_FOUND` | Ticket does not exist, unknown endpoint (same JSON shape) |
| 409 | `INVALID_TRANSITION` / `CONFLICT` | Transition not allowed, ticket assigned to another operator |
| 503 | `SERVICE_UNAVAILABLE` | Infrastructure/database failures and unexpected errors (logged server-side) |

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
   ```

4. Settings → Networking → Generate Domain, then verify `/health` and `/swagger`.
