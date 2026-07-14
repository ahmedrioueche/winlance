# Winlance Web

Vue 3 frontend for Winlance. Follow [`RULES.md`](./RULES.md). Plan work with [`ROADMAP.md`](./ROADMAP.md).

## Stack

- Vue 3 + TypeScript + Vite
- Pinia, Vue Router, vue-i18n
- TanStack Query + Axios API client
- Tailwind CSS v4 (design tokens in `src/assets/styles/tokens.css`)
- ESLint + Prettier + Vitest + Playwright

## Setup

```bash
cp .env.example .env.development
npm install
npm run dev
```

Dev server: `http://localhost:5173` (API proxied to `http://127.0.0.1:8000`).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local Vite server |
| `npm run build` | Typecheck + production build |
| `npm run build:analyze` | Build + write `dist/stats.html` bundle report |
| `npm run budget` | Fail if any JS chunk exceeds the size budget |
| `npm run test` | Vitest |
| `npm run test:e2e` | Playwright E2E (requires prior `npm run build`) |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Theme

Design tokens live under `src/assets/styles/theme/`:

- `tokens.css` — Tailwind `@theme inline` bridge (utilities like `bg-canvas`, `text-ink`, `font-display`)
- `light.css` / `dark.css` — palettes switched via `data-theme` on `<html>`
- `base.css` — body/atmosphere styles + reduced-motion

Toggle with `useTheme()` / `<ThemeToggle />`. Prefer Tailwind semantic classes over raw `var(--…)` in components.

## Accessibility baseline

- Skip-to-content link on app / auth / blank layouts
- Landmark `main#main-content`, sidebar `nav` with `aria-current`
- Focus-visible rings and `prefers-reduced-motion` respect
- Modals use focus trap + Escape (see `BaseModal`)

## Locales

Default locale is `en`. Set `VITE_DEFAULT_LOCALE=fr` for French shell/auth/portal strings; other namespaces fall back to English until translated.

## E2E (Playwright)

Critical journeys live under `e2e/` and mock `/api/v1/**` via Playwright routes (no live backend required).

```bash
npm run build
npm run test:e2e
```

First local run also needs browsers: `npx playwright install chromium`.

## Production wiring (SPA ↔ API)

Build outputs to `web/dist`. Host that folder behind any static CDN; SPA fallback is covered by `public/_redirects` (Netlify) and `netlify.toml`.

### Frontend build env

```bash
VITE_APP_NAME=Winlance
VITE_API_BASE_URL=https://api.example.com/api/v1
VITE_DEFAULT_LOCALE=en
VITE_ENABLE_DEMO_AUTH=false
VITE_SENTRY_DSN=
```

Copy from `.env.example`. Absolute `VITE_API_BASE_URL` is required when the API is on another origin.

### Backend CORS (required for cross-origin SPA)

Set on the API:

```bash
ALLOWED_HOSTS=api.example.com
CORS_ALLOWED_ORIGINS=https://app.example.com
```

`django-cors-headers` is enabled in Django settings. Production refuses to boot without `CORS_ALLOWED_ORIGINS`.

### Render (static site)

1. New **Static Site** from the monorepo, root directory `web`.
2. Build: `npm ci && npm run build`
3. Publish directory: `dist`
4. Rewrite rule: `/*` → `/index.html` (SPA)
5. Set `VITE_API_BASE_URL` to your backend `/api/v1` URL
6. On the API service, set `CORS_ALLOWED_ORIGINS` to the static site origin

### Cloudflare Pages / Netlify

Same build and publish dir (`web` / `dist`). Netlify uses committed `netlify.toml`. Configure the same `VITE_*` build variables and matching API CORS.

### Bundle budget

```bash
npm run build
npm run budget
npm run build:analyze   # optional HTML report at dist/stats.html
```

CI runs `budget` after `build`.
