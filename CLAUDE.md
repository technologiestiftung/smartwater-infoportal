# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Smartwater Infoportal is a Next.js 16 (App Router, React 19, Turbopack) flood and heavy-rain information portal for Berlin citizens. The UI is German-only. Main branch for PRs: `staging`.

## Commands

- `npm run dev`: starts the dev server on :3000. It first reinstalls `berlin-ui-library` from GitHub (`install-lib`), so it needs network access. Use `npx next dev --turbopack` to skip that step.
- `npm run build` / `npm start`: also run `install-lib` first.
- `npm run lint`: `eslint --quiet`. This is also the husky pre-commit hook.
- Commit messages follow Conventional Commits (commitlint).
- Node version: see `.nvmrc` (24.x).
- Environment: copy `.env.example` to `.env`. You need `GEOSERVER_BASE_URL`, `GEOSERVER_WORKSPACE` and `GEOSERVER_BUILDING_LAYER`. To run GeoServer locally: `docker-compose up geoserver` (map data goes in `./maps`).

### Tests

- The README's `npm test` and `test:watch` scripts don't exist. Jest is configured (`jest.config.js`: ts-jest, roots `tests/` and `src/`, `@/` alias, loads `.env` via `tests/setup.ts`), but there are no Jest tests yet. To run one: `npx jest path/to/file.test.ts`.
- E2E: Playwright specs are in `tests/e2e/` and there is no Playwright config. They expect the app running on `http://localhost:3000`. Run a single spec with `npx playwright test tests/e2e/report/search.spec.ts`; use `npm run playwright-ui` for the UI mode.

## Architecture

**User flow:** address search → building lookup → questionnaire → risk result → PDF report.

- `src/server/actions/` holds the server actions: address search (`searchAddresses`, with a Photon fallback), `findAlkisBuilding` (calls `GeoServerClient` in `src/lib/geoserverClient.ts`, which runs WFS queries against the ALKIS building hazard layer, EPSG:25833 via proj4), the Berlin footer and the warnings.
- State lives in `src/store/defaultStore.tsx`, a zustand store persisted to storage. It holds the location data, the questionnaire answers, the risk result and the interactive-map UI state. Wait for `hasHydrated` before reading persisted state.
- Risk scoring is in `src/utils/floodRiskCalculator.ts` and is driven by `src/config/floodRiskConfig.json` (questions, scores, `riskThresholds`). Change the scoring logic in that JSON first.

**Maps (OpenLayers):**

- `src/components/Map/` is the interactive map. The pipeline is MapInitializer → LayerInitializer → OlMap. The layers are defined in `src/config/services.json` (basemap vector tiles, WMTS, WFS). The local `public/resources/*.json` files are the vector-tile styles.
- Two API routes proxy external services so the CSP stays tight: `/api/wmts-capabilities` and `/api/wfs-cache`. If you add a new external map or data origin, add it to the CSP in `next.config.ts` as well (`mapDataOrigins`).
- `src/components/ScenarioMap/` is a separate map setup for scenario maps. Its state is in `src/lib/store/mapStore.ts`.

**PDF report:**

- `src/components/Report/` builds the PDF client-side with jsPDF. Content comes from `pdf.json`; embedded Arial fonts are in `assets/`.
- The map and risk-block images come from `POST /api/screenshot`. That route uses Puppeteer locally and `@sparticuz/chromium` in production on Netlify; see `netlify.toml` and `outputFileTracingIncludes` for the chromium bundling. It screenshots the internal headless routes `/scenario-map`, `/widget-screenshot` and `/riskblock-screenshot`.
- `src/app/LayoutClient.tsx` strips the site chrome from those headless routes. Keep these lists in sync when you add a screenshot route.

**UI and i18n:**

- Components come from `berlin-ui-library` (installed from GitHub), and styling uses Tailwind v4 (`src/app/globals.css`).
- Text is handled by next-intl with a fixed `de` locale. `src/i18n/request.ts` merges every `messages/de/*.json` file, so a new message file must be added there.
- German route names (`hochwasser-check`, `handlungsempfehlungen`, …) are the public URLs.

## Conventions

- Prettier formatting: tabs, double quotes, trailing commas, Tailwind class sorting.
- ESLint rules are in `eslintRules.mjs`: `eqeqeq`, `no-param-reassign`, `max-params` 3 and complexity 10 as warnings, and others.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
