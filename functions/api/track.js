// Cloudflare Pages Function — POST /api/track
// Records a pageview or cta_click event into the D1 "dexits-analytics" DB.
// Bound as env.DB (see wrangler.toml generated per site).
const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST,OPTIONS',
  'access-control-allow-headers': 'content-type'
};
export async function onRequestOptions() {
  return new Response(null, { headers: cors });
}
export async function onRequestPost({ request, env }) {
  try {
    const b = await request.json();
    if (env.DB) {
      await env.DB.prepare(
        'INSERT INTO events (ts, site, category, slug, type, ref, path) VALUES (?,?,?,?,?,?,?)'
      ).bind(
        Date.now(),
        (b.site || '').slice(0, 80),
        (b.category || '').slice(0, 20),
        (b.slug || '').slice(0, 120),
        (b.type || 'pageview').slice(0, 20),
        (request.headers.get('referer') || '').slice(0, 300),
        (b.path || '').slice(0, 200)
      ).run();
    }
  } catch (e) { /* never block the page on analytics */ }
  return new Response(null, { status: 204, headers: cors });
}
