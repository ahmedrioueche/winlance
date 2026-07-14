# Winlance Web

Vue 3 frontend for Winlance. Follow [`RULES.md`](./RULES.md). Plan work with [`ROADMAP.md`](./ROADMAP.md).

## Stack

- Vue 3 + TypeScript + Vite
- Pinia, Vue Router, vue-i18n
- TanStack Query + Axios API client
- Tailwind CSS v4 (design tokens in `src/assets/styles/tokens.css`)
- ESLint + Prettier + Vitest

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
| `npm run test` | Vitest |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Theme

Design tokens live under `src/assets/styles/theme/`:

- `tokens.css` — Tailwind `@theme inline` bridge (utilities like `bg-canvas`, `text-ink`, `font-display`)
- `light.css` / `dark.css` — palettes switched via `data-theme` on `<html>`
- `base.css` — body/atmosphere styles

Toggle with `useTheme()` / `<ThemeToggle />`. Prefer Tailwind semantic classes over raw `var(--…)` in components.
