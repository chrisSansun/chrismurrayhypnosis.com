/* Newsletter slide-in: a small card in the bottom corner, shown once the visitor
   has scrolled half the page or stayed 30 seconds. Closing it hides it for 30 days;
   signing up hides it for good. Posts to the same HubSpot form as the homepage strip. */
(function () {
  var HS_PORTAL = '243959808', NEWS_FORM = '4c5205dd-9895-43d8-8494-60931de14d53';
  var AUDIO = '/audio/ten-minute-reset-cfbb2a64604e.mp3';
  var KEY = 'cmh-news', DAY = 864e5;

  function get() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  function set(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }

  var st = get();
  if (st.joined || (st.closed && Date.now() - st.closed < 30 * DAY)) return;

  var css = '' +
    '.cmh-si{position:fixed;right:24px;bottom:24px;z-index:900;width:360px;max-width:calc(100vw - 32px);background:#0B2B22;color:#fff;border-radius:22px;padding:1.4rem 1.4rem 1.25rem;box-shadow:0 24px 60px -24px rgba(11,43,34,.6);font-family:"Hanken Grotesk",system-ui,sans-serif;font-weight:450;line-height:1.5;transform:translateY(calc(100% + 40px));opacity:0;transition:transform .45s cubic-bezier(.16,1,.3,1),opacity .3s ease}' +
    '.cmh-si.in{transform:none;opacity:1}' +
    '.cmh-si h2{font-size:1.35rem;font-weight:700;letter-spacing:-.02em;line-height:1.15;margin:0 2rem .45rem 0;color:#fff}' +
    '.cmh-si p{margin:0;font-size:.9375rem;color:#E4ECE8}' +
    '.cmh-si p strong{color:#F6AE45;font-weight:700}' +
    '.cmh-si form{display:flex;flex-direction:column;gap:.55rem;margin-top:1rem}' +
    '.cmh-si input{font:inherit;font-size:1rem;color:#14231E;background:#fff;border:2px solid transparent;border-radius:999px;padding:.8rem 1rem;outline:none}' +
    '.cmh-si input:focus{border-color:#F6AE45}' +
    '.cmh-si button.go{font:inherit;font-weight:700;font-size:.9375rem;background:#fff;color:#0B2B22;border:0;border-radius:999px;padding:.85rem 1rem;cursor:pointer}' +
    '.cmh-si button.go:hover{background:#F6AE45}' +
    '.cmh-si .x{position:absolute;top:.8rem;right:.8rem;width:2.1rem;height:2.1rem;border-radius:999px;border:2px solid rgba(255,255,255,.35);background:none;color:#fff;font:700 1rem/1 system-ui;cursor:pointer}' +
    '.cmh-si .x:hover{border-color:#fff}' +
    '.cmh-si .fine{font-size:.75rem;color:#A9D3C3;margin-top:.15rem}.cmh-si .fine a{color:#fff}' +
    '.cmh-si .err{display:none;font-size:.8125rem;font-weight:600;color:#FFD9A8}' +
    '.cmh-si audio{width:100%;margin:.8rem 0 .3rem}' +
    '.cmh-si .dl{font-size:.875rem}.cmh-si .dl a{color:#F6AE45;font-weight:700}' +
    '.cmh-si .safe{font-size:.75rem;color:#A9D3C3;margin-top:.5rem}' +
    '.cmh-si .after{display:none;margin-top:.9rem;padding-top:.9rem;border-top:1px solid rgba(255,255,255,.15)}' +
    '.cmh-si .after a{display:inline-block;margin-top:.7rem;background:#fff;color:#0B2B22;font-weight:700;font-size:.9375rem;text-decoration:none;border-radius:999px;padding:.7rem 1.1rem}' +
    '.cmh-si :focus-visible{outline:3px solid #F6AE45;outline-offset:3px}' +
    '@media(max-width:600px){.cmh-si{right:12px;left:12px;bottom:12px;width:auto;max-width:none;padding:1.1rem 1.1rem 1rem;border-radius:18px}.cmh-si h2{font-size:1.15rem}.cmh-si p{font-size:.875rem}.cmh-si form{margin-top:.75rem;gap:.45rem}.cmh-si input,.cmh-si button.go{padding:.7rem 1rem}.cmh-si .fine{font-size:.6875rem}}' +
    '@media(prefers-reduced-motion:reduce){.cmh-si{transition:opacity .2s ease;transform:none}}';

  var box, shown = false;

  function build() {
    var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
    box = document.createElement('aside');
    box.className = 'cmh-si';
    box.setAttribute('aria-labelledby', 'cmhSiTitle');
    box.innerHTML =
      '<button class="x" type="button" aria-label="Close">&#x2715;</button>' +
      '<div class="ask">' +
        '<h2 id="cmhSiTitle">Notes on the mind, once a month.</h2>' +
        '<p>Join my newsletter: one short email a month on patterns, performance and change. As a thank-you, you&rsquo;ll get the <strong>Ten Minute Reset</strong>, a guided audio to settle a racing mind, free.</p>' +
        '<form novalidate>' +
          '<label for="cmhSiEmail" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Email address</label>' +
          '<input type="email" id="cmhSiEmail" placeholder="your@email.com" autocomplete="email" required>' +
          '<button class="go" type="submit">Join the newsletter</button>' +
          '<p class="err" role="alert"></p>' +
          '<p class="fine">By joining, you agree to receive my monthly newsletter by email. Unsubscribe anytime. <a href="/privacy">Privacy notice</a>.</p>' +
        '</form>' +
      '</div>' +
      '<div class="done" hidden role="status">' +
        '<h2>You&rsquo;re on the list. Here&rsquo;s your reset.</h2>' +
        '<audio controls preload="none" src="' + AUDIO + '"></audio>' +
        '<p class="dl"><a href="' + AUDIO + '" download="Ten Minute Reset - Chris Murray.mp3">Download the MP3</a> &middot; 10 minutes</p>' +
        '<p class="safe">Please only listen somewhere you can safely close your eyes, never while driving. This is a way to pause and settle, not a substitute for medical or psychological care.</p>' +
        '<div class="after"><p><strong>How does that feel?</strong> Use it again tomorrow: it works better each time. If there&rsquo;s a pattern that keeps coming back, that&rsquo;s what we&rsquo;d work on together.</p>' +
        '<a href="/#contact">Book a free 30-minute intro call</a></div>' +
      '</div>';
    document.body.appendChild(box);

    box.querySelector('.x').addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && shown) close(); });
    box.querySelector('form').addEventListener('submit', submit);
    box.querySelector('audio').addEventListener('ended', function () { box.querySelector('.after').style.display = 'block'; });
  }

  function show() {
    if (shown) return;
    // Don't pop up over the homepage's own sign-up strip when it's on screen.
    var strip = document.getElementById('newsletter');
    if (strip) { var r = strip.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) return; }
    shown = true;
    if (!box) build();
    requestAnimationFrame(function () { requestAnimationFrame(function () { box.classList.add('in'); }); });
    detach();
  }

  function close() {
    box.classList.remove('in');
    var s = get(); if (!s.joined) { s.closed = Date.now(); set(s); }
    setTimeout(function () { box.remove(); }, 500);
    shown = false; detach();
  }

  function submit(e) {
    e.preventDefault();
    var em = box.querySelector('#cmhSiEmail'), err = box.querySelector('.err');
    err.style.display = 'none';
    if (!em.checkValidity()) { err.textContent = 'Please enter a valid email address.'; err.style.display = 'block'; em.focus(); return; }
    var btn = box.querySelector('.go'); btn.disabled = true;
    var hutk = (document.cookie.match(/hubspotutk=([^;]+)/) || [])[1];
    var ctx = { pageUri: location.href, pageName: document.title }; if (hutk) ctx.hutk = hutk;
    fetch('https://api.hsforms.com/submissions/v3/integration/submit/' + HS_PORTAL + '/' + NEWS_FORM, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: [{ name: 'email', value: em.value }], context: ctx })
    }).then(function (r) {
      if (!r.ok) throw 0;
      set({ joined: Date.now() });
      box.querySelector('.ask').hidden = true; box.querySelector('.done').hidden = false;
    }).catch(function () {
      btn.disabled = false; err.textContent = 'Something went wrong. Please try again.'; err.style.display = 'block';
    });
  }

  function onScroll() {
    var h = document.documentElement.scrollHeight - innerHeight;
    if (h > 0 && scrollY / h >= 0.5) show();
  }
  var timer = setTimeout(show, 30000);
  function detach() { removeEventListener('scroll', onScroll); clearTimeout(timer); }
  addEventListener('scroll', onScroll, { passive: true });

  // Let the homepage strip mark the visitor as joined, so the slide-in never appears afterwards.
  window.cmhNewsJoined = function () { set({ joined: Date.now() }); detach(); if (box && shown) close(); };
})();
