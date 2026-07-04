import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "./logger";

const SEVERITY_LEVELS = ["low", "medium", "high", "critical"] as const;
type Severity = (typeof SEVERITY_LEVELS)[number];

export interface GeminiAnalysis {
  severity: Severity;
  aiSummary: string;
  aiConfidence: number;
}

const ANALYSIS_PROMPT = `You are an expert road maintenance AI analyzing a pothole photo submitted by a citizen.

Analyze this image and respond with ONLY valid JSON in exactly this format:
{
  "severity": "<low|medium|high|critical>",
  "summary": "<2-3 sentence description of the pothole, its size, road damage, and safety risk>",
  "confidence": <number between 0 and 1>
}

Severity guide:
- low: small crack or surface defect, no immediate hazard
- medium: visible pothole under 6 inches, potential tire damage
- high: large pothole over 6 inches or multiple potholes, real vehicle damage risk
- critical: severe structural road damage, immediate safety hazard

If the image does not show a pothole or road surface, set severity to "low", confidence to 0.3, and note that in the summary.

Respond ONLY with the JSON object, no other text.`;

export async function analyzeImage(imageBase64: string): Promise<GeminiAnalysis> {
  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) {
    logger.warn("GEMINI_API_KEY not set — returning placeholder analysis");
    return {
      severity: "medium",
      aiSummary: "AI analysis unavailable: GEMINI_API_KEY not configured. Please set the API key to enable Gemini Vision analysis.",
      aiConfidence: 0,
    };
  }

  // Strip data URI prefix if present
  const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

  // Detect MIME type from original prefix, default to jpeg
  const mimeMatch = imageBase64.match(/^data:(image\/[a-z]+);base64,/);
  const mimeType = (mimeMatch?.[1] ?? "image/jpeg") as "image/jpeg" | "image/png" | "image/webp" | "image/gif";

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent([
    ANALYSIS_PROMPT,
    {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    },
  ]);

  const text = result.response.text().trim();

  // Parse JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    logger.error({ text }, "Gemini returned non-JSON response");
    throw new Error("Gemini returned an unexpected response format");
  }

  const parsed = JSON.parse(jsonMatch[0]) as {
    severity: string;
    summary: string;
    confidence: number;
  };

  const severity: Severity = SEVERITY_LEVELS.includes(parsed.severity as Severity)
    ? (parsed.severity as Severity)
    : "medium";

  return {
    severity,
    aiSummary: parsed.summary ?? "Analysis complete.",
    aiConfidence: Math.max(0, Math.min(1, parsed.confidence ?? 0.8)),
  };
}
