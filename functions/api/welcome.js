// Cloudflare Pages Function: sends the CMH newsletter welcome email via Brevo.
// Needs these environment variables in Cloudflare Pages (Settings > Variables and Secrets):
//   BREVO_API_KEY  (secret)  your Brevo API key (SMTP & API > API Keys)
//   FROM_EMAIL     (text)    e.g. chris@chrismurrayhypnosis.com  (must be a verified sender in Brevo)
//   FROM_NAME      (text)    optional, defaults to Chris Murray
//   REPLY_TO       (text)    optional, the inbox that should receive replies
// Without BREVO_API_KEY the function does nothing, so the site is safe to deploy first.

const ALLOWED_ORIGINS = [
  'https://chrismurrayhypnosis.com',
  'https://www.chrismurrayhypnosis.com',
];

const SUBJECT = "You're in. Here's what to expect";

const TEXT = `Hi,

Thanks for signing up. I'm Chris, a cognitive hypnotherapist, and I'll keep this short.

I work with people who look successful from the outside and still feel like they're running on fumes on the inside. Good career, solid results, and a mind that won't switch off at 2am. I used to be one of them. I spent years in corporate life, and I have ADHD myself, so I came at this work the hard way before I came at it professionally.

What I send is simple. Now and then I'll share something about what's actually driving your behaviour underneath the surface, why willpower so often loses to the subconscious, and what changes when you work with it rather than against it. No fluff, and nothing that sounds like a wellness poster.

One thing I'd like to know: what made you sign up? Just hit reply and tell me in a line or two. I read every response myself, and it helps me write things that are useful to you.

Speak soon,
Chris

Chris Murray
Precision Hypnosis
https://chrismurrayhypnosis.com

You're receiving this because you subscribed on chrismurrayhypnosis.com. If you'd rather not hear from me, just reply with "unsubscribe" and I'll remove you straight away.
`;

function toHtml(text) {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const paras = text.trim().split('\n\n').map((p) => {
    const body = esc(p).replace(/\n/g, '<br>').replace(/(https:\/\/[^\s<]+)/g, '<a href="$1" style="color:#8a6d3b">$1</a>');
    return `<p style="margin:0 0 18px">${body}</p>`;
  });
  return `<div style="background:#f7f5f2;padding:32px 16px"><div style="max-width:560px;margin:0 auto;font-family:Raleway,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.65;color:#2e2e2e">${paras.join('')}</div></div>`;
}

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin') || '';
  if (!ALLOWED_ORIGINS.includes(origin) && !/^https:\/\/[a-z0-9-]+\.pages\.dev$/.test(origin)) {
    return json({ ok: false, error: 'forbidden' }, 403);
  }
  if (!env.BREVO_API_KEY || !env.FROM_EMAIL) {
    return json({ ok: true, sent: false, reason: 'not configured' });
  }

  let data;
  try { data = await request.json(); } catch { return json({ ok: false, error: 'bad request' }, 400); }
  const email = String((data && data.email) || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
    return json({ ok: false, error: 'invalid email' }, 400);
  }

  const payload = {
    sender: { name: env.FROM_NAME || 'Chris Murray', email: env.FROM_EMAIL },
    to: [{ email }],
    subject: SUBJECT,
    textContent: TEXT,
    htmlContent: toHtml(TEXT),
  };
  if (env.REPLY_TO) payload.replyTo = { email: env.REPLY_TO };

  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) return json({ ok: false, error: 'send failed' }, 502);
  return json({ ok: true, sent: true });
}

export async function onRequest({ request }) {
  return json({ ok: false, error: 'method not allowed' }, 405);
}
