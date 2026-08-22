# Contributing to nit-console

The operations console: an Angular application that reads the same API
`nitctl` reads.

Reporting a **security issue**? Do not open an issue — see
[SECURITY.md](SECURITY.md).

Participation is governed by the [Code of Conduct](CODE_OF_CONDUCT.md).

## Everything is in English

Code, comments, commit messages, documentation, issues.

## Getting set up

Node 24 — `nvm use 24` — then:

```sh
pnpm install
pnpm start       # http://localhost:4200
pnpm test
pnpm run build
```

The dev server proxies `/v1` and `/healthz` to `http://localhost:8080`, so the
front end and the API share an origin exactly as they do in production. Run a
`nitd` from `nit/` alongside it, or point the proxy elsewhere — in which
case that server needs your origin in `server.cors_origins`.

## Two rules that are not up for negotiation

### The console is read-only, permanently

Everything that changes authorization goes through the policy bundle — authored
in files, reviewed like code, versioned and rollbackable.

A console that could edit rules would be a second path to the same decisions
with none of those properties, and it would become *the* path people used,
because it is the convenient one. Granting access is a pull request, not a
click. That is slower on purpose.

A pull request adding a write endpoint will be declined regardless of how well
it is written. If you think there is a case for one, open an issue and make the
argument first — a future console may *propose* a bundle change by opening a
pull request on the policy repository, but it must never write rules directly.

### The console loads nothing from anywhere else

No CDN, no analytics, no web fonts, no third-party script, no remote image. The
Content-Security-Policy enforces it and you should not relax it.

The reason is concrete: the operator's token lives in `localStorage`, which is a
bounded and deliberate choice for an internal read-only tool — and it only stays
bounded if nothing else can run on this origin. Adding a dependency that fetches
at runtime turns a documented trade-off into a vulnerability.

Build-time dependencies are fine. Runtime fetches from another origin are not.

## Everything goes through the API

The console is a client of the same endpoints `nitctl` uses. That is an
architectural rule, not a convenience: it keeps the API exercised from day one
and means the UI can never need a capability the command line lacks.

If a screen needs data the API does not expose, the change belongs in
`nit/` first — with the OpenAPI description and its route-coverage tests
updated — and only then here.

## Style and structure

```
src/app/core     services, the API client, auth
src/app/pages    dashboard, tasks, task-detail, audit, policy, login
src/app/shared   components used by more than one page
```

- Standalone components, signals, zoneless. Match what is already there.
- `prettier` — run it before committing.
- Types come from the API's shapes. Do not invent a parallel model that will
  drift from `nit/api/openapi.yaml`.

## Tests

`pnpm test` (vitest). The suite is small; keep it meaningful rather than large.

Worth testing: anything that decides what an operator is shown. A dashboard tile
that colours when it should not, or a filter that silently drops rows, is how an
operator misses an incident.

## Design intent worth preserving

These are decisions the current UI makes deliberately. Changing them is fine —
knowing you are changing them is the point.

- **A tile takes colour only when its number needs attention.** A dashboard
  where everything is coloured says nothing. Only *queued* and *branches busy*
  mean something is wrong right now; the rest is history.
- **Task rows carry the owner, the attempt count and the lease holder**, because
  the operator's question is not "did my push land?" but "why is this branch
  stuck?".
- **Every audit record links to its task.** That is the path an investigation
  actually walks.
- **Non-admins get "not found", not "forbidden".** The existence of an
  operations API is not something an ordinary developer needs confirmed.

## Commits and pull requests

- One logical change per pull request.
- Present tense in the subject.
- Explain the **why** in the body; the diff shows what.
- A screenshot for anything visual.

## Licensing of contributions

Contributions are accepted under the [Apache License 2.0](LICENSE), per section
5 of that licence: unless you state otherwise, anything you intentionally submit
for inclusion is licensed under the same terms. There is no separate CLA.
