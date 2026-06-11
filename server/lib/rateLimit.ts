import { rateLimit } from 'express-rate-limit';

const windowMin = Number(process.env.RATE_LIMIT_WINDOW_MIN ?? 15);
const windowMs = windowMin * 60 * 1000;

// Each analysis runs two claude-opus-4-8 calls (vision extraction + narrative),
// so the open, agent-advertised endpoints need a per-IP cap to keep an
// automated loop from draining the Anthropic budget. Tune via env in prod.
export const analyzeLimiter = rateLimit({
  windowMs,
  limit: Number(process.env.RATE_LIMIT_MAX ?? 20),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: `Too many quote analyses from this network. Please try again in about ${windowMin} minutes.` },
});

// The MCP handshake is several POSTs per analysis (initialize + tools/list +
// tools/call), so it gets a higher ceiling than the direct endpoints.
export const mcpLimiter = rateLimit({
  windowMs,
  limit: Number(process.env.RATE_LIMIT_MCP_MAX ?? 60),
  standardHeaders: true,
  legacyHeaders: false,
});
