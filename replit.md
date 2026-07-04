# PotholeAI

A civic tech web app that lets citizens photograph potholes for instant AI severity analysis, while city officers manage reports from a dedicated ops dashboard.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/potholeai run dev` — run the frontend (port 23331, proxied at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Required Secrets

- `GEMINI_API_KEY` — Google Gemini API key for Vision analysis (image → severity + summary)
- `DATABASE_URL` — Postgres connection string (managed by Replit)
- `OFFICER_API_KEY` (optional) — if set, PATCH /api/reports/:id/status requires `X-Officer-Token` header

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 18 + Vite + TanStack Query + Wouter + shadcn/ui + Tailwind CSS
- API: Express 5 + pino structured logging
- DB: PostgreSQL + Drizzle ORM
- AI: Google Gemini 1.5 Flash Vision (`@google/generative-ai`)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec at `lib/api-spec/openapi.yaml`)
- Build: esbuild (CJS bundle for API)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/reports.ts` — Drizzle schema for pothole reports table
- `artifacts/api-server/src/routes/reports.ts` — all report/stats API routes
- `artifacts/api-server/src/lib/gemini.ts` — Gemini Vision analysis pipeline
- `artifacts/potholeai/src/` — React frontend (citizen reporter + officer dashboard)
- `lib/api-client-react/src/generated/` — generated React Query hooks (do not edit)
- `lib/api-zod/src/generated/` — generated Zod schemas used by server routes (do not edit)

## Architecture decisions

- **OpenAPI-first**: all contracts defined in `lib/api-spec/openapi.yaml`, both Zod schemas (server) and React Query hooks (frontend) are generated from it. Never hand-write types that codegen produces.
- **Graceful AI degradation**: if Gemini fails (network error, invalid response), the report is still saved with a placeholder analysis so citizen submissions never fail.
- **Officer auth via env var**: `OFFICER_API_KEY` gates the status-update endpoint. If the env var is unset, all requests pass through (development/demo mode).
- **Drizzle dynamic queries**: combined status+severity filters use `and()` to compose predicates — never chain `.where()` twice on a dynamic builder.

## Product

- **Citizen Reporter tab**: drag-and-drop photo upload → AI severity verdict (low/medium/high/critical) + analysis summary displayed after submission
- **Officer Dashboard tab**: filterable table of all reports with photo thumbnails, severity/status badges, stats bar, and inline status management

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any change to `lib/api-spec/openapi.yaml`, always re-run codegen before using updated types
- Do not run `pnpm dev` at workspace root — start individual workflows via Replit
- Verify with `pnpm --filter @workspace/api-server run typecheck`, not `build` (build needs workflow-provided env)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
