import crypto from "crypto";
import path from "path";
import express from "express";
import cors from "cors";
import multer from "multer";
import rateLimit from "express-rate-limit";
import OpenAI from "openai";
import { toFile } from "openai/uploads";
import { z } from "zod";
import dotenv from "dotenv";
import { getGeoMultipliers } from "./geo";
import { V1_SYSTEM_PROMPT, V1_USER_INSTRUCTIONS } from "../ai/prompts";

dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });

const app = express();

const PORT = Number(process.env.PORT || 5178);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const ANALYSIS_METHOD = process.env.ANALYSIS_METHOD || "v1";

if (!OPENAI_API_KEY) {
  console.warn("Missing OPENAI_API_KEY. Set it in .env before running the server.");
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }
});

const allowedTypes = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg"
]);

app.use(cors());
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.post("/api/analyze", upload.single("file"), async (req, res) => {
  const requestId = crypto.randomUUID();

  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "File is required" });
    }

    if (!allowedTypes.has(file.mimetype)) {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    if (ANALYSIS_METHOD !== "v1") {
      console.warn(`Unknown ANALYSIS_METHOD: ${ANALYSIS_METHOD}. Using v1.`);
    }

    const zip = String(req.body.zip || "").trim();
    const zipValid = /^\d{5}$/.test(zip);
    const geo = zipValid ? getGeoMultipliers(zip) : undefined;

    const result = await analyzeV1({
      requestId,
      file,
      zip: zipValid ? zip : undefined,
      geo
    });

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

const staticDir = path.resolve(__dirname, "..", "..", "client", "dist");
app.use(express.static(staticDir));
app.get("*", (_req, res) => {
  res.sendFile("index.html", { root: staticDir });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

const resultSchema = z.object({
  id: z.string().optional(),
  zip: z.string().optional(),
  cbsa: z.string().optional(),
  score: z.number().optional(),
  label: z.enum(["UNDER", "FAIR", "HIGH", "EXTREME"]).optional(),
  exp: z.object({ lo: z.number(), hi: z.number() }).optional(),
  total: z.number().optional().nullable(),
  equip: z
    .array(
      z.object({
        role: z.string(),
        brand: z.string().optional(),
        model: z.string().optional(),
        tons: z.number().optional(),
        notes: z.string().optional()
      })
    )
    .optional(),
  items: z
    .array(
      z.object({
        label: z.string(),
        amt: z.number().optional(),
        qty: z.number().optional()
      })
    )
    .optional(),
  drivers: z.array(z.string()).optional(),
  flags: z.array(z.string()).optional(),
  asks: z.array(z.string()).optional(),
  conf: z.number().optional()
});

type AnalyzeParams = {
  requestId: string;
  file: Express.Multer.File;
  zip?: string;
  geo?: ReturnType<typeof getGeoMultipliers>;
};

async function analyzeV1(params: AnalyzeParams) {
  const openai = getOpenAI();

  const uploadFile = await toFile(params.file.buffer, params.file.originalname, {
    type: params.file.mimetype
  });

  const fileUpload = await withTimeout(
    openai.files.create({ file: uploadFile, purpose: "assistants" }),
    45_000
  );

  const geoText = params.geo
    ? `ZIP: ${params.zip}\nCBSA: ${params.geo.cbsa ?? ""}\nMetro: ${params.geo.metro_name ?? ""}\nMultipliers: labor=${params.geo.multipliers.labor}, overhead=${params.geo.multipliers.overhead}, taxperm=${params.geo.multipliers.taxperm}\n`
    : `ZIP: ${params.zip ?? ""}\n`;

  const userPrompt = `${geoText}\n${V1_USER_INSTRUCTIONS}`;

  const input = [
    {
      role: "system",
      content: [{ type: "input_text", text: V1_SYSTEM_PROMPT }]
    },
    {
      role: "user",
      content: [
        { type: "input_text", text: userPrompt },
        { type: "input_file", file_id: fileUpload.id }
      ]
    }
  ];

  const response = await withTimeout(
    openai.responses.create({
      model: OPENAI_MODEL,
      input,
      temperature: 0.1
    }),
    60_000
  );
  logUsage(response);

  let parsed = parseResponse(response);
  if (!parsed) {
    const retry = await withTimeout(
      openai.responses.create({
        model: OPENAI_MODEL,
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: V1_SYSTEM_PROMPT + " Return valid JSON only."
              }
            ]
          },
          {
            role: "user",
            content: [
              { type: "input_text", text: userPrompt },
              { type: "input_file", file_id: fileUpload.id }
            ]
          }
        ],
        temperature: 0.1
      }),
      60_000
    );
    logUsage(retry);
    parsed = parseResponse(retry);
  }

  if (!parsed) {
    throw new Error("Model returned invalid JSON");
  }

  const validated = resultSchema.parse(parsed);

  if (!validated.score || !validated.label || !validated.exp) {
    throw new Error("Model response missing required fields");
  }

  return normalizeResult(validated, params.requestId, params.zip, params.geo?.cbsa);
}

function normalizeResult(
  result: z.infer<typeof resultSchema>,
  requestId: string,
  zip?: string,
  cbsa?: string
) {
  return {
    id: result.id ?? requestId,
    zip: result.zip ?? zip,
    cbsa: result.cbsa ?? cbsa,
    score: Math.round(result.score ?? 0),
    label: result.label ?? "FAIR",
    exp: result.exp ?? { lo: 0, hi: 0 },
    total: result.total ?? undefined,
    equip: result.equip ?? [],
    items: result.items ?? [],
    drivers: result.drivers ?? [],
    flags: result.flags ?? [],
    asks: result.asks ?? [],
    conf: clamp(result.conf ?? 0.5, 0, 1)
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getOpenAI() {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return new OpenAI({ apiKey: OPENAI_API_KEY });
}

function parseResponse(response: unknown) {
  try {
    const text = extractText(response);
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}

function extractText(response: any): string | null {
  if (response?.output_text) {
    return response.output_text;
  }

  const outputs = response?.output || [];
  for (const item of outputs) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) {
        return content.text;
      }
    }
  }
  return null;
}

function logUsage(response: any) {
  if (!response?.usage) return;
  const usage = response.usage;
  const summary = {
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    total_tokens: usage.total_tokens
  };
  console.log("OpenAI usage", summary);
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        controller.signal.addEventListener("abort", () =>
          reject(new Error("Request timed out"))
        );
      })
    ]);
  } finally {
    clearTimeout(timeout);
  }
}
