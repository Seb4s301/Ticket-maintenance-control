# Ticket Maintenance — Frontend

React 19 + Vite SPA for the ticket maintenance panel (Spanish UI, based on the
mockups in `../mockups/`).

## Run

```bash
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:5135
npm run dev            # http://localhost:5173
```

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint (must pass with 0 problems) |

## Configuration

`VITE_API_URL` — base URL of the API (default `http://localhost:5135`).

The brand logo is imported from `src/assets/fractal-logo.png` (`src/logo.js`);
if the file is missing, the header/login fall back to the FRACTAL text logo.

## Docker

```bash
docker build -t tm-frontend .
docker run -p 8080:8080 -e API_UPSTREAM=http://host.docker.internal:5135 tm-frontend
```

Multi-stage build (`node:22-alpine` → `nginx:alpine`): lints and builds the
SPA, then serves it with `nginx.conf.template`. Runtime environment:

| Variable | Default | Meaning |
|---|---|---|
| `PORT` | `8080` | nginx listen port |
| `API_UPSTREAM` | `http://localhost:5135` | upstream for `/api/*` and `/health` |

`VITE_API_URL` builds empty on purpose: the app calls `/api/...` on its own
origin and nginx proxies to the API (same-origin → no CORS needed).

## Behavior notes

- **Auth**: the app opens on the login screen; the JWT + user are kept in
  `localStorage` (`tm-auth`) and sent as `Authorization: Bearer`. Any 401
  clears the session and returns to the login screen.
- **Actor**: request bodies never carry a user id — the API reads it from the
  token.
- **Hints**: form hint text renders below each input box (labels above).
- **Drafts**: diagnosis/resolution text is persisted per ticket in
  `localStorage` until the transition succeeds.

## Structure

```text
src/
├── api/            # fetch client (bearer + 401 handling) + endpoint functions
├── assets/         # brand logo (fractal-logo.png)
├── hooks/          # useAuth (session storage, refresh, logout)
├── components/     # LoginScreen, Header, StatCards, NewTicketForm, KanbanBoard,
│                   # TicketCard, DetailDrawer, TransitionModal, ProfileModal,
│                   # HistoryTimeline, StatusBadge, icons
├── utils.js        # Spanish labels/maps, date helpers, draft storage
├── logo.js         # brand logo import
├── App.jsx         # auth gate + panel state
└── App.css / index.css
```
