# WinLog

WinLog is a personal small-wins journal and task manager built with HTML, CSS,
vanilla JavaScript, Node.js, Express, and SQLite.

## Requirements

- Node.js 20 or later
- npm

## Run locally

```powershell
npm install
npm start
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). The app creates
`data/winlog.sqlite` on first start. It listens on localhost by default so the
personal, unauthenticated app is not exposed to other machines.

To override settings, copy `.env.example` to `.env` and provide the values in
your shell environment. The app does not load `.env` automatically; use a
process manager or a Node environment-file option if you choose to use that file.
For example, Node 20+ supports:

```powershell
node --env-file=.env src/server.js
```

## Development and tests

```powershell
npm run dev
npm test
```

Tests use isolated in-memory SQLite databases.

## API

All API responses use JSON (except successful deletes, which return `204`).

- `GET /api/health`
- `GET /api/wins?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `POST /api/wins` with `{ "title", "notes", "won_on" }`
- `GET`, `PUT`, and `DELETE /api/wins/:id`
- `GET /api/tasks?status=todo&due_after=YYYY-MM-DD&due_before=YYYY-MM-DD`
- `POST /api/tasks` with `{ "title", "notes", "status", "priority", "due_on" }`
- `GET`, `PUT`, and `DELETE /api/tasks/:id`

Task status is `todo`, `in_progress`, or `done`. Priority is `low`, `medium`, or
`high`. Create and update inputs are validated on the server; unknown fields are
rejected.

## Security and operational notes

- SQLite statements use bound parameters; request values are validated before
  reaching repositories.
- Helmet sets browser security headers. API requests are size-limited and
  rate-limited.
- User-provided text is rendered as text by escaping it before inserting
  templates into the page.
- The database file is local application data and is ignored by Git. Back it up
  separately if the recorded wins and tasks matter to you.
- The first version intentionally has no sign-in. Keep it on localhost; before
  exposing it on a network or deploying it, add authentication, authorization,
  HTTPS, and a production database/backup strategy.
