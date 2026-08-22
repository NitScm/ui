# Security policy — nit-console

The console reads the operations API of a nit deployment: queue depth, tasks,
the audit trail and the policy bundle in force. It is read-only and it is an
internal tool.

## Reporting a vulnerability

**Do not open a public issue.**

Use GitHub's private vulnerability reporting (Security → Report a
vulnerability), or email **<xampydev@gmail.com>**.

Include the browser and version, the deployment shape (behind the bundled nginx,
or `ng serve` against a remote API), and what you were able to reach that you
should not have been.

Acknowledgement within 3 working days; an initial assessment within 10. We
credit reporters in release notes unless they prefer otherwise. There is no paid
bounty programme.

Issues in the authorization engine itself belong in
[nit's SECURITY.md](https://github.com/NitScm/nit/blob/main/SECURITY.md) — that is where the decisions
this console merely displays are actually made.

## The console's threat model, stated plainly

**The operator's token is kept in `localStorage`.** This is a bounded,
deliberate choice for an internal read-only tool, and it means **any script
running on this origin can read the token**.

That trade-off is only acceptable because of the rule that follows from it: the
console loads *nothing* from any other origin — no CDN, no analytics, no fonts,
no remote images — and its Content-Security-Policy enforces that.

So the security of this application rests on one property: **nothing
third-party executes here.** Findings are ranked accordingly.

## In scope

**Anything that gets script onto the origin.** Cross-site scripting through
audit records, task errors, policy rule text, repository or branch names — all
of it is attacker-influenced data rendered in this UI. A rule `description`
written by a policy author and displayed on the policy page is exactly the kind
of path worth probing.

**A CSP bypass**, or a build that ships a runtime fetch to another origin.

**Token disclosure** by any other route: a token reaching a URL, a log, an error
report, a page title, browser history, or a request to somewhere other than the
configured API.

**Any write reaching the API.** The console is read-only by design. A request
that mutates state is a bug of this class even if the server would have refused
it.

**Authorization confusion in the UI**: showing one operator data scoped to
another, or continuing to display privileged data after a token is revoked or a
session ends.

**The nginx layer**: request smuggling, header injection, or a proxy
configuration that forwards to a host other than `NIT_API_URL`.

**A supply-chain compromise in a build dependency** that reaches the shipped
bundle.

## Not in scope

**The token being readable by scripts on the origin.** That is the documented
trade-off above, not a finding. What *is* a finding is a way to get a script
onto the origin.

**No CSRF protection.** The API is bearer-authenticated from `localStorage`,
never with cookies, so there is no ambient credential for a cross-site request
to ride.

**The console being reachable without authentication.** It is a static bundle;
everything meaningful requires a token the API validates. Serve it on your
internal network anyway.

**Missing hardening headers that do not apply to a static, self-contained
bundle.** Tell us if you think one does apply, with the attack it prevents.

**Anything requiring an operator's own browser to be compromised.** If an
attacker runs code as the operator, the console is not the interesting target.

**Policy decisions being wrong.** The console displays what the API returns. A
wrong decision is a `nit` issue.

## Deploying it safely

- Serve it over TLS.
- Put it on an internal network or behind whatever you use for internal tools.
  It is not a public surface.
- Prefer the bundled nginx, which proxies `/v1`, `/healthz` and `/openapi.yaml`
  to `NIT_API_URL` so the console and the API share an origin. Then no CORS
  configuration is needed at all, and the browser never makes a cross-origin
  request.
- `server.cors_origins` on the API is only for the case where the two genuinely
  live on different origins — `ng serve` during development, or a separately
  hosted console. There is no wildcard, deliberately: the API is
  bearer-authenticated, so `*` would let any page a developer visits call it
  with their credentials.
- Only members of the API's `server.admin_groups` see anything. Everyone else
  signs in successfully and every page reports "not found".

## Supported versions

No stable release yet. Only `main` is supported and fixes land there.
