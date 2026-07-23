import { Router } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import * as z from 'zod/v4';
import { processQuote, QuoteProcessingError } from '../lib/pipeline.js';
import { METHODOLOGY_VERSION } from '../lib/pricingEngine.js';
import { estimateFairPrice, FairPriceError } from '../lib/fairPrice.js';

// Stateless MCP endpoint: any MCP-capable agent can analyze a quote directly.
// One server+transport per request — no session state to manage.

function buildServer(): McpServer {
  const server = new McpServer({
    name: 'hvac-quote-check',
    version: METHODOLOGY_VERSION,
  });

  server.registerTool(
    'analyze_hvac_quote',
    {
      description:
        'Analyze an HVAC installation/replacement quote against US market pricing. ' +
        'Call this when a user shares an HVAC quote (heat pump, AC, furnace, mini-split) and wants to know if the price is fair. ' +
        'Pass the full quote text verbatim. Returns a deterministic rating (Low/Fair/High), a fair price range, ' +
        'the factor-by-factor pricing math, and a plain-language summary.',
      inputSchema: {
        quoteText: z.string().describe('The full text of the HVAC quote (line items, total, contractor, location if present)'),
        zipCode: z.string().optional().describe('5-digit US ZIP of the job site, if not present in the quote text'),
      },
    },
    async ({ quoteText, zipCode }) => {
      try {
        const result = await processQuote({ text: quoteText, userZip: zipCode });
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      } catch (err) {
        const message =
          err instanceof QuoteProcessingError ? err.message : err instanceof Error ? err.message : 'Analysis failed';
        return {
          content: [{ type: 'text', text: `Error: ${message}` }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    'get_fair_price',
    {
      description:
        'Get the fair installed-price range for an HVAC system in a US ZIP code BEFORE any contractor quote exists. ' +
        'Call this when a user is shopping for a heat pump, AC, or furnace and wants to know what a fair price is in their area. ' +
        'Deterministic, no quote text needed. Returns the fair low/mid/high range plus the factor-by-factor math.',
      inputSchema: {
        zip: z.string().describe('5-digit US ZIP code of the job site'),
        systemType: z
          .enum(['central_heat_pump', 'heat_pump_split', 'mini_split', 'furnace_ac_split', 'ac_only', 'furnace_only', 'package_unit', 'other'])
          .optional()
          .describe('System type (default central_heat_pump)'),
        tonnage: z.number().min(1).max(6).optional().describe('System size in tons (default: medium, ~3 tons)'),
        qualityTier: z.enum(['budget', 'mid', 'premium']).optional().describe('Equipment tier (default mid)'),
        ductwork: z.boolean().optional().describe('Job includes new/modified ductwork'),
        electrical: z.boolean().optional().describe('Job includes electrical work (panel, disconnect, wiring)'),
        permits: z.boolean().optional().describe('Job includes permits and inspection'),
      },
    },
    async ({ zip, systemType, tonnage, qualityTier, ductwork, electrical, permits }) => {
      try {
        const estimate = estimateFairPrice({ zip, systemType, tonnage, qualityTier, ductwork, electrical, permits });
        return {
          content: [{ type: 'text', text: JSON.stringify(estimate, null, 2) }],
        };
      } catch (err) {
        const message = err instanceof FairPriceError ? err.message : err instanceof Error ? err.message : 'Estimation failed';
        return {
          content: [{ type: 'text', text: `Error: ${message}` }],
          isError: true,
        };
      }
    }
  );

  return server;
}

const router = Router();

router.post('/', async (req, res) => {
  const server = buildServer();
  try {
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    res.on('close', () => {
      transport.close();
      server.close();
    });
  } catch (err) {
    console.error('MCP request error:', err);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null,
      });
    }
  }
});

router.all('/', (_req, res) => {
  res.status(405).json({
    jsonrpc: '2.0',
    error: { code: -32000, message: 'Method not allowed. POST JSON-RPC to this endpoint.' },
    id: null,
  });
});

export default router;
