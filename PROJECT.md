# WinLog — Small Wins & Task Manager

WinLog is a full-stack web app for recording small personal wins and managing the
tasks that help make progress. The first version is designed for one user, with
an approachable structure that can grow later.

## Core features

- Record a win with a title, optional notes, and the date it happened.
- Create, edit, complete, and delete tasks.
- Give tasks a due date and priority.
- Browse wins and tasks, with filters for completed and upcoming work.
- Show a simple dashboard with recent wins and open tasks.

## Recommended tech stack

| Area | Technology | Purpose |
| --- | --- | --- |
| Frontend | HTML, CSS, and modern vanilla JavaScript | Accessible pages and client-side interactions |
| Backend | Node.js with Express | REST API, validation, and application rules |
| Database | SQLite | Persistent relational storage without a separate database server |
| Database access | `better-sqlite3` | Straightforward, synchronous SQLite access for a small app |
| Validation | `zod` | Validate request bodies and query parameters at the API boundary |
| Testing | Node.js built-in test runner | Test API and data behavior without adding a test framework |

### Why SQLite?

For a personal task-and-journal app, SQLite keeps setup and hosting simple while
providing transactions, constraints, and durable storage. Keep database access
behind a repository layer so the app can move to PostgreSQL later if it needs
multiple users, concurrent heavy writes, or a hosted production database.

## Suggested project structure

```text
winlog/
├── public/                       # Browser assets served by Express
│   ├── index.html                # Dashboard
│   ├── wins.html                 # Wins list and entry form
│   ├── tasks.html                # Task list and task form
│   ├── css/
│   │   ├── styles.css            # Shared styles
│   │   └── components.css        # Reusable UI components
│   └── js/
│       ├── api.js                # Fetch helpers for the backend API
│       ├── app.js                # Shared navigation and startup
│       ├── dashboard.js          # Dashboard rendering
│       ├── wins.js               # Wins page behavior
│       └── tasks.js              # Tasks page behavior
├── src/
│   ├── app.js                    # Express app and middleware
│   ├── server.js                 # HTTP server startup
│   ├── config/
│   │   └── database.js           # SQLite connection and initialization
│   ├── db/
│   │   └── migrations/
│   │       └── 001-initial.sql   # Initial schema
│   ├── middleware/
│   │   └── error-handler.js      # Consistent API error responses
│   ├── routes/
│   │   ├── wins.js               # /api/wins endpoints
│   │   └── tasks.js              # /api/tasks endpoints
│   ├── controllers/
│   │   ├── wins-controller.js    # HTTP request/response handling
│   │   └── tasks-controller.js
│   ├── services/
│   │   ├── wins-service.js       # Application rules for wins
│   │   └── tasks-service.js      # Application rules for tasks
│   ├── repositories/
│   │   ├── wins-repository.js    # SQL queries for wins
│   │   └── tasks-repository.js   # SQL queries for tasks
│   └── validation/
│       ├── wins-schemas.js       # Request validation schemas
│       └── tasks-schemas.js
├── tests/
│   ├── wins.test.js
│   └── tasks.test.js
├── data/                         # Local SQLite database; exclude from Git
├── .env.example                  # Documented environment variables (no secrets)
├── .gitignore
├── package.json
└── README.md                     # Setup and run instructions
```

This is a suggested structure, not a requirement to create every file at once.
Start with the dashboard, wins, and tasks pages, then add supporting modules as
their responsibilities become real.

## Initial data model

Use integer primary keys and store timestamps in UTC. SQLite should enforce the
required fields and allowed status/priority values.

### `wins`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | INTEGER | Primary key |
| `title` | TEXT | Required; short description of the win |
| `notes` | TEXT | Optional detail |
| `won_on` | TEXT | Required date in `YYYY-MM-DD` format |
| `created_at` | TEXT | UTC creation timestamp |
| `updated_at` | TEXT | UTC last-update timestamp |

### `tasks`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | INTEGER | Primary key |
| `title` | TEXT | Required |
| `notes` | TEXT | Optional detail |
| `status` | TEXT | `todo`, `in_progress`, or `done` |
| `priority` | TEXT | `low`, `medium`, or `high` |
| `due_on` | TEXT | Optional date in `YYYY-MM-DD` format |
| `completed_at` | TEXT | Nullable UTC completion timestamp |
| `created_at` | TEXT | UTC creation timestamp |
| `updated_at` | TEXT | UTC last-update timestamp |

Avoid adding projects, tags, recurring tasks, or user accounts until the core
workflow demonstrates a need for them. If authentication or multiple users are
introduced, add a users table and associate each win and task with its owner.

## Initial API

Return JSON from all endpoints and use standard HTTP status codes. Validate
inputs on the server; browser validation is for usability, not a security
boundary.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/wins` | List wins; support optional date filters |
| `POST` | `/api/wins` | Create a win |
| `GET` | `/api/wins/:id` | Get one win |
| `PUT` | `/api/wins/:id` | Update a win |
| `DELETE` | `/api/wins/:id` | Delete a win |
| `GET` | `/api/tasks` | List tasks; support status and due-date filters |
| `POST` | `/api/tasks` | Create a task |
| `GET` | `/api/tasks/:id` | Get one task |
| `PUT` | `/api/tasks/:id` | Update a task |
| `DELETE` | `/api/tasks/:id` | Delete a task |

## Implementation order

1. Initialize the Node.js project and serve the static HTML, CSS, and JavaScript.
2. Create the SQLite database and initial schema.
3. Implement and test the wins API, then connect the wins page.
4. Implement and test the tasks API, then connect the tasks page.
5. Build the dashboard from the wins and tasks data.
6. Add input validation, accessible form feedback, error handling, and backups
   before deploying.

## Important project defaults

- Keep the SQLite database file and `.env` out of version control.
- Store secrets and machine-specific settings in environment variables.
- Use parameterized SQL queries; never concatenate user input into SQL.
- Render user-provided text as text, not interpolated HTML.
- Provide a clear empty state and visible error feedback on each page.
- Do not expose the app publicly without authentication and HTTPS.
