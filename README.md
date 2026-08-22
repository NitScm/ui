# nit console

The operations console for [nit](https://github.com/NitScm/nit): queue depth, tasks, the audit
trail, and the policy bundle in force.

It is **read-only**. Everything that changes authorization goes through the
policy bundle — authored in files, reviewed like code, versioned and
rollbackable — so a console that could write rules would be a second,
unreviewed path to the same decisions.

## Requirements

Node 24 (LTS) and the Angular CLI 22, both installed with nvm:

```sh
nvm install --lts
pnpm add -g @angular/cli@latest
```

## Running it

The console is a client of `nitd`'s operations API, so a server has to be
running with the API enabled:

```sh
# in ../nit
export NIT_ADMIN_GROUPS=platform            # groups allowed to read the API
export NIT_CORS_ORIGINS=http://localhost:4200
./bin/nitd
```

Then:

```sh
pnpm start         # http://localhost:4200
```

The dev server proxies `/v1` and `/healthz` to `http://localhost:8080`
(`proxy.conf.json`), so the front end and the API share an origin during
development exactly as they do in production. `NIT_CORS_ORIGINS` is only needed
if you point the console at a server on another host.

Sign in with a token issued on the server:

```sh
./bin/nitctl token create -user alice -label console
```

Reading the console needs membership of one of the server's
`NIT_ADMIN_GROUPS`. An account without it gets a 404 rather than a 403: the
existence of an operations API is not something an ordinary developer needs
confirmed.

## Building

```sh
pnpm run build     # dist/nit-console
```

### As a container

```sh
docker build -t nit-console:local .
docker run -p 8090:80 -e NIT_API_URL=http://nitd:8080 nit-console:local
```

nginx proxies `/v1`, `/healthz` and `/openapi.yaml` to `NIT_API_URL`, so the
console and the API share an origin: the sign-in screen's **Server** field can
be left empty, and no CORS configuration is needed at all.

That is the intended shape. `NIT_CORS_ORIGINS` on the server is only for the
case where the two genuinely live on different origins — `ng serve` during
development, or a console hosted separately.

## Layout

```
src/app/
  core/       session, typed API client, interceptor, guard, models
  shared/     state badge, duration and relative-time pipes
  pages/      login, dashboard, tasks, task detail, audit, policy
```

`core/models.ts` mirrors the JSON the Go server returns. The types are
hand-written rather than generated: the surface is small and stable, and the
comments say what a value means to an operator, which is the part a generator
throws away.

## Notes

The token is kept in `localStorage`. That is a bounded, deliberate choice — the
console is an internal tool and the API it calls is read-only — but it means any
script running on this origin can read it, so the console must never load
third-party code. There are no runtime dependencies beyond Angular itself.
