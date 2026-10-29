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

const SUBJECT = 'Your Ten Minute Reset';

const AUDIO_URL = 'https://chrismurrayhypnosis.com/audio/ten-minute-reset-cfbb2a64604e.mp3';
const CALL_URL = 'https://chrismurrayhypnosis.com/#contact';
const LINK_LABELS = {
  [AUDIO_URL]: 'Play the Ten Minute Reset (10 minutes)',
  [CALL_URL]: 'Book a free 30-minute intro call',
};

const TEXT = `Hi,

Welcome, and thanks for joining. Here is the Ten Minute Reset I promised, a guided audio to settle a racing mind:

${AUDIO_URL}

Please only listen somewhere you can safely close your eyes, never while driving. Most people notice something settle the first time, and it works better with repeat use because your mind learns the route.

I'm Chris, a cognitive hypnotherapist. I work with people who look successful from the outside and still feel like they're running on fumes on the inside, with a good career and results to match, yet a mind that won't switch off at 2am. I used to be one of them. I spent years in corporate life, and I have ADHD myself, so I came to this work the hard way before I came to it professionally.

Once a week I'll send you one short email about what is actually driving your behaviour underneath the surface, and what changes when you work with it rather than against it. No fluff, and nothing that sounds like a wellness poster.

I'd like to know what made you sign up. Hit reply and tell me in a line or two. I read every response myself.

If there's a pattern that keeps coming back no matter how hard you try, that is the kind of thing I work on one to one. You're welcome to book a free intro call whenever it suits:

${CALL_URL}

Speak soon,
Chris

Chris Murray
Precision Hypnosis
https://chrismurrayhypnosis.com

You're receiving this because you joined my newsletter on chrismurrayhypnosis.com. If you'd rather not hear from me, reply with "unsubscribe" and I'll remove you straight away.
`;

function toHtml(text) {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const link = (u) => `<a href="${u}" style="color:#8a6d3b">${LINK_LABELS[u] || u}</a>`;
  const paras = text.trim().split('\n\n').map((p) => {
    const body = esc(p).replace(/\n/g, '<br>').replace(/(https:\/\/[^\s<]+)/g, (u) => link(u));
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
