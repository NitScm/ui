This document describes a set of rules and conventions maintainers use in this repo.

## PR structure

* PRs in this repo are kept to one commit only. Iterations on the PR
  should be folded into existing commit by amending.

## Commit message conventions

* Use an `Assisted-By:` footer (not `Co-Authored-By:`) to attribute LLM/agent involvement in commits
* The `Assisted-By:` footer must reference the actual model used, not a generic name
  * Example footer: `Assisted-By: anthropic/claude-opus-5`

* Commit messages must use a conventional commits prefix

* Commit messages must include a `Change:` footer with an alphanumeric, dash-separated identifier
  * Example footer: `Change: flatten-invert-check`

## Committing work

* Always run the test command and build before committing:

  ```sh
  pnpm test
  pnpm run build
  ```

* Run `prettier` before committing.

## Two rules that are not up for negotiation

* **The console is read-only, permanently.** Everything that changes
  authorization goes through the policy bundle: authored in files, reviewed like
  code, versioned and rollbackable. Do not add a write endpoint or a mutating
  request; a pull request that does will be declined regardless of how well it
  is written.

* **Nothing loads from another origin.** No CDN, no analytics, no web fonts, no
  remote images. The operator's token lives in `localStorage`, which is only a
  bounded trade-off while nothing third-party can execute on this origin, and
  the Content-Security-Policy enforces it. Build-time dependencies are fine;
  runtime fetches from elsewhere are not.

## Repo conventions

* pnpm, pinned by `package.json`'s `packageManager` field. `pnpm-workspace.yaml`
  allows exactly the dependency build scripts Angular needs, and says what each
  one does — adding a fifth is a decision to write down, not a default.

* Standalone components, signals, zoneless. Match what is already there.

* Everything goes through the public API, the same endpoints `nitctl` calls. If
  a screen needs data the API does not expose, the change belongs in `nit/`
  first — with `api/openapi.yaml` and its route-coverage tests updated — and
  only then here.

* Types come from the API's shapes. Do not invent a parallel model that will
  drift from `nit/api/openapi.yaml`.

## Development

```sh
pnpm start        # http://localhost:4200
```

The dev server proxies `/v1` and `/healthz` to `http://localhost:8080`, so the
front end and the API share an origin exactly as they do in production.

## Agentic work

* For creating temporary plans, files, and experiments, use the gitignored `.agents/work/` folder
  in the root of the repo
* Inside, create subfolders matching to current work topic
  * Example folder: `.agents/work/live-updates`
  * Example file: `.agents/work/live-updates/PROGRESS.md`
