## Goal
Help maintainers and AI coding assistants quickly understand this React + Vite frontend so contributions are fast and safe.

## Quick start (developer commands)
- Start dev server (HMR): `npm run dev` (Vite listens on host due to `--host`).
- Build for production: `npm run build`.
- Preview production build locally: `npm run preview`.
- Lint: `npm run lint` (project uses root `eslint.config.js`).

## High-level architecture
- Vite + React SPA (root: `index.html`, `main.jsx`).
- UI layout & pages under `src/pages/` and reusable UI under `src/components/`.
- Client API wrapper: `src/config/apiClient.jsx` — single axios instance with request/response interceptors. Tokens live in `localStorage` and apiClient adds `Authorization` header automatically.
- Routing: `src/routes/*` (examples: `ProtectedRoute.jsx`, `adminRoutes.jsx`, `publicRoutes.jsx`) — ProtectedRoute uses Redux `auth.isAuthenticated` and falls back to `PublicRoutes` when unauthenticated.
- Global state: classic Redux pattern under `src/redux/` (actions/, reducers/, services/). Example reducer: `src/redux/reducers/authReducer.jsx` (persists user & token to localStorage).
- Services: lightweight wrappers calling `apiClient` are in `src/services/` (e.g. `stripeService.js`, `paymentMethodService.js`, `emailService.js`). Prefer these modules for API interactions.

## Key conventions & patterns (do not deviate)
- Token & auth: token is saved in `localStorage` keys `token`, `userData`, `userRole`. Removing these simulates logout. `apiClient` will redirect to `/login` on 403 token-expiry messages.
- API errors: service modules throw readable Error messages (they often rely on `error.response.data.message`). Keep that shape when adding handlers.
- Routing: admin vs public routes are expressed as React-router Route trees. When adding a top-level route, add it to the appropriate `src/routes/*` file and keep the `RouteLoader` wrapper if present.
- Translations: copy strings to `src/i18/en.json` and `src/i18/he.json`. The UI reads these JSON files directly; prefer adding keys in existing nested structure.
- Styling: Tailwind is used (see `tailwind.config.js` and `index.css`/`App.css`). Avoid heavy component-level CSS files; follow existing utility classes.

## Environment and secrets
- Environment file: `.env` (root) sets VITE_API_URL and VITE_STRIPE_PUBLISHABLE_KEY. Use `VITE_*` prefixed vars and restart dev server after changes.

## Debugging hints & safe edits
- To reproduce an expired token flow: set a fake token in `localStorage` and make an API call — `apiClient` will clear storage and navigate to `/login` on 403 messages that mention token.
- To test payment flows locally, confirm `VITE_STRIPE_PUBLISHABLE_KEY` is set to a test key in `.env`.
- No tests currently present. Run `npm run lint` as a lightweight static check.

## Files to inspect for context when changing behavior
- API & auth: `src/config/apiClient.jsx`, `src/redux/reducers/authReducer.jsx`.
- Routing: `src/routes/ProtectedRoute.jsx`, `src/routes/adminRoutes.jsx`, `src/routes/publicRoutes.jsx`.
- Services: `src/services/stripeService.js`, `src/services/paymentMethodService.js`, `src/services/emailService.js`.
- i18: `src/i18/en.json`, `src/i18/he.json` (lots of content; maintain keys consistently).
- Store: `lib/store.jsx` (app-wide redux store wiring).
- ESLint: `eslint.config.js` (project lint rules).

## Example edits (safe patterns)
- Add a new protected route: update `src/routes/adminRoutes.jsx` and keep the existing `RouteLoader` wrapper. If the route needs auth-scoped data, read `state.auth.user.role`.
- Add a new API call: add a function in `src/services/<area>.js` that calls `apiClient` (do not import axios directly elsewhere).

## What the AI should not change automatically
- Do not change the token keys in localStorage or the auth reducer persistence shape without an explicit migration plan.
- Do not replace `apiClient` with ad-hoc axios instances — central interceptors are relied upon across services.

## Quick contacts & next steps
- If unsure about backend contract, inspect `VITE_API_URL` and ask backend owners for exact response shapes. Prefer defensive checks (e.g. `response.data?.data`) as shown in `stripeService.js`.

---
If this file missed any repo-specific conventions you rely on, tell me which areas to expand (examples: testing, CI, storybook, or build pipelines) and I will update the instructions.
