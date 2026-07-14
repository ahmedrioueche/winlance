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

- [x] Scaffold Vue 3 + TypeScript + Vite project under `web/`
- [x] Feature-based folder layout (`app/`, `features/`, `shared/`, `config/`, `router/`, `i18n/`)
- [x] Pinia, Vue Router, vue-i18n, TanStack Query, Axios client
- [x] Tailwind v4 + theme structure (`theme/tokens|light|dark|base.css`)
- [x] Light / dark themes + `useTheme()` + FOUC-safe boot script
- [x] Env config layer (`config/index.ts`, `flags.ts`, typed `ImportMetaEnv`)
- [x] ESLint, Prettier, Vitest smoke tests, README
- [x] App / Auth / Blank layouts + ErrorBoundary
- [x] Base primitives + status components + Toast
- [x] `NotFoundPage`, `ErrorPage`, `LoadingPage`
- [x] `usePagination()` + CI (`web-ci.yml`)
- [ ] MSW for API mocking in tests
- [ ] Boundary lint rules
- [ ] Storybook / fuller component docs
- [ ] Optional `Drawer` / `Dropdown`

Status: **Complete for MVP**

---

## Phase 1 — Authentication and app shell

- [x] Login + auth store + route guards
- [x] Registration
- [x] Email verification page (`?token=`)
- [x] Password reset request + confirm
- [x] Token refresh interceptor (401 → refresh once → retry → logout)
- [x] Logout (blacklist refresh) + session clear
- [x] Profile settings (`GET`/`PATCH` `/auth/me/`)
- [x] Authenticated app chrome (sidebar nav)
- [ ] Google / GitHub social login UI (API ready; needs provider SDK)
- [x] Demo-account affordance when flag on (`VITE_ENABLE_DEMO_AUTH`)
- [x] Honor `?redirect=` after login (same-origin paths only)
- [ ] Deeper auth unit/E2E tests

Status: **MVP complete** (social + deeper tests open)

---

## Phase 2 — Leads and CRM

- [x] `features/leads` module
- [x] Leads list: search, status filter, pagination
- [x] Pipeline board + transition actions
- [x] Lead detail + rescore + status change
- [x] Create lead + delete confirm modal
- [x] Contacts / notes / follow-ups nested editors
- [x] Company management UI (`/app/companies`)
- [x] Follow-up overdue/upcoming/completed views
- [x] Loading / empty / error + toast errors + feature i18n

Status: **CRM MVP complete**

---

## Phase 3 — Outreach and marketing content

- [x] `features/outreach` module
- [x] Templates / sequences / playbook surfaces
- [x] Template render helper UX
- [x] Full tag CRUD editor
- [x] Checklist item editing polish
- [x] Insert-into-proposal deep links

Status: **Phase 3 complete**

---

## Phase 4 — Proposals and contracts

- [x] `features/proposals` — list, from-lead, detail, generate/send
- [x] `features/contracts` — list, from-proposal, detail, generate/export/send/sign
- [x] Toast + status patterns + feature i18n
- [x] Rich template picker / body editor
- [x] Polling UX for async generation tasks
- [x] Stronger project_id attach flows in UI

Status: **Phase 4 complete**

---

## Phase 5 — Projects and client portal

### Freelancer project UI

- [x] `features/projects` — list, from-proposal, detail
- [x] Share-link create/list + copy `/portal/{token}`
- [x] Requirements / milestones surfaces on detail
- [x] File metadata UI (name + URL; storage upload later)
- [x] Progress report authoring on project detail

### Client portal (north star)

- [x] `features/portal` — `/portal/:token` (blank layout, public)
- [x] Dashboard sections: requirements, offer, contract, progress, reports, files
- [x] Client create/patch requirements; accept offer/contract
- [x] Mobile visual polish pass
- [x] Expired-token dedicated empty state

Status: **North-star portal MVP complete**

---

## Phase 6 — AI Coach and analytics

- [x] `features/ai-coach` — sessions list/create/detail + regenerate
- [x] `features/analytics` — funnel + summary dashboard
- [x] Charts / sparklines (CSS funnel bars + SVG sparklines)
- [x] Cross-link coach → outreach template draft + proposal insert
- [x] Project progress-report authoring on freelancer side

Status: **Phase 6 complete**

---

## Phase 7 — Hardening, i18n, a11y, and production

- [x] CI for `web` (lint, typecheck, test, build)
- [x] Toast + modal error/confirmation patterns enforced in features
- [x] Playwright E2E (login, lead CRUD, portal happy path; API mocked)
- [x] Expand Vitest coverage (polling + analytics funnel helpers)
- [x] Bundle visualizer budget (`build:analyze` + `budget` in CI)
- [x] Second locale stub (`fr` — common/auth/portal; rest fall back to `en`)
- [x] Accessibility baseline (skip links, landmarks, focus, reduced motion)
- [x] Web Vitals when Sentry DSN set (`web-vitals`; full `@sentry/vue` still optional)
- [x] Production static deploy docs + API CORS wiring (`CORS_ALLOWED_ORIGINS`)

Status: **Phase 7 complete for MVP**

---

## Cross-cutting workstreams (ongoing)

| Workstream | Notes |
|------------|--------|
| Design system | `BaseButton`, `BaseModal`, `BaseCheckbox`, `BaseInput`, `Pagination`, status components |
| Status UI | error / success / loading / no-data |
| App pages | Error / Loading / 404 |
| Toasts | Generic translated errors only |
| Server state | TanStack Query per feature |
| Auth | In-memory JWT + refresh interceptor |

## MVP priority order

1. Auth + shell — done
2. Leads / CRM — done
3. Proposals & contracts — done
4. Projects + client portal — done
5. Outreach — done
6. AI Coach + analytics — done
7. Hardening / E2E / hosting — done

## Definition of Done for frontend MVP

- [x] Freelancer register/login/verify/reset + session refresh
- [x] Manage leads (list, pipeline, detail) + contacts/notes/follow-ups/companies
- [x] Create/review proposal and contract flows
- [x] Create project + share link + files/reports
- [x] Client portal: requirements, offer, contract, progress, reports + accept actions
- [x] Design tokens + i18n + generic toasts
- [x] App builds in CI
- [x] Playwright E2E for critical paths
- [x] Production static deploy wired to API (CORS + SPA host docs)

## Status legend

- `[ ]` Not started / remaining
- `[x]` Done
