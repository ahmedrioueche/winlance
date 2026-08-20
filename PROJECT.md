# Winlance

**Tagline:** The CRM for solo developers. Win more freelance clients.

## What it is

Winlance is a focused tool that supports one pipeline end to end: finding leads, turning them into clients, and delivering work that turns into referrals.

Everything in the app exists to support this single journey:

```
Find Leads → Qualify → Contact → Discovery Call → Proposal
    → Negotiation → Contract → Project Tracking → Testimonial → Referral
```

## Positioning

- Not "Freelancer Guide" — that undersells it. Winlance actively helps freelancers win work and manage the sales process, not just learn how freelancing works.
- Market it around the outcome, not the audience: **"Win more freelance clients"** rather than "manage your freelance business."
- Primary audience: solo developers / freelance devs. Positioning should stay narrow enough to be credible as a portfolio piece, but not so narrow it can't later extend to designers, consultants, or agencies.

## Core Modules

### 1. Find Leads

Help freelancers discover potential clients.

- Lead database
- Import from LinkedIn or CSV (later)
- Company profile + website analysis
- Contact information
- Lead scoring

### 2. Marketing Guide

Freelancer-specific marketing playbook (not generic marketing content).

- Cold email templates
- LinkedIn outreach scripts
- Portfolio optimization checklist
- Personal branding checklist
- Follow-up sequences
- Guidance on outreach volume (how many leads to contact per week)

### 3. Lead CRM

A lightweight CRM built around the pipeline stages:

```
New → Contacted → Interested → Discovery Call → Proposal Sent
    → Negotiation → Won / Lost
```

Each lead stores: notes, last contact date, next follow-up, probability of closing.

### 4. Proposal Generator

Generates proposals from templates, including deliverables, timeline, pricing, optional extras, and payment schedule. AI customizes the proposal based on the client's business.

### 5. Contract Generator

One-click contract generation using data already captured in the proposal. Exports to PDF.

### 6. Project Tracker (Client Portal)

Once a contract is signed, the client gets a portal showing progress, milestones, completed features, upcoming work, files, and timeline. Doubles as a strong portfolio feature — demonstrates role-based auth and a polished client-facing UX.

### 7. AI Sales Coach _(differentiator)_

Conversational assistance for common freelancer sales moments, e.g.:

- "Client says my quote is too expensive." → suggested professional responses
- "Client ghosted me." → recommended follow-up
- "How should I price this project?" → estimated reasonable range

### 8. Analytics

Funnel visualization across: leads added, outreach sent, response rate, discovery calls, proposal acceptance rate, closed deals, revenue. Goal is to make it obvious where opportunities are being lost in the pipeline.

## MVP Scope

To keep this realistic as a buildable product (portfolio-scale, not a funded startup), the MVP includes:

- User authentication
- Lead CRM
- Marketing playbook (articles/checklists)
- Proposal generator
- Contract generator
- Client project tracker (portal)
- AI assistant for outreach, pricing, and negotiation

**Explicitly out of scope for MVP:** LinkedIn/CSV import automation, full analytics/funnel dashboard, multi-user/team accounts, payment processing, agency/team support.

## Why this scope

This set of features is a complete, coherent product on its own — it covers the full client-acquisition lifecycle without turning into "yet another all-in-one freelancer platform" that tries to also handle taxes, invoicing, time tracking, etc. Anything outside the Find → Win → Deliver → Referral loop is a candidate for a later phase, not the MVP.
