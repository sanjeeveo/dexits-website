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
  if (!env.DB) return json({ ok: false, error: 'Enquiry storage is unavailable. Please email info@emv.io.' }, 503);
  let b = {};
  try {
    const body = await request.text();
    if (body.length > 8192) return json({ ok: false, error: 'Enquiry is too long.' }, 413);
    b = JSON.parse(body);
  } catch (e) { return json({ ok: false, error: 'bad request' }, 400); }
  if (!b || typeof b !== 'object' || Array.isArray(b)) return json({ ok: false, error: 'bad request' }, 400);
  const field = (value, length) => typeof value === 'string' ? value.trim().slice(0, length) : '';
  const email = typeof b.email === 'string' ? b.email.trim() : '';
  if (!email || email.length > 160 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ ok: false, error: 'valid email required' }, 400);
  const extra = b.extra && typeof b.extra === 'object' && !Array.isArray(b.extra) ? b.extra : {};
  if (JSON.stringify(extra).length > 1000) return json({ ok: false, error: 'Enquiry details are too long.' }, 400);
  try {
      const ts = Date.now();
      await env.DB.batch([env.DB.prepare(
        'INSERT INTO leads (ts, site, category, slug, form_type, email, name, extra) VALUES (?,?,?,?,?,?,?,?)'
      ).bind(ts, field(b.site, 80), field(b.category, 20), field(b.slug, 120),
        field(b.form_type, 40), email, field(b.name, 120), JSON.stringify(extra)),
      env.DB.prepare(
        'INSERT INTO events (ts, site, category, slug, type, ref, path) VALUES (?,?,?,?,?,?,?)'
      ).bind(ts, field(b.site, 80), field(b.category, 20), field(b.slug, 120),
        'form_submit', '', field(b.path, 200))]);
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
