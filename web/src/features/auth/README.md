# Auth feature

Owns login/logout, auth Pinia store, and protected-route session wiring.

Public API: import from `@/features/auth` only (never deep imports into `components/`).

## Session persistence

Access + refresh tokens are restored on boot from browser storage so refresh / HMR does not log you out.

- Default (Remember me off): `sessionStorage` — survives reload, clears when the tab closes
- Remember me on: `localStorage` — survives browser restarts

Ideal end state per `RULES.md` §16 is httpOnly cookies from the API; this bridge keeps the JWT-in-body backend workable in the SPA.
