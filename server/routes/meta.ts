import { Router } from 'express';
import { METHODOLOGY_VERSION } from '../lib/pricingEngine.js';

const router = Router();

const analysisResultSchema = {
  type: 'object',
  description: 'Quote analysis. Numbers come from a deterministic pricing engine; prose from an LLM.',
  properties: {
    submissionId: { type: 'string' },
    rating: { type: 'string', enum: ['Low', 'Fair', 'High'] },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    quotedTotal: { type: 'number' },
    fairRange: {
      type: 'object',
      properties: { low: { type: 'number' }, mid: { type: 'number' }, high: { type: 'number' } },
    },
    savingsPotential: { type: 'number', description: 'Dollars above the fair midpoint when rating is High; else 0' },
    summary: { type: 'string' },
    extractedData: { type: 'object', description: 'Structured fields extracted from the quote document' },
    dataQuality: { type: 'object' },
    pricing: {
      type: 'object',
      description: 'Machine-readable math trace: every factor applied to reach the fair range',
      properties: {
        methodologyVersion: { type: 'string' },
        factors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string' },
              detail: { type: 'string' },
              multiplier: { type: 'number' },
              amount: { type: 'number' },
            },
          },
        },
        marketContext: { type: 'object' },
      },
    },
    generatedAt: { type: 'string', format: 'date-time' },
    paidInsights: { type: ['object', 'null'] },
  },
} as const;

const openapi = {
  openapi: '3.1.0',
  info: {
    title: 'Quote Check API',
    version: METHODOLOGY_VERSION,
    description:
      'Upload or paste an HVAC quote; get a deterministic fair-price assessment for the local US market. ' +
      'Built for humans and AI agents. AI agents can also use the MCP endpoint at POST /api/mcp ' +
      '(streamable HTTP, tools: analyze_hvac_quote, get_fair_price) or read /llms.txt.',
  },
  paths: {
    '/api/quotes/analyze': {
      post: {
        summary: 'Analyze an HVAC quote',
        description:
          'Send either multipart/form-data with a `file` (PDF, PNG, JPEG, WebP, or TXT, ≤50MB) and optional `zipCode`, ' +
          'or application/json with `text` (the quote text) and optional `zipCode`. ' +
          'With `Accept: text/event-stream` the response streams `stage` events followed by a final `result` event.',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['text'],
                properties: {
                  text: { type: 'string', description: 'Full quote text' },
                  zipCode: { type: 'string', description: '5-digit job-site ZIP if absent from the text' },
                },
              },
            },
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file'],
                properties: {
                  file: { type: 'string', format: 'binary' },
                  zipCode: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Analysis result', content: { 'application/json': { schema: analysisResultSchema } } },
          '400': { description: 'Bad input (no file/text, unsupported type)' },
          '422': { description: 'Quote unreadable or missing a total price' },
        },
      },
    },
    '/api/fair-price': {
      get: {
        summary: 'Fair installed-price range with NO quote. Shop before contractors name a number',
        description:
          'Deterministic fair low/mid/high for a system type in a ZIP code, with the factor-by-factor math. ' +
          'No LLM, no quote text. Only `zip` is required; everything else defaults sensibly ' +
          '(central_heat_pump, mid tier, medium size, equipment+labor scope).',
        parameters: [
          { name: 'zip', in: 'query', required: true, schema: { type: 'string' }, description: '5-digit US ZIP' },
          {
            name: 'systemType',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['central_heat_pump', 'heat_pump_split', 'mini_split', 'furnace_ac_split', 'ac_only', 'furnace_only', 'package_unit', 'other'],
            },
          },
          { name: 'tonnage', in: 'query', schema: { type: 'number', minimum: 1, maximum: 6 } },
          { name: 'qualityTier', in: 'query', schema: { type: 'string', enum: ['budget', 'mid', 'premium'] } },
          { name: 'ductwork', in: 'query', schema: { type: 'boolean' } },
          { name: 'electrical', in: 'query', schema: { type: 'boolean' } },
          { name: 'permits', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          '200': { description: 'Fair range, factor trace, market context, resolved inputs' },
          '400': { description: 'Invalid zip / systemType / tier / tonnage' },
        },
      },
    },
    '/api/quotes/{id}': {
      get: {
        summary: 'Fetch a stored analysis by submission id',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Stored analysis' }, '404': { description: 'Not found' } },
      },
    },
    '/api/quotes/{id}/recompute': {
      post: {
        summary: 'Apply user corrections and re-analyze',
        description: 'Body may include zipCode, systemType, tonnage, seer2, qualityTier, permitsIncluded, ductworkIncluded, electricalIncluded.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Updated analysis' }, '404': { description: 'Not found' } },
      },
    },
    '/api/quotes/{id}/unlock': {
      post: {
        summary: 'Create a $9 Stripe Checkout session for the full savings report',
        responses: { '200': { description: '{checkoutUrl} or {alreadyPaid:true}' } },
      },
    },
    '/api/quotes/{id}/insights': {
      get: {
        summary: 'Paid insights (component breakdown, negotiation points)',
        responses: { '200': { description: 'Insights' }, '402': { description: 'Payment required' } },
      },
    },
    '/api/health': { get: { summary: 'Service health and knowledge-base stats', responses: { '200': { description: 'OK' } } } },
  },
} as const;

router.get('/openapi.json', (_req, res) => {
  res.json(openapi);
});

export default router;
