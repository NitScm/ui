# Changelog — nit-console

All notable changes to the operations console.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

The console is a client of `nitd`'s operations API, so its compatibility is
expressed in terms of the **API** it requires, not only its own version. A
release that needs a newer endpoint will say so explicitly.

## [Unreleased]

Nothing has been released yet.

### What exists

Angular 22, standalone components, signals, zoneless.

- **Overview** — queue depth, busy branches, task counts by state, and denials
  over the last day. A tile takes colour only when its number needs attention;
  only *queued* and *branches busy* mean something is wrong right now.
- **Tasks** — filterable by state, kind and repository. Each row carries the
  owner, the attempt count and the lease holder, because the operator's question
  is "why is this branch stuck?" rather than "did my push land?".
- **Task detail** — the raw spec the worker was given and what it reported,
  which is how you tell "nit decided something surprising" from "the forge did
  something surprising" — plus the audit records for that operation.
- **Audit** — who did what, when, and under which rule. Filter by user,
  repository, request id or time window, and narrow to denials only. Every
  record links to its task.
- **Policy** — the compiled bundle rendered as a table, so nobody has to read
  YAML on a server during a rolling deploy.
- **Login** — the Server field can be left empty when the console is served
  behind its own nginx, which proxies `/v1`, `/healthz` and `/openapi.yaml` to
  `NIT_API_URL`.

### Deployment

- A container image serving the built bundle through nginx, configured from
  `NIT_API_URL` at start-up via `envsubst`.
- Sharing an origin with the API means **no CORS configuration is needed at
  all** — the browser never makes a cross-origin request.

### Design constraints held deliberately

- **Read-only, permanently.** Everything that changes authorization goes through
  the policy bundle: authored in files, reviewed like code, versioned and
  rollbackable. A console that could edit rules would be a second path with none
  of those properties.
- **Nothing loads from another origin.** No CDN, no analytics, no fonts, no
  remote images; the Content-Security-Policy enforces it. The token lives in
  `localStorage`, and that trade-off is only acceptable while nothing
  third-party can execute here.
- **Non-admins get "not found", not "forbidden."** The existence of an
  operations API is not something an ordinary developer needs confirmed.
- **Everything goes through the public API**, the same endpoints `nitctl` uses,
  so the API is exercised from day one and the UI can never need a capability
  the command line lacks.

### Known limits

- Three test specs. The suite is meaningful but thin.
- No live updates: screens are fetched on navigation, not pushed.
- No dark mode.
- No pagination beyond a row limit — a very long audit window is truncated
  rather than paged.

---

## Release notes will start here

```
## [0.1.0] - YYYY-MM-DD

### Added
### Changed
### Fixed
### Security
```

A release requiring a newer `nitd` names the minimum API it needs.
