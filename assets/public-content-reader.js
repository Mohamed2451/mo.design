/**
 * Lightweight, read-only public Supabase REST reader for visitor pages.
 * No external SDK/CDN, no auth session, no private data or mutations.
 */
const TABLES = new Set(['projects', 'services', 'site_settings', 'learning_items']);
const SAFE_FIELD = /^[a-z][a-z0-9_]*$/;

export async function readPublicRows(table, {
  eq = {}, limit = 500, timeoutMs = 9000,
  fetchImpl = fetch, config
} = {}) {
  if (!TABLES.has(table)) throw new Error('Unsupported public table');
  const cfg = config ?? window.PORTFOLIO_CONFIG ?? {};
  if (!cfg.supabaseUrl || !cfg.supabasePublishableKey)
    throw new Error('Public content source is not configured');
  const endpoint = new URL(
    'rest/v1/' + table,
    String(cfg.supabaseUrl).replace(/\/+$/, '') + '/'
  );
  endpoint.searchParams.set('select', '*');
  endpoint.searchParams.set('limit', String(Math.min(Math.max(1, limit), 1000)));
  for (const [key, value] of Object.entries(eq)) {
    if (!SAFE_FIELD.test(key)) throw new Error('Unsupported filter field');
    endpoint.searchParams.set(key, 'eq.' + String(value));
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(endpoint, {
      headers: {
        apikey: cfg.supabasePublishableKey,
        Accept: 'application/json'
      },
      signal: controller.signal
    });
    if (!response.ok) throw new Error('Public data unavailable (HTTP ' + response.status + ')');
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error('Invalid public data');
    return rows;
  } finally {
    clearTimeout(timeout);
  }
}
