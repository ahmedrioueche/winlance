# Frontend Roadmap

This roadmap outlines the Vue web app work for Winlance from scaffold to MVP and production. Follow [`RULES.md`](./RULES.md) for all implementation conventions.

Backend counterpart: [`../backend/ROADMAP.md`](../backend/ROADMAP.md). Frontend phases intentionally track backend domains so UI and API ship together.

## Product north star — Shared client dashboard

A core MVP outcome: the freelancer sends the client a link that opens a shared engagement dashboard with:

- Initial app / project requirements (editable by freelancer and client)
- The offer (proposal)
- The contract
- Progress tracking
- Reports

Freelancer UI builds the artifacts and share links; the **client portal** is the shared dashboard experience (token-based, public route, no freelancer session required).

## Stack (locked)

| Concern | Choice |
|---------|--------|
| Framework | Vue 3 + `<script setup>` + Composition API + TypeScript |
| Build | Vite |
| Routing | Vue Router (feature-colocated routes, lazy-loaded) |
| State | Pinia (domain) + TanStack Query (server state) |
| HTTP | Axios via `shared/api/client.ts` |
| UI | Tailwind CSS v4 + design tokens (`data-theme` light/dark) |
| i18n | vue-i18n (no hardcoded user-facing strings) |
| Quality | ESLint + Prettier + Vitest (+ Playwright for critical E2E) |
| Auth tokens | In-memory Pinia only (not `localStorage`) per RULES §16 |

## Phase 0 — Foundation

Goal: establish the Vite app shell, structure, and design system so features plug in cleanly.

### Scaffold (done)

- [x] Scaffold Vue 3 + TypeScript + Vite project under `web/`
- [x] Feature-based folder layout (`app/`, `features/`, `shared/`, `config/`, `router/`, `i18n/`)
- [x] Pinia, Vue Router, vue-i18n, TanStack Query, Axios client
- [x] Tailwind v4 + theme structure (`theme/tokens|light|dark|base.css`)
- [x] Light / dark themes + `useTheme()` + FOUC-safe boot script
- [x] Env config layer (`config/index.ts`, `flags.ts`, typed `ImportMetaEnv`)
- [x] ESLint, Prettier, Vitest smoke tests, README
- [x] App / Auth / Blank layouts + ErrorBoundary
- [x] Partial primitives: `BaseButton`, `EmptyState`, `ErrorState`, `ThemeToggle`, basic 404 page

### Base & composite components (required)

Build these in `shared/components/` and reuse everywhere — features must not reinvent them.

- [x] `BaseButton` (primary / secondary / ghost)
- [x] `BaseModal` — focus trap, Esc to close, labelled title, slots for header/body/footer; used for confirmations and blocking decisions (not for passive errors)
- [x] `BaseCheckbox` — accessible label association, indeterminate optional
- [x] `Pagination` (composite) — page/limit, wired to `usePagination()` + URL query sync
- [ ] Also complete: `BaseInput`, `BaseTextarea`, `BaseSelect`, `Drawer`, `Dropdown`, `Skeleton`

### Status / feedback components (required)

Inline, reusable UI for data-driven views (not full-page). Place under `shared/components/` (base or a `status/` group).

- [x] Error state (inline) — e.g. `ErrorState` (retry action)
- [x] Empty / no-data state — e.g. `EmptyState`
- [x] Loading state — `LoadingState` skeleton block
- [x] Success state — `SuccessState`
- [x] Naming consistent for list/detail views: loading → empty|error|success

### App pages (required)

Full-page experiences under `app/pages/` (routed or used by router / async boundaries):

- [x] `NotFoundPage` (404)
- [x] `ErrorPage` — unexpected app/route failure (generic, translated; reload / go home)
- [x] `LoadingPage` — full-viewport loading for route Suspense fallback
- [x] Wire router: catch-all → 404; navigation/chunk load failures → ErrorPage; Suspense → LoadingPage

### Toasts & user-facing errors (required)

- [x] Global `Toaster` + `useToast()` composable
- [x] **Use toasts for errors** (and light success/info) — non-blocking; never a modal for a passive failure
- [x] Toast copy must be **non-technical, generic, and translated** via i18n (`common.errors.*`)
- [x] Never surface stack traces, HTTP codes as the main message, Axios wording, or raw backend `detail` strings in the toast
- [x] API client maps failures → stable error **codes**; UI maps codes → `t('…')` messages (fallback: generic translated error)
- [x] Log technical details with `logger` / monitoring only (scrub tokens/PII)
- [x] Destructive / irreversible actions still use `BaseModal` confirmation (RULES: toast ≠ confirmation)

### DX leftovers

- [x] `usePagination()` + URL query sync helper
- [ ] MSW (or equivalent) for API mocking in tests
- [ ] Boundary lint rules (`eslint-plugin-boundaries`) between `features/*` and `shared/`
- [ ] Doc comments (or Storybook) for every base/composite component

Deliverables:

- Runnable app shell
- Theme system and token utilities
- Shared API + config plumbing
- Canonical Button / Modal / Checkbox / Pagination
- Status components (error, success, loading, no-data) + app pages (error, loading, 404)
- Toast-based, translated, non-technical error UX

Status: Core design-system & feedback UX complete; remaining form/input primitives and DX tooling

---

## Phase 1 — Authentication and app shell

Goal: full account lifecycle UX against `/api/v1/auth/` and a trusted authenticated shell.

- [x] Login page + auth store bootstrap + route guards (`meta.requiresAuth`)
- [ ] Registration / sign-up flow
- [ ] Email verification UX (landing from link + resend)
- [ ] Password reset request + confirm pages
- [ ] Token refresh interceptor (401 → refresh once → retry → logout)
- [ ] Logout + blacklist-aware session clear
- [ ] Profile / account settings (`GET`/`PATCH` `/auth/me/`)
- [ ] Google / GitHub social login buttons (provider token → backend)
- [ ] Demo-account affordance when `VITE_ENABLE_DEMO_AUTH` / backend demo flag is on
- [ ] Authenticated app chrome: sidebar/nav, user menu, breadcrumbs
- [ ] Post-login redirect to `?redirect=` and default dashboard
- [ ] Auth feature tests (store, guards, login form)

Deliverables:

- End-to-end auth UX
- Stable freelancer session model
- Shell ready for CRM and projects

Status: Partial (login shell only)

---

## Phase 2 — Leads and CRM

Goal: freelancer can run the sales pipeline in the UI.

- [ ] `features/leads` module (routes, api, queries, store if needed, barrel)
- [ ] Leads list: search, filters (status, company, score), sort, pagination
- [ ] Pipeline board (Kanban) with status columns + `transition` actions
- [ ] Lead detail: company, contacts, notes, score, ownership
- [ ] Create / edit lead forms with field-level validation
- [ ] Follow-ups: schedule, complete, overdue / upcoming views
- [ ] Rescore action + optimistic UI where safe
- [ ] Empty / loading / error / success via shared status components (`EmptyState`, `LoadingState`, `ErrorState`, `SuccessState`)
- [ ] API failures → toast with generic translated copy (no technical messages in UI)
- [ ] Deep-linkable filters via URL query string
- [ ] Feature i18n (`en/leads.json`) + README

Deliverables:

- CRM UI matching Phase 2 backend APIs
- Pipeline workflow usable daily

Status: Not started

---

## Phase 3 — Outreach and marketing content

Goal: organize playbooks and templates the freelancer reuse while selling.

- [ ] `features/outreach` module
- [ ] Tags management
- [ ] Template list / editor (create, edit, duplicate, render with variables)
- [ ] Sequences and checklists UI
- [ ] Playbook summary view
- [ ] Tag filters that match backend semantics
- [ ] Copy-to-clipboard / insert-into-proposal hooks (prep for Phase 4)
- [ ] Feature i18n + tests for render helpers

Deliverables:

- Outreach library UI
- Reusable sales content browser

Status: Not started

---

## Phase 4 — Proposals and contracts

Goal: create, preview, and attach offers and contracts — the artifacts later shown in the client dashboard.

- [ ] `features/proposals` module
- [ ] Proposal template picker + generate from lead
- [ ] Proposal editor / preview / status
- [ ] Async generation progress (poll or WS later; start with query refetch)
- [ ] `features/contracts` module
- [ ] Contract from proposal + export/download UX
- [ ] Link artifacts to a project (`project_id`) for portal surfacing
- [ ] List views with status filters
- [ ] Confirmation modals for destructive / irreversible sends
- [ ] Feature i18n + integration tests for create flows

Deliverables:

- Offer and contract authoring UX
- Artifacts attachable to projects

Status: Not started

---

## Phase 5 — Projects and client portal

Goal: freelancer manages engagements; client opens a share link to the shared dashboard.

### Freelancer project UI

- [ ] `features/projects` module
- [ ] Project list + create from lead/proposal
- [ ] Project detail: overview, milestones, files, requirements
- [ ] Collaborative requirements editor (freelancer side)
- [ ] Milestone CRUD + progress indicators
- [ ] File upload / list
- [ ] Share-link management: create, revoke, copy URL
- [ ] Embed / jump to linked offer + contract
- [ ] Progress reports authoring (feeds portal)

### Client portal (shared dashboard) — north star UI

Route shape (suggested): `/portal/:token` (Blank or dedicated Portal layout; no freelancer chrome).

- [ ] `features/portal` module (public, token-authenticated API)
- [ ] Portal shell with clear engagement title and sections
- [ ] **Requirements** — view + edit (client-allowed fields)
- [ ] **Offer** — read proposal; accept action when allowed
- [ ] **Contract** — read; accept / acknowledge when allowed
- [ ] **Progress** — milestones and status (read-only for client)
- [ ] **Reports** — progress / delivery reports
- [ ] Mobile-friendly portal layout (clients often on phone)
- [ ] Friendly errors for invalid/expired tokens
- [ ] Optional light branding of freelancer / project

Deliverables:

- Freelancer project workspace
- Client-facing shared dashboard matching product north star

Status: Not started

---

## Phase 6 — AI Coach and analytics

Goal: differentiated coaching UX plus funnel visibility for the freelancer.

- [ ] `features/ai-coach` module
- [ ] Session list + create (PRICING / NEGOTIATION / FOLLOW_UP / GENERAL)
- [ ] Chat-like or Q&A transcript UI; loading for Celery-backed generation
- [ ] Copy guidance into outreach / proposal contexts
- [ ] `features/analytics` module
- [ ] Funnel dashboard (`/analytics/funnel/`, `/analytics/summary/`)
- [ ] Snapshot history / date range controls
- [ ] Project progress report views (freelancer) reused by portal
- [ ] Charts via a deliberate chart library (justify per RULES §19) or CSS-first sparklines for MVP
- [ ] Feature i18n + tests for query keys / mappers

Deliverables:

- AI Coach UX
- Freelancer analytics dashboard
- Report surfaces for portal consumption

Status: Not started

---

## Phase 7 — Hardening, i18n, a11y, and production

Goal: ship a reliable, accessible, deployable frontend.

### Quality & DX

- [ ] Expand Vitest coverage: stores, composables, critical components
- [ ] Playwright E2E: login, lead CRUD smoke, portal token happy path
- [ ] CI workflow for `web` (lint, typecheck, test, build)
- [ ] Bundle analysis budget / visualizer in CI
- [ ] Strict feature boundary linting

### UX systems

- [ ] Enforce toast-for-errors (generic + i18n) and `BaseModal` for confirmations only
- [ ] Skeleton / `LoadingState` matching each list/detail layout
- [ ] Full a11y pass on auth, CRM, and portal (keyboard, focus trap on `BaseModal`, live regions on toasts)
- [ ] Second locale (e.g. `fr`) wired to prove i18n structure (including `common.errors.*`)
- [ ] Prefer logical CSS properties for RTL readiness

### Security & ops

- [ ] Sentry (or equivalent) behind `VITE_SENTRY_DSN` in `app/monitoring.ts`
- [ ] Web Vitals reporting
- [ ] Scrub tokens / PII from logs and error payloads
- [ ] CSP-friendly deployment notes; no secrets in client env
- [ ] Production env docs (`VITE_API_BASE_URL` → Render API)

### Deploy

- [ ] Static host config (e.g. Render Static Site / Cloudflare Pages / Netlify)
- [ ] SPA fallback routing
- [ ] CORS / cookie / HTTPS checklist vs backend
- [ ] Preview environments for PRs (optional)

Deliverables:

- Production-ready web app
- CI + monitoring + E2E safety net

Status: Not started

---

## Cross-cutting workstreams (ongoing)

Track these alongside feature phases; do not defer entirely to Phase 7.

| Workstream | Notes |
|------------|--------|
| Design system | Required base/composite: `BaseButton`, `BaseModal`, `BaseCheckbox`, `Pagination`; tokens only — no ad-hoc hex in features |
| Status UI | Shared components: error, success, loading, no-data — use on every data view |
| App pages | `ErrorPage`, `LoadingPage`, `NotFoundPage` (404) under `app/pages/` |
| Toasts | Errors (and light success) via toast; **non-technical, generic, translated**; never raw API/HTTP text |
| Server state | TanStack Query keys per resource; invalidate on mutations |
| Permissions UX | `usePermissions()` / `meta.permissions` — UX only; backend remains source of truth |
| Error model | Client normalizes to `{ code, message, status, details }`; UI shows `t(code→key)` or generic fallback; details stay in logs |
| Loading UX | loading / empty / error / success on every data view |
| Performance | Route-level code split; async heavy modals/editors |
| Docs | Feature README for each non-trivial module; update ROADMAP status as you go |

## Suggested feature folder template

For each new domain (`leads`, `projects`, …):

```
features/<domain>/
  components/
  composables/
  api.ts
  queries.ts          # TanStack Query hooks
  routes.ts
  store.ts            # only if true client domain state
  types.ts
  index.ts            # public barrel
  README.md
```

Locales: `src/i18n/locales/en/<domain>.json` merged in `i18n/index.ts`.

## MVP priority order

1. Auth completion + app shell (Phase 1)
2. Leads / CRM (Phase 2)
3. Proposals & contracts (Phase 4)
4. Projects + **client portal dashboard** (Phase 5) — north star
5. Outreach library (Phase 3)
6. AI Coach + analytics (Phase 6)
7. Hardening & production deploy (Phase 7)

Outreach is valuable but secondary to closing the shared-client-dashboard loop.

## Definition of Done for frontend MVP

The frontend MVP is ready when:

- Freelancer can register/login (incl. social if enabled), verify email, reset password, and stay session-safe with refresh
- Freelancer can manage leads through the pipeline and follow-ups
- Freelancer can generate/review a proposal (offer) and a contract
- Freelancer can create a project, edit requirements, set milestones, and create a share link
- Client can open `/portal/:token` and see **requirements, offer, contract, progress, and reports**, and perform allowed accept/edit actions
- Core journeys covered by automated tests; app builds and deploys as a static SPA against the production API
- UI uses design tokens + i18n; critical paths meet basic WCAG AA expectations
- Errors reach users only as **generic, translated toasts** (or ErrorPage); technical details never in the UI
- `BaseButton`, `BaseModal`, `BaseCheckbox`, `Pagination`, and status components (error / success / loading / no-data) are the standard toolkit
- App pages exist for **error**, **loading**, and **404**

## Status legend

- `[ ]` Not started
- `[x]` Done
- Phase **Status** line summarizes overall phase health
