// Cloudflare Pages Function — POST /api/lead
// Records a lead (email + details) into D1 "dexits-analytics" and logs a
// form_submit event. Bound as env.DB.
const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST,OPTIONS',
  'access-control-allow-headers': 'content-type'
};
const json = (o, s = 200) =>
  new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json', ...cors } });

export async function onRequestOptions() {
  return new Response(null, { headers: cors });
}
export async function onRequestPost({ request, env, waitUntil }) {
  let b = {};
  try { b = await request.json(); } catch (e) { return json({ ok: false, error: 'bad request' }, 400); }
  const email = (b.email || '').trim();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ ok: false, error: 'valid email required' }, 400);
  try {
    if (env.DB) {
      const ts = Date.now();
      await env.DB.prepare(
        'INSERT INTO leads (ts, site, category, slug, form_type, email, name, extra) VALUES (?,?,?,?,?,?,?,?)'
      ).bind(ts, (b.site || '').slice(0, 80), (b.category || '').slice(0, 20), (b.slug || '').slice(0, 120),
        (b.form_type || '').slice(0, 40), email.slice(0, 160), (b.name || '').slice(0, 120),
        JSON.stringify(b.extra || {}).slice(0, 1000)).run();
      await env.DB.prepare(
        'INSERT INTO events (ts, site, category, slug, type, ref, path) VALUES (?,?,?,?,?,?,?)'
      ).bind(ts, (b.site || '').slice(0, 80), (b.category || '').slice(0, 20), (b.slug || '').slice(0, 120),
        'form_submit', '', (b.path || '').slice(0, 200)).run();
    }
  } catch (e) { return json({ ok: false, error: 'server error' }, 500); }
  // Fire-and-forget lead notification (Telegram + email) via the central notifier.
  try {
    const n = fetch('https://dexits.com/api/notify', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ site: b.site, category: b.category, slug: b.slug, form_type: b.form_type, email, name: b.name, extra: b.extra, path: b.path })
    }).catch(() => {});
    if (typeof waitUntil === 'function') waitUntil(n);
  } catch (e) { /* never block lead capture on notify */ }
  return json({ ok: true });
}
