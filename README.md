# OtO Lawn Care — Irrigation Dashboard

A small React Native (web) irrigation dashboard built for the OtO take-home
interview. The app lets a signed-in user review their account, inspect
devices and their zones, and rename a device — with proper loading, error,
and offline states throughout.

The original brief lives in [`README_TaskDescription.md`](./README_TaskDescription.md).

## Quick start

```bash
npm install
npm run web            # dev server on http://localhost:8081
```

Production build (silences the "development build" warning):

```bash
npx expo start --web --no-dev --minify
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run web` | Start Expo dev server (web). |
| `npm run typecheck` | Run TypeScript in `--noEmit` mode. |
| `npm run lint` | ESLint over `src/`. |
| `npm run format:check` | Prettier check. |
| `npm run format` | Prettier write. |
| `npm test` | Run the Jest suite. |

## Project structure

```
src/
├── api/
│   ├── client.ts          # fetch wrapper + typed ApiError
│   ├── endpoints.ts       # typed calls to /api
│   └── __tests__/         # client + ApiError tests
├── hooks/
│   ├── useDashboard.ts    # account + devices fetch
│   ├── useDeviceDetail.ts # device + zones fetch, rename mutation
│   └── __tests__/         # hook tests
├── models/
│   └── types.ts           # provided shared types
└── screens/
    ├── DashboardScreen.tsx
    └── DeviceDetailsScreen.tsx
App.tsx                    # simple useState-based routing
```

## Architecture notes

- **API layer.** [`src/api/client.ts`](./src/api/client.ts) is a single
  `fetch` wrapper that centralises the `/api` prefix, JSON headers,
  `AbortController` timeouts, and error normalisation. All failures
  become a typed `ApiError` carrying `status`, `endpoint`, and an
  `isNetworkError` flag so the UI can differentiate offline from HTTP
  errors.
- **Hooks own async state.** Screens stay presentational; hooks expose
  `isLoading`, `isRefreshing`, `error`, and mutation state.
- **Optimistic rename.** [`useDeviceDetail`](./src/hooks/useDeviceDetail.ts)
  updates the local device immediately, then rolls back on failure and
  surfaces `updateError` for inline display.
- **Routing.** Two screens, so `App.tsx` uses a `useState` toggle rather
  than pulling in React Navigation. Easy to swap for
  `@react-navigation/native-stack` when the app grows.

## Accessibility

- `accessibilityRole` and `accessibilityLabel` on every interactive
  element, header, and status region.
- Loading spinners announce with `progressbar`; errors use `alert` with
  `accessibilityLiveRegion` so screen readers pick up async changes.
- Redundant decorative pills and dots are hidden from the accessibility
  tree (`accessibilityElementsHidden`) so users hear one clear label per
  card.
- Save button reports `accessibilityState={{ busy }}` during the PATCH
  request.

## Tests

Jest 29 + `@testing-library/react` (hook rendering under jsdom).

```
Test Suites: 3 passed, 3 total
Tests:       17 passed, 17 total
```

- **`client.test.ts`** — `ApiError` shape, GET URL/headers/parsing, HTTP
  error mapping, statusText fallback, network failure → `isNetworkError`,
  PATCH body serialisation, validation errors.
- **`useDashboard.test.ts`** — parallel fetch, `ApiError` surfacing,
  generic error fallback, `refresh()` toggles `isRefreshing`.
- **`useDeviceDetail.test.ts`** — parallel device+zones fetch, fetch
  error, optimistic rename success, rollback on failure, empty-name
  guard.

## What I'd add with more time

- Component tests (blocked on `@testing-library/react-native` stabilising
  under React 19; hooks contain the real logic anyway).
- React Navigation stack with typed route params + deep links.
- Expanded device info card (location, state, battery, updatedAt).
- Cancel button and inline validation on rename.
- Shared cache (React Query / SWR) so a rename in Detail propagates to
  Dashboard without a manual refresh.
- Colour-contrast pass on the offline red text — likely fails WCAG AA.
