// Cloudflare Pages Function — POST /api/notify
// Central lead notifier. Every site's /api/lead posts here (server-to-server)
// after writing to D1. Only the project that has the secrets set (dexits-com)
// actually sends; the rest no-op. Set on the dexits-com Pages project:
//   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, RESEND_API_KEY
// Optional: LEAD_TO (default info@emv.io), LEAD_FROM (default leads@emv.io)
export async function onRequestPost({ request, env }) {
  let b = {};
  try { b = await request.json(); } catch (e) { return new Response('bad', { status: 400 }); }
  const site = b.site || 'unknown';
  const source = b.slug ? `/${b.blogPath || 'blog'}/${b.slug}` : (b.path || 'direct');
  const extra = b.extra && Object.keys(b.extra).length
    ? '\n' + Object.entries(b.extra).map(([k, v]) => `• ${k}: ${v}`).join('\n') : '';
  const text =
    `🎯 New lead — ${site}\n` +
    `Email: ${b.email || ''}\n` +
    `Category: ${b.category || ''}  ·  Form: ${b.form_type || ''}\n` +
    `Source: ${source}` + extra;

  const jobs = [];
  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
    jobs.push(fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text })
    }));
  }
  if (env.RESEND_API_KEY) {
    jobs.push(fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: env.LEAD_FROM || 'Dexits Leads <leads@emv.io>',
        to: [env.LEAD_TO || 'info@emv.io'],
        subject: `New lead: ${b.email || ''} — ${site}`,
        text
      })
    }));
  }
  await Promise.allSettled(jobs);
  return new Response(JSON.stringify({ ok: true, sent: jobs.length }), { headers: { 'content-type': 'application/json' } });
}
