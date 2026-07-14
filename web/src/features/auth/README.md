# Auth feature

Owns login/logout, auth Pinia store, and protected-route session wiring.

Public API: import from `@/features/auth` only (never deep imports into `components/`).

Tokens stay in memory (Pinia) per `RULES.md` §16 — not `localStorage`.
