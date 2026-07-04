import { pgTable, text, serial, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reportsTable = pgTable("reports", {
  id: serial("id").primaryKey(),
  imageData: text("image_data").notNull(),
  description: text("description"),
  location: text("location"),
  severity: text("severity").notNull().default("medium"),
  aiSummary: text("ai_summary").notNull().default(""),
  aiConfidence: doublePrecision("ai_confidence").notNull().default(0),
  status: text("status").notNull().default("pending"),
  officerNotes: text("officer_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertReportSchema = createInsertSchema(reportsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reportsTable.$inferSelect;
