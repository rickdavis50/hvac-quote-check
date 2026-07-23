import { Router, type Request } from 'express';
import { estimateFairPrice } from '../lib/fairPrice.js';
import {
  findMetro,
  findSystem,
  renderCostPage,
  renderCostIndex,
  buildSitemap,
  robotsTxt,
} from '../lib/seoPages.js';

// Server-rendered programmatic SEO pages (city × system cost) + sitemap/robots.
// Registered before the SPA static fallback so these paths win.

const router = Router();

function originFrom(req: Request): string {
  return process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
}

router.get('/cost', (req, res) => {
  res.type('html').set('Cache-Control', 'public, max-age=3600').send(renderCostIndex(originFrom(req)));
});

router.get('/cost/:city/:system', (req, res) => {
  const metro = findMetro(req.params.city);
  const system = findSystem(req.params.system);
  if (!metro || !system) {
    res.status(404).type('html').send('<!doctype html><meta charset="utf-8"><title>Not found</title><p style="font-family:monospace;padding:2rem">No cost page for that city and system. <a href="/cost">See all cities</a>.</p>');
    return;
  }
  const estimate = estimateFairPrice({
    zip: metro.zip,
    systemType: system.systemType,
    tonnage: 3,
    qualityTier: 'mid',
    electrical: true,
    permits: true,
    ductwork: false,
  });
  res
    .type('html')
    .set('Cache-Control', 'public, max-age=3600')
    .send(renderCostPage({ metro, system, estimate, origin: originFrom(req) }));
});

router.get('/sitemap.xml', (req, res) => {
  res.type('application/xml').set('Cache-Control', 'public, max-age=86400').send(buildSitemap(originFrom(req)));
});

router.get('/robots.txt', (req, res) => {
  res.type('text/plain').set('Cache-Control', 'public, max-age=86400').send(robotsTxt(originFrom(req)));
});

export default router;
