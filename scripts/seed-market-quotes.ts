import { config } from '../server/lib/config.js';
import { getSupabaseAdmin } from '../server/lib/supabase.js';
import { devMarketQuotes } from '../server/data/devMarketQuotes.js';

if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required to seed market quotes.');
}

const run = async (): Promise<void> => {
  const supabaseAdmin = getSupabaseAdmin() as any;
  const { error } = await supabaseAdmin.from('market_quotes').upsert(devMarketQuotes, {
    onConflict: 'id'
  });

  if (error) {
    throw error;
  }

  console.log(`Seeded ${devMarketQuotes.length} market quotes.`);
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
