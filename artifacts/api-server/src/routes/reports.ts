import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { eq, desc, sql, and } from "drizzle-orm";
import { db, reportsTable } from "@workspace/db";
import {
  CreateReportBody,
  CreateReportResponse,
  ListReportsQueryParams,
  ListReportsResponse,
  GetReportParams,
  GetReportResponse,
  UpdateReportStatusParams,
  UpdateReportStatusBody,
  UpdateReportStatusResponse,
  GetStatsResponse,
} from "@workspace/api-zod";
import { analyzeImage, type GeminiAnalysis } from "../lib/gemini";

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// Officer auth middleware — checks X-Officer-Token header against env var.
// In development (no env var set) all officer requests are allowed through.
// ---------------------------------------------------------------------------
function requireOfficer(_req: Request, res: Response, next: NextFunction): void {
  const token = process.env["OFFICER_API_KEY"];
  if (!token) {
    next();
    return;
  }
  const provided = _req.headers["x-officer-token"];
  if (provided !== token) {
    res.status(403).json({ error: "Forbidden: invalid officer token" });
    return;
  }
  next();
}

// ---------------------------------------------------------------------------
// POST /reports — citizen submits a pothole report
// ---------------------------------------------------------------------------
router.post("/reports", async (req, res): Promise<void> => {
  const parsed = CreateReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { imageData, description, location } = parsed.data;

  req.log.info("Running Gemini analysis on submitted image");

  // Catch Gemini failures gracefully so submissions always succeed
  let analysis: GeminiAnalysis = {
    severity: "medium",
    aiSummary: "Analysis pending — could not reach AI service at this time.",
    aiConfidence: 0,
  };
  try {
    analysis = await analyzeImage(imageData);
    req.log.info({ severity: analysis.severity, confidence: analysis.aiConfidence }, "Analysis complete");
  } catch (err) {
    req.log.warn({ err }, "Gemini analysis failed — saving report with placeholder analysis");
  }

  const [report] = await db
    .insert(reportsTable)
    .values({
      imageData,
      description: description ?? null,
      location: location ?? null,
      severity: analysis.severity,
      aiSummary: analysis.aiSummary,
      aiConfidence: analysis.aiConfidence,
      status: "pending",
    })
    .returning();

  res.status(201).json(CreateReportResponse.parse(report));
});

// ---------------------------------------------------------------------------
// GET /reports — list with optional filter by status and/or severity
// ---------------------------------------------------------------------------
router.get("/reports", async (req, res): Promise<void> => {
  const queryParsed = ListReportsQueryParams.safeParse(req.query);
  if (!queryParsed.success) {
    res.status(400).json({ error: queryParsed.error.message });
    return;
  }

  const { status, severity } = queryParsed.data;

  // Build combined predicate so both filters apply when both are provided
  const conditions = [
    status ? eq(reportsTable.status, status) : undefined,
    severity ? eq(reportsTable.severity, severity) : undefined,
  ].filter((c): c is NonNullable<typeof c> => c !== undefined);

  const reports = await db
    .select()
    .from(reportsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(reportsTable.createdAt));

  res.json(ListReportsResponse.parse(reports));
});

// ---------------------------------------------------------------------------
// GET /reports/:id — get a single report
// ---------------------------------------------------------------------------
router.get("/reports/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetReportParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [report] = await db
    .select()
    .from(reportsTable)
    .where(eq(reportsTable.id, params.data.id));

  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }

  res.json(GetReportResponse.parse(report));
});

// ---------------------------------------------------------------------------
// PATCH /reports/:id/status — officer updates status (protected)
// ---------------------------------------------------------------------------
router.patch("/reports/:id/status", requireOfficer, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateReportStatusParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateReportStatusBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {
    status: body.data.status,
    updatedAt: new Date(),
  };
  if (body.data.officerNotes != null) {
    updateData.officerNotes = body.data.officerNotes;
  }

  const [report] = await db
    .update(reportsTable)
    .set(updateData)
    .where(eq(reportsTable.id, params.data.id))
    .returning();

  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }

  res.json(UpdateReportStatusResponse.parse(report));
});

// ---------------------------------------------------------------------------
// GET /stats — aggregate dashboard statistics
// ---------------------------------------------------------------------------
router.get("/stats", async (_req, res): Promise<void> => {
  const [totals] = await db
    .select({
      total: sql<number>`count(*)::int`,
      pending: sql<number>`count(*) filter (where status = 'pending')::int`,
      reviewed: sql<number>`count(*) filter (where status = 'reviewed')::int`,
      resolved: sql<number>`count(*) filter (where status = 'resolved')::int`,
      low: sql<number>`count(*) filter (where severity = 'low')::int`,
      medium: sql<number>`count(*) filter (where severity = 'medium')::int`,
      high: sql<number>`count(*) filter (where severity = 'high')::int`,
      critical: sql<number>`count(*) filter (where severity = 'critical')::int`,
      recentCount: sql<number>`count(*) filter (where created_at >= now() - interval '7 days')::int`,
    })
    .from(reportsTable);

  const stats = {
    total: totals?.total ?? 0,
    byStatus: {
      pending: totals?.pending ?? 0,
      reviewed: totals?.reviewed ?? 0,
      resolved: totals?.resolved ?? 0,
    },
    bySeverity: {
      low: totals?.low ?? 0,
      medium: totals?.medium ?? 0,
      high: totals?.high ?? 0,
      critical: totals?.critical ?? 0,
    },
    recentCount: totals?.recentCount ?? 0,
  };

  res.json(GetStatsResponse.parse(stats));
});

export default router;
