# HVAC Quote Fairness Checker

One-page web app that analyzes HVAC quotes using OpenAI and applies ZIP-aware pricing adjustments.

## Requirements

- Node.js 18+

## Setup

1. Copy env file and add your key:

```bash
cp .env.example .env
```

2. Install deps and run dev server:

```bash
npm install
npm run dev
```

The client runs on http://localhost:5173 and proxies API calls to the server on http://localhost:5178.

## Production

```bash
npm run build
npm start
```

The Express server serves the built client from `client/dist`.
