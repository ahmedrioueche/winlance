# Vue.js Project Rules (Cursor AI)

These rules define how Cursor's AI should generate, refactor, and reason about code in this Vue.js project. Follow every section strictly. When a request conflicts with these rules, prefer the rules unless the user explicitly overrides them.

**Stack assumptions:** Vue 3, `<script setup>`, Composition API, TypeScript, Vite, Pinia, Vue Router, vue-i18n. Adjust only if the project's `package.json` says otherwise — always check actual dependencies before assuming a tool.

---

## 1. Project Structure & Conventions

- Use **feature-based** structure, not layer-based:
  ```
  src/
    app/            # app shell, providers, root App.vue
    features/
      auth/
        components/
        composables/
        store.ts
        api.ts
        routes.ts
        index.ts     # public API (barrel)
    shared/
      components/    # design system (Button, Input, Modal…)
      composables/
      utils/
      types/
    config/
    router/
    i18n/
    assets/
  ```
- Every feature folder exposes a single `index.ts` barrel; nothing outside the feature imports from its internals directly.
- File naming: `PascalCase.vue` for components, `useCamelCase.ts` for composables, `camelCase.ts` for utils/services, `kebab-case` for folders.
- Use absolute imports via `@/` alias — never deep relative paths (`../../../`).
- One component per file. No default-export-only files without a matching name.
- Enforce ESLint (`eslint-plugin-vue`, `@typescript-eslint`) + Prettier. Never hand-format against configured rules.
- Keep `<script setup>`, `<template>`, `<style scoped>` order consistent across all components.

---

## 2. Environment & Configuration System

- All env vars go through `import.meta.env`, typed via `env.d.ts` (`ImportMetaEnv` interface). Never read `process.env` in client code.
- Centralize config access in `src/config/index.ts` — no component reads `import.meta.env` directly.
- Separate `.env`, `.env.development`, `.env.staging`, `.env.production`. Never commit secrets; only `VITE_`-prefixed public values are allowed client-side.
- Feature flags live in `src/config/flags.ts`, resolved once at boot, injected via a composable (`useFeatureFlag('flagName')`), never read ad hoc.
- API base URLs and third-party keys are config-driven, never hardcoded in components or services.

---

## 3. Colors, Themes & Fonts

- All colors, spacing, radii, and typography are **design tokens** — defined once (CSS custom properties or a `tokens.ts`), never hardcoded hex/px values in components.
- Structure: `--color-primary-*`, `--color-semantic-success/warning/error/info`, `--space-*`, `--radius-*`, `--font-*`.
- Support light/dark themes via a `[data-theme]` attribute or CSS class toggle, driven by a `useTheme()` composable — never inline conditional styling for theme.
- Typography scale is fixed (e.g. `xs/sm/base/lg/xl/2xl/...`); components consume scale tokens, not raw `font-size` values.
- Tailwind (if used) must map its `theme.extend` to these same tokens — no parallel/duplicate values.

---

## 4. Component System (Atomic → Complex)

- Organize by complexity tiers:
  - **Base** (`shared/components/base/`): Button, Input, Icon, Checkbox — no business logic, fully generic, prop-driven.
  - **Composite** (`shared/components/composite/`): Modal, Table, Pagination, Dropdown — compose base components.
  - **Feature components** (`features/*/components/`): business-specific, may use composite + base.
  - **Layout** (`app/layouts/`): page shells, headers, sidebars.
- Every component has a typed `Props` interface via `defineProps<Props>()` and typed emits via `defineEmits<Emits>()`. No untyped props.
- Base components never call the store, router, or API directly — only receive props/emit events.
- Use `v-model` conventions properly (`defineModel()` in Vue 3.4+) instead of manual `modelValue`/`update:modelValue` boilerplate where available.
- Every base/composite component that has variants documents its API (props, slots, events) — see §20.
- Prefer slots over prop-drilling for content composition (e.g. Modal header/body/footer slots).

---

## 5. UX & Interaction Patterns

- Standardize four states per data-driven view: **loading, empty, error, success**. No component silently renders nothing while data resolves.
- Loading state uses shared `<Skeleton>` components matching the shape of the eventual content — not generic spinners for content-heavy views.
- Empty states use a shared `<EmptyState>` component (icon + message + optional CTA), not ad hoc `v-if="list.length === 0"` text.
- Errors inside a view use inline `<ErrorState>` with retry; app-level/unexpected errors go through the error boundary (§13).
- Rule of thumb: **Toasts** = transient, non-blocking, no user decision required. **Modals** = blocking, requires a decision/input. Never use a modal for a passive notification or a toast for a destructive confirmation.
- Destructive actions always go through a confirmation dialog with explicit action naming (e.g. "Delete project" button, not just "Confirm").

---

## 6. Accessibility (a11y) System

- All interactive elements must be keyboard operable (`Tab`, `Enter`, `Space`, `Esc` where relevant). Never bind click behavior only to `@click` on a non-interactive element (`div`, `span`) without `role` + `tabindex` + keyboard handler — prefer a real `<button>`.
- Modals/drawers trap focus while open and restore focus to the trigger element on close.
- Use semantic HTML first; ARIA attributes only fill gaps semantic HTML can't cover.
- All form inputs have associated `<label>` (or `aria-label`/`aria-labelledby`) — no placeholder-only labeling.
- Color is never the sole indicator of state (error/success/warning) — pair with icon or text.
- Minimum contrast: 4.5:1 for text, 3:1 for large text/UI components (WCAG AA).
- Test critical flows with screen reader semantics in mind (announce loading, error, and success states via `aria-live` regions where appropriate).

---

## 7. State Management System

- Use **Pinia** for global state. Store structure: one store per domain (`useAuthStore`, `useCartStore`), never a single monolithic store.
- Rule: **UI state stays local** (`ref`/`reactive` in the component or a local composable). **Server/domain state goes in Pinia**, typically fed by data-fetching composables (§11). Don't put ephemeral UI state (modal open/closed, form input drafts) in global stores.
- Cross-component-but-single-feature state → a feature-scoped composable (`useCheckoutFlow()`), not necessarily a Pinia store.
- Persist only what's necessary (auth token references, user prefs) via a dedicated persistence plugin — never persist entire stores blindly.
- Stores never call components; only components/composables call stores.
- Avoid deeply nested reactive objects in store state where possible; prefer flat, normalized shapes for collections (id-keyed maps) over nested arrays for anything frequently updated.

---

## 8. Internationalization (i18n) System

- Use `vue-i18n`. No hardcoded user-facing strings in components — everything goes through `t('key')` / `$t('key')`.
- Translation files organized per feature, merged at build time:
  ```
  src/i18n/
    locales/
      en/
        common.json
        auth.json
        checkout.json
      fr/
        ...
  ```
- Key naming: `feature.section.key` (e.g. `auth.login.submitButton`), lowerCamelCase leaves, dot-namespaced.
- Always use ICU/vue-i18n pluralization (`t('cart.items', count)` with plural forms defined in the JSON), never manual string concatenation for counts.
- Dates, numbers, and currency go through `$d()` / `$n()` (locale-aware formatters), never manual `Date` string formatting.
- If RTL locales are supported, layout must use logical CSS properties (`margin-inline-start`, not `margin-left`) so it flips automatically.

---

## 9. Authentication System

- Auth state lives in a dedicated `useAuthStore` (Pinia): `user`, `status` (`idle|authenticating|authenticated|unauthenticated`), tokens (or token metadata only — see §16 for storage rules).
- Login/logout/refresh flows are encapsulated in `features/auth/` — no component calls auth API endpoints directly.
- Use short-lived access tokens + refresh flow via an HTTP client interceptor (see §11) that transparently refreshes on 401 and retries once, then forces logout on repeated failure.
- Session persistence (e.g. "remember me") is explicit and configurable, never default-on for sensitive contexts.
- Protected routes are enforced via router navigation guards (§12), not by hiding UI alone.

---

## 10. RBAC / Permissions System

- Model as **roles → permissions**, not roles hardcoded into UI checks. Example: `hasPermission('project:delete')`, not `if (user.role === 'admin')`.
- Central composable `usePermissions()` exposes `can(permission)`/`hasRole(role)`; used both for UI visibility (`v-if="can('...')"`) and for guarding actions.
- UI-level permission checks are a UX convenience only — the backend is the source of truth. Never assume hiding a button is sufficient security (see §16).
- Feature/menu visibility driven by the same permission model as action-level checks — no separate ad hoc "canSeeMenuItem" logic.
- Keep the permission list defined in one typed source (`permissions.ts`) synchronized in naming with backend-defined permission strings.

---

## 11. Data Fetching, Caching & Pagination

- All HTTP calls go through a single API client abstraction (`src/shared/api/client.ts`, e.g. wrapping `axios`/`ky`/`fetch`) with interceptors for auth headers, error normalization (§13), and base URL (§2). No component calls `fetch`/`axios` directly.
- Use **TanStack Query (Vue Query)** (or an equivalent caching layer) for server state: caching, deduplication, background refetching, stale-while-revalidate. Don't reinvent caching with manual `ref` + `onMounted` fetch calls for anything beyond trivial one-off fetches.
- **Vue Query refs:** `isPending` / `isError` / `isFetching` on a query or mutation object are nested `Ref`s. In templates they do **not** auto-unwrap. Always destructure (`const { isPending, isError, data } = useXQuery()`) or read `.value` (`query.isPending.value`). Never wrap with `Boolean(query.isPending)` — that is always `true` and permanently disables buttons / sticks loading UIs.
- Pagination pattern is consistent app-wide: prefer cursor-based pagination when the API supports it; otherwise page/limit. Encapsulate in a `usePagination()` composable shared across list views.
- Search/filter state is synced to the URL query string for shareability/back-button support, not kept purely in local component state.
- Background refetching (on window focus, interval, or mutation invalidation) is configured per query, not globally blanket-enabled without reason.

---

## 12. Routing System

- Use `vue-router` with route definitions colocated per feature (`features/*/routes.ts`), aggregated in `src/router/index.ts` — no giant flat route file.
- All routes are **lazy-loaded** (`component: () => import('...')`) except the shell/landing route.
- Nested layouts use `<router-view>` nesting with named layout components (`AppLayout`, `AuthLayout`, `BlankLayout`) set via route `meta.layout`.
- Protected routes use `meta.requiresAuth` / `meta.permissions` consumed by a global `beforeEach` navigation guard — never per-component redirect logic scattered across pages.
- Always define a catch-all 404 route and a global navigation error/fallback route.
- Route params/query are typed and validated at the point of use, not trusted blindly.

---

## 13. Error Handling System

- Global error boundary via Vue's `app.config.errorHandler` plus a top-level `<ErrorBoundary>`/`onErrorCaptured` wrapper around the router view — catches unhandled render/runtime errors and shows a fallback UI, never a blank white screen.
- API errors are normalized at the client layer (§11) into a consistent shape (`{ code, message, status, details }`) before reaching components — components never parse raw HTTP error bodies themselves.
- User-facing error messages are friendly and actionable; raw error/stack details are logged (§14), never shown directly to end users.
- Retry strategy: transient/network errors get automatic retry with backoff (handled by the data layer, §11); user-triggered actions (form submit) surface a retry affordance instead of auto-retrying silently.
- Form validation errors are field-level and inline, distinct from global/API errors (which use toast or error state).

---

## 14. Logging & Monitoring

- Integrate a single error-tracking SDK (e.g. Sentry) initialized once in `src/app/monitoring.ts`, wired into `app.config.errorHandler` and the API client's error interceptor.
- Capture performance metrics (Web Vitals: LCP, FID/INP, CLS) and report them, not just errors.
- User interaction breadcrumbs (navigation, key clicks, API calls) are automatically captured by the monitoring SDK where possible rather than manually logged everywhere.
- Never log sensitive data (tokens, passwords, PII) to console or error tracker — scrub before sending (see §16).
- `console.log` is not allowed in committed code outside of explicit dev-only debug utilities; use a `logger` abstraction (`logger.debug/info/warn/error`) that's stripped or gated in production.

---

## 15. Performance & Optimization

- Route-level and heavy-component-level code splitting via dynamic `import()` is mandatory for anything not needed on initial paint.
- Use `defineAsyncComponent` for large, rarely-shown components (complex modals, charts, editors).
- Memoize expensive computations with `computed()`; avoid recomputing derived state inline in templates.
- Lists over a reasonable threshold (~100+ items) use virtualization (e.g. `vue-virtual-scroller`) instead of rendering everything.
- Images: use responsive `srcset`/modern formats (WebP/AVIF), lazy-load below-the-fold images (`loading="lazy"`), never ship unoptimized originals.
- Watch bundle size via build analysis (`rollup-plugin-visualizer` or Vite equivalent) as part of CI, not just ad hoc local checks.
- Avoid unnecessary `watch`/`watchEffect` with broad reactive dependencies; scope reactivity as tightly as possible.

---

## 16. Security (Frontend Scope)

- **Token storage:** prefer httpOnly, secure cookies set by the backend over `localStorage`/`sessionStorage` for auth tokens. If a token must be held client-side, keep it in memory (Pinia store, not persisted) rather than `localStorage`, to reduce XSS exfiltration risk.
- **XSS prevention:** never use `v-html` with unsanitized/user-generated content. If rendering rich text is required, sanitize with a library (e.g. DOMPurify) first.
- **CSRF:** if using cookie-based auth, ensure CSRF tokens are included on state-changing requests per backend contract.
- Never trust client-side permission checks (§10) as a security boundary — they're UX only; the backend must enforce authorization.
- Sensitive data (PII, secrets) is never logged, stored in plain query strings, or kept in browser storage longer than necessary.
- Validate/escape all dynamic content injected into the DOM; rely on Vue's default template escaping and avoid bypassing it.
- Keep dependencies patched — cross-reference with §19 for vulnerability monitoring.

---

## 17. Feature & Module Isolation Strategy

- Each feature folder (`features/*`) is self-contained: components, composables, store, API calls, routes, types.
- A feature exposes only what's in its `index.ts` barrel as its **public API**. No other feature (or `shared/`) imports from `features/x/components/InternalWidget.vue` directly — only from `features/x`.
- Cross-feature communication happens through: (a) shared state in a dedicated cross-cutting store, (b) events/composables explicitly designed for it, or (c) the router — never by one feature reaching into another's internals.
- `shared/` may be imported by any feature; features may never be imported by `shared/`.
- Enforce these boundaries with lint rules (e.g. `eslint-plugin-boundaries` or import restrictions), not just convention/code review alone.

---

## 18. Testing System

- **Unit tests** (Vitest): composables, utils, store logic — pure logic, no DOM.
- **Component tests** (Vitest + `@vue/test-utils` / Vue Testing Library): individual component behavior, props/events/slots, in isolation with mocked dependencies.
- **Integration tests**: multiple components + store + router together for a feature flow (e.g. "login form submits and redirects").
- **End-to-end tests** (Playwright/Cypress): critical user journeys only (auth, checkout, core CRUD) — not exhaustive UI coverage.
- Test data via factories/fixtures (`tests/factories/`), never hand-duplicated inline objects scattered across test files.
- Mock the API client at the network boundary (e.g. MSW) rather than mocking internal modules deeply — tests should resemble real usage.
- New components/composables/stores require accompanying tests before being considered complete; don't generate implementation code without at least a baseline test when asked for "production-ready" code.

---

## 19. Dependency Management System

- New dependencies require justification (why not build it, why this library) — avoid adding a package for something trivial to implement.
- Lockfile (`package-lock.json`/`pnpm-lock.yaml`) is always committed and respected; never regenerate it carelessly or install with mismatched package managers.
- Pin versions deliberately for critical infra (build tools, framework); allow caret ranges for low-risk utility libraries per team convention.
- Run dependency audits (`npm audit` / `pnpm audit` or Dependabot/Renovate) regularly; security patches take priority over feature work.
- Upgrade cadence: framework/major version upgrades are deliberate, planned, and tested — never a silent side effect of an unrelated change.

---

## 20. Documentation System

- Every base/composite component has doc comments describing props, slots, and emitted events (JSDoc above `defineProps`/`defineEmits`, or a colocated `.md`/Storybook story if Storybook is used).
- `README.md` per feature folder for anything non-trivial: purpose, key flows, gotchas.
- Root `docs/` (or `README.md`) covers: architecture overview, setup/onboarding steps, environment variables required, and how to run tests/lint/build.
- Contribution guidelines (`CONTRIBUTING.md`) cover branch/commit conventions, PR expectations, and how these Rules.md conventions are enforced.
- Documentation is updated in the same PR as the code change it describes — not deferred as a follow-up.

---

## How Cursor Should Apply These Rules

- When generating a new component, place it in the correct tier/folder per §1 and §4, use design tokens per §3, ensure a11y per §6, and type props/emits.
- When generating anything that fetches data, route it through the API client + caching layer per §11, and handle loading/empty/error states per §5 and §13.
- When generating anything touching auth or permissions, respect §9/§10/§16 — no direct token manipulation, no client-only security assumptions.
- When adding user-facing text, always use i18n keys (§8), never hardcoded strings.
- When a request would violate one of these rules (e.g. "just hardcode this color" or "store the token in localStorage for now"), flag the tradeoff briefly and offer the compliant alternative rather than silently violating the rule.
