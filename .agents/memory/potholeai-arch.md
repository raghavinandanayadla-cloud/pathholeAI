---
name: PotholeAI architecture
description: Key decisions for the PotholeAI civic tech app — AI pipeline, auth, schema, and codegen patterns.
---

## Gemini Vision integration
- Package: `@google/generative-ai` in `artifacts/api-server/dependencies`
- Model: `gemini-1.5-flash`
- API key: `GEMINI_API_KEY` secret (Replit managed)
- Located at: `artifacts/api-server/src/lib/gemini.ts`
- Exports `GeminiAnalysis` type — import this type in routes to avoid the `severity: "medium"` narrowing bug

**Why:** POST /reports must always succeed even if Gemini is down. The route wraps the analyzeImage call in try/catch and saves a placeholder analysis on failure.

## Officer auth
- `OFFICER_API_KEY` secret gates `PATCH /reports/:id/status`
- If the env var is unset (development/demo), all requests pass through
- Client must send `X-Officer-Token: <value>` header

## Drizzle filter composition
- Use `and(...conditions.filter(Boolean))` when composing optional predicates
- Chaining `.where()` twice on a `$dynamic()` builder silently overrides — use `and()` from drizzle-orm

## OpenAPI body naming rule
- Never name a component `<OperationIdPascal>Body` — Orval auto-generates that Zod name and re-exporting both causes TS2308 collision
- Always use entity-shaped names: `ReportInput`, `ReportStatusUpdate`

## Seeded data
- 3 sample reports inserted at build time (low/medium/high severity, pending/reviewed/resolved status)
