import Anthropic from '@anthropic-ai/sdk';
import { loadRawQuotes, writeCompiledArticle, writeIndex, writeConfidenceMap } from './knowledgeBase.js';

const client = new Anthropic();

export async function recompileKnowledgeBase(scope?: { climateRegion?: string; state?: string }): Promise<{ articlesWritten: number }> {
  const allQuotes = loadRawQuotes(scope ? { climateRegion: scope.climateRegion, state: scope.state } : undefined);
  let articlesWritten = 0;

  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('No ANTHROPIC_API_KEY — skipping LLM recompilation');
    return { articlesWritten: 0 };
  }

  const byRegion = new Map<string, typeof allQuotes>();
  for (const q of allQuotes) {
    const key = q.climateRegion;
    if (!byRegion.has(key)) byRegion.set(key, []);
    byRegion.get(key)!.push(q);
  }

  for (const [region, quotes] of byRegion) {
    const article = await generateArticle(`Regional Pricing: ${region}`, quotes, `Analyze HVAC pricing patterns for the ${region} climate region.`);
    writeCompiledArticle(`regions/${region}/overview.md`, article);
    articlesWritten++;

    const byState = new Map<string, typeof allQuotes>();
    for (const q of quotes) {
      if (!byState.has(q.state)) byState.set(q.state, []);
      byState.get(q.state)!.push(q);
    }
    for (const [state, stateQuotes] of byState) {
      if (stateQuotes.length >= 3) {
        const stateArticle = await generateArticle(`State Pricing: ${state}`, stateQuotes, `Analyze HVAC pricing patterns for ${state}.`);
        writeCompiledArticle(`regions/${region}/${state.toLowerCase()}/overview.md`, stateArticle);
        articlesWritten++;
      }
    }
  }

  const bySystem = new Map<string, typeof allQuotes>();
  for (const q of allQuotes) {
    if (!bySystem.has(q.systemType)) bySystem.set(q.systemType, []);
    bySystem.get(q.systemType)!.push(q);
  }
  for (const [systemType, quotes] of bySystem) {
    const article = await generateArticle(`System Type: ${systemType}`, quotes, `Analyze pricing for ${systemType} HVAC systems.`);
    writeCompiledArticle(`system-types/${systemType.replace(/_/g, '-')}.md`, article);
    articlesWritten++;
  }

  const componentData = new Map<string, { amounts: number[]; quotes: number }>();
  for (const q of allQuotes) {
    for (const item of q.lineItems) {
      if (!componentData.has(item.category)) componentData.set(item.category, { amounts: [], quotes: 0 });
      const data = componentData.get(item.category)!;
      data.amounts.push(item.amount);
      data.quotes++;
    }
  }
  for (const [category, data] of componentData) {
    if (data.amounts.length >= 3) {
      const sorted = data.amounts.sort((a, b) => a - b);
      const content = `---\nlastCompiled: "${new Date().toISOString()}"\nsampleSize: ${data.quotes}\n---\n\n# Component Pricing: ${category}\n\n## Summary\nBased on ${data.quotes} quotes with ${category} line items.\nRange: $${sorted[0].toLocaleString()} - $${sorted[sorted.length - 1].toLocaleString()}\nMedian: $${sorted[Math.floor(sorted.length / 2)].toLocaleString()}\n\n## Data Points\n${sorted.map((a) => `- $${a.toLocaleString()}`).join('\n')}\n`;
      writeCompiledArticle(`components/${category}.md`, content);
      articlesWritten++;
    }
  }

  const indexContent = `---\nlastCompiled: "${new Date().toISOString()}"\ntotalQuotes: ${allQuotes.length}\n---\n\n# HVAC Price Agent Knowledge Base Index\n\nTotal quotes: ${allQuotes.length}\nRegions covered: ${[...byRegion.keys()].join(', ')}\nSystem types: ${[...bySystem.keys()].join(', ')}\nDate range: ${allQuotes.length > 0 ? allQuotes.sort((a, b) => a.timestamp.localeCompare(b.timestamp))[0].timestamp.slice(0, 10) : 'N/A'} to ${new Date().toISOString().slice(0, 10)}\n`;
  writeIndex(indexContent);

  const confidenceLines: string[] = [];
  for (const [region, quotes] of byRegion) {
    const confidence = quotes.length >= 20 ? 'high' : quotes.length >= 5 ? 'medium' : 'low';
    confidenceLines.push(`- ${region}: ${confidence} (${quotes.length} quotes)`);
  }
  writeConfidenceMap(`# Data Confidence Map\n\n${confidenceLines.join('\n')}\n`);

  return { articlesWritten };
}

async function generateArticle(
  title: string,
  quotes: Array<{ quotedTotal: number; qualityTier: string; sizeBand: string; systemType: string; state: string; metro: string | null; source: string }>,
  instruction: string
): Promise<string> {
  const totals = quotes.map((q) => q.quotedTotal).sort((a, b) => a - b);
  const summary = `${quotes.length} quotes, range $${totals[0]?.toLocaleString()} - $${totals[totals.length - 1]?.toLocaleString()}, median $${totals[Math.floor(totals.length / 2)]?.toLocaleString()}`;
  const quoteDetails = quotes.slice(0, 30).map((q) =>
    `$${q.quotedTotal.toLocaleString()} (${q.qualityTier} ${q.sizeBand} ${q.systemType}, ${q.metro ?? q.state}, src:${q.source})`
  ).join('\n');

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      temperature: 0,
      messages: [{
        role: 'user',
        content: `${instruction}\n\nData: ${summary}\n\nIndividual quotes:\n${quoteDetails}\n\nWrite a concise markdown article with frontmatter (lastCompiled, sampleSize, dataRange), a Summary section with key price ranges, a Detailed Breakdown section with patterns, and a Confidence Notes section. Focus on actionable pricing insights.`,
      }],
    });
    const content = response.content[0];
    if (content.type === 'text') return content.text;
  } catch (err) {
    console.warn(`Article generation failed for ${title}:`, err);
  }

  return `---\nlastCompiled: "${new Date().toISOString()}"\nsampleSize: ${quotes.length}\n---\n\n# ${title}\n\n## Summary\n${summary}\n\n## Confidence Notes\nThis article was generated from limited data. Accuracy improves with more quotes.\n`;
}
