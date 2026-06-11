import { Router } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import * as z from 'zod/v4';
import { processQuote, QuoteProcessingError } from '../lib/pipeline.js';
import { METHODOLOGY_VERSION } from '../lib/pricingEngine.js';

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
