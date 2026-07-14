# Backend Roadmap

This roadmap outlines the backend work for Winlance from foundation to MVP and beyond.

## Product north star — Shared client dashboard

A core MVP outcome: the freelancer sends the client a link that opens a shared engagement dashboard with:

- Initial app / project requirements (editable by freelancer and client)
- The offer (proposal)
- The contract
- Progress tracking
- Reports

Phases 4–6 build the artifacts and APIs that power this dashboard; Phase 5 owns the portal, share link, and aggregation.

## Phase 0 — Foundation

Goal: establish the project structure and development workflow.

- Set up Django project, app layout, and environment configuration
- Define settings for development, testing, and production
- Add Docker Compose services for Django, Postgres, Redis, RabbitMQ, and Celery
- Create a health endpoint and baseline tests
- Document setup and local development commands

Status: In progress / complete scaffold

## Phase 1 — Authentication and Core API

Goal: create the shared foundation for authenticated users and API access.

- [x] Implement JWT authentication for API endpoints
- [x] Add user registration, login, and profile endpoints (GET/PATCH `/auth/me/`)
- [x] Add social authentication via Google and GitHub (provider token verification + `SocialAccount`)
- [x] Implement email verification for new accounts
- [x] Add password reset and account recovery flow
- [x] Support token refresh and secure logout
- [x] Create shared base models and common pagination/error handling
- [x] Add core permissions and audit-friendly timestamps (`IsOwner`, `TimeStampedModel`)
- [x] Build initial API versioning under /api/v1/
- [x] Demo accounts toggle via `DEMO_ACCOUNTS_ENABLED`

Deliverables:

- Auth endpoints
- Social login integration
- Email verification flow
- Password reset and recovery flow
- Secure token lifecycle
- Base API conventions
- User management foundation
- Env-toggled demo accounts

Status: Complete

## Phase 2 — Leads and CRM

Goal: support the lead discovery and sales pipeline workflow.

- [x] Define lead, company, contact, note, and follow-up models
- [x] Build CRUD APIs for leads and related records
- [x] Implement pipeline stages and status transitions (`POST /leads/{id}/transition/`)
- [x] Add lead scoring and follow-up scheduling logic (`rescore`, schedule, complete, overdue/upcoming)
- [x] Expose endpoints for CRM workflows and search/filtering (`q`, status, company, score, ordering, pipeline board)

Deliverables:

- Lead management system
- Pipeline and follow-up workflow
- Lead CRM APIs

Status: Complete

## Phase 3 — Outreach and Marketing Content

Goal: support outreach guidance and reusable sales content.

- [x] Add content models for templates, checklists, and sequences
- [x] Build APIs for outreach playbooks and follow-up templates
- [x] Support tagging and organization of marketing assets
- [x] Prepare for future AI-assisted outreach generation (render/duplicate helpers; playbook summary)

Deliverables:

- Outreach content APIs
- Marketing playbook foundation

Status: Complete

## Phase 4 — Proposals and Contracts

Goal: automate the offer and contract generation flow that later surfaces in the shared client dashboard.

- [x] Create proposal (offer) templates and proposal generation services
- [x] Add contract generation and export flow
- [x] Link proposals and contracts to leads (and `project_id` soft-link for Phase 5 portal)
- [x] Move expensive generation work into Celery tasks
- [x] Ensure offers and contracts can be attached to a client portal project for shared viewing (`?project_id=`)

Deliverables:

- Proposal / offer generation APIs
- Contract generation workflow
- Artifacts ready to embed in the client dashboard

Status: Complete

## Phase 5 — Projects and Client Portal

Goal: let the freelancer send the client a link that opens a shared dashboard for the engagement — covering requirements, offer, contract, progress, and reports.

### Shared client dashboard (core product feature)

The freelancer invites a client with a secure share link (and/or authenticated client access). That link opens a dashboard that includes:

1. **Initial app / project requirements** — collaborative requirements the freelancer and client can both view and edit
2. **The offer** — the proposal/offer tied to the engagement
3. **The contract** — the generated or attached contract for review/acceptance
4. **Progress tracking** — milestones, status updates, and delivery progress
5. **Reports** — progress and delivery reports visible to both sides

### Backend work

- [x] Add project, milestone, file, and requirements models
- [x] Support collaborative requirements editing with role-aware permissions (freelancer + client via portal)
- [x] Generate and manage secure client invitation / share links to open the dashboard
- [x] Build role-based access for freelancer and client dashboard views
- [x] Expose portal endpoints that aggregate requirements, offer, contract, progress, and reports for one engagement
- [x] Support freelancer-side updates (milestones, status, reports) that clients can read
- [x] Support client-side actions where allowed (edit requirements, accept offer or contract)

Deliverables:

- Project tracking backend
- Collaborative requirements API
- Secure client share-link / invitation flow
- Client portal dashboard API (requirements + offer + contract + progress + reports)

Status: Complete

## Phase 6 — AI Coach and Analytics

Goal: add differentiated product features and visibility into sales performance (freelancer funnel analytics) plus richer project reports for the client dashboard.

- [x] Add async AI coach endpoints and worker tasks (`/ai-coach/sessions/`, Celery generation)
- [x] Implement pricing, negotiation, and follow-up guidance services (mock provider; swappable via `AI_COACH_PROVIDER`)
- [x] Add analytics models for funnel metrics and reporting (`FunnelSnapshot`)
- [x] Expose dashboards and summaries for lead conversion data (`/analytics/funnel/`, `/analytics/summary/`)
- [x] Support project-level progress/delivery reports consumed by the client portal (`progress_report` on portal dashboard + `/analytics/projects/{id}/progress-report/`)

Deliverables:

- AI assistant backend services
- Funnel and analytics APIs
- Project report payloads for the client dashboard

Status: Complete

## Phase 7 — Hardening and Production Readiness

Goal: make the backend reliable and production-ready.

- [x] Add full test coverage for services and endpoints (core modules covered; CI runs the suite)
- [x] Improve observability, logging, and error handling (LOGGING, shared 500 shape, optional Sentry)
- [x] Set up CI and deployment automation (GitHub Actions + `docker-compose.test.yml` + prod settings wiring)
- [x] Add rate limiting, monitoring, and backup strategy (DRF throttles, `/health/ready/`, Postgres backup script)
- [x] Review security, permissions, and secrets handling (hardened `prod.py`, secrets fail-closed)

Deliverables:

- Production-ready backend
- Stable deployment pipeline

Status: Complete (MVP hardening)

## MVP Priority Order

1. Authentication and core API
2. Leads and CRM
3. Proposal (offer) and contract generation
4. Project tracking and shared client dashboard (link → requirements, offer, contract, progress, reports)
5. Outreach content and AI coach

## Definition of Done for MVP

The backend MVP is ready when it supports:

- Secure user authentication
- Google and GitHub login
- Email verification for new accounts
- Full lead management workflow
- Proposal / offer generation
- Contract generation
- Freelancer can send a client a link to a shared dashboard
- Shared dashboard exposes: editable requirements (freelancer + client), offer, contract, progress tracking, and reports
- Async AI-assisted workflows (AI Sales Coach sessions)
- Funnel analytics and project progress reports
- Test coverage for core modules
