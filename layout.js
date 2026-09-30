// Shared header, footer and shopping cart for every page.
// ─────────────────────────────────────────────────────────────
// SHOP DETAILS — edit here, they update on every page.
window.SHOP = {
  name: 'SENTIVA Beauty Bar',
  company: 'Сентива 9 ЕООД',          // TODO: проверете името на фирмата
  eik: '208754641',                    // TODO: проверете ЕИК
  address: 'Център, пл. „Саранск“ 8',
  city: '2140 Ботевград',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=42.9072271,23.7931447',
  phone: '',                           // TODO: напр. '+359 88 888 8888'
  email: '',                           // TODO: напр. 'hello@sentiva.bg'
  hours: [['Понеделник – петък', '9:00 – 19:00'], ['Събота', '10:00 – 14:00'], ['Неделя', 'почивен ден']],
  social: {
    instagram: 'https://www.instagram.com/sentiva_beauty.bar/',
    facebook: '',                      // TODO: поставете линка към Facebook страницата
    tiktok: 'https://www.tiktok.com/@sentiva.beauty.bar',
  },
  // Текст „За магазина“ във футъра — свободно редактируем.
  about: 'SENTIVA Beauty Bar е магазин за професионална козметика за коса и лице, грим и парфюми в центъра на Ботевград, отворил врати на 25 май 2026 г. Подбираме продукти от Испания, Германия, Италия и САЩ, а авторските ни изделия от епоксидна смола и масивна дървесина са ръчна изработка на основателя на бранда.',
  freeShippingFrom: null,              // TODO: напр. 60 за безплатна доставка над 60 €
};

(() => {
  const S = window.SHOP;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const eur = n => (n ?? 0).toFixed(2).replace('.', ',') + ' €';
  window.eur = eur; window.esc = esc;
  // Perfume names come in as supplier codes ("PACO RABANNE INVICTUS EDT M 100ML B.O.") — make them readable.
  const KEEP = new Set(['EDP', 'EDT', 'CK', 'VIP', 'D&G', 'XXXL', 'SOS', 'KEEN', 'ANEA', 'IMPALA', 'ORYX', 'C:EHKO', 'DIFIABA', 'WOW', 'UPGRADE', 'SPIDER', 'BROOKLIN', 'DIAMOND']);
  function prettyName(p) {
    if (p.cat !== 'perfume') return p.name.replace(/\s+/g, ' ');
    return p.name
      .replace(/\bB\.O\.?/g, '')
      .replace(/\b(\d+)\s*ML\b/gi, '$1 ml')
      .replace(/\s(M|D)(?=\s|-|$)/g, '')
      .replace(/-(?=\d)/g, ' ')
      .split(/\s+/).filter(Boolean)
      .map(w => KEEP.has(w.toUpperCase()) || /\d/.test(w) ? (/\d/.test(w) ? w : w.toUpperCase())
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
      .replace(/\bMl\b/g, 'ml').replace(/\bQ By D&g\b/i, 'Q by D&G').replace(/\bDe\b/g, 'de');
  }
  (window.PRODUCTS || []).forEach(p => { p.display = prettyName(p); });

  const page = document.body.dataset.page || '';
  const onHome = page === 'home';

  const ICONS = {
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1Z" fill="currentColor"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.6 3c.3 2.1 1.6 3.6 3.6 3.8v3a7 7 0 0 1-3.6-1.1v6.2a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v3.1a2.6 2.6 0 1 0 1.7 2.4V3h3Z" fill="currentColor"/></svg>',
    bag: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 7h12l-1 13H7L6 7Zm3 0V5a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  };
  const SOCIAL_NAMES = { instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok' };
  const socialLinks = () => Object.entries(S.social).map(([k, url]) =>
    `<a class="social" href="${esc(url || '#')}" ${url ? 'target="_blank" rel="noopener"' : 'data-missing'} aria-label="${SOCIAL_NAMES[k]}" title="${SOCIAL_NAMES[k]}">${ICONS[k]}</a>`).join('');

  const home = onHome ? '' : 'index.html';
  const catLink = c => `${home}?cat=${c}#catalog`;

  // ---------- Header ----------
  document.body.insertAdjacentHTML('afterbegin', `
  <header class="topbar">
    <div class="wrap topbar-in">
      <a href="${home || '#top'}" class="brand" aria-label="${esc(S.name)} — начало">
        <span class="brand-name">SENTIVA</span><span class="brand-sub">Beauty Bar</span>
      </a>
      <nav class="nav" id="nav">
        <a href="${catLink('perfume')}" data-go="perfume">Парфюми</a>
        <a href="${catLink('hair')}" data-go="hair">Коса</a>
        <a href="${catLink('makeup')}" data-go="makeup">Грим</a>
        <a href="${catLink('gift')}" data-go="gift">Подаръчни изделия</a>
        <a href="blog.html" ${page === 'blog' ? 'aria-current="page"' : ''}>Блог</a>
        <a href="${home}#visit">Контакти</a>
      </nav>
      <button class="inq-btn" id="cartOpen" aria-label="Количка">${ICONS.bag}<span class="inq-count" id="cartCount" hidden>0</span></button>
      <button class="menu-btn" id="menuBtn" aria-label="Меню" aria-expanded="false"><span></span><span></span></button>
    </div>
  </header>`);

  // ---------- Footer ----------
  const contactLines = [
    `<li>${esc(S.address)}<br>${esc(S.city)}</li>`,
    S.phone ? `<li><a href="tel:${esc(S.phone.replace(/\s/g, ''))}">${esc(S.phone)}</a></li>` : '<li class="todo">Телефон — предстои</li>',
    S.email ? `<li><a href="mailto:${esc(S.email)}">${esc(S.email)}</a></li>` : '',
  ].join('');
  document.body.insertAdjacentHTML('beforeend', `
  <footer class="site-footer">
    <div class="wrap">
      <div class="f-grid">
        <div class="f-about">
          <span class="brand-name">SENTIVA</span>
          <p class="f-kicker">Beauty Bar · Ботевград</p>
          <p class="f-text" id="shopAbout">${esc(S.about)}</p>
          <div class="f-social">${socialLinks()}</div>
        </div>
        <div>
          <h4>Магазин</h4>
          <ul>
            <li><a href="${catLink('perfume')}">Парфюми</a></li>
            <li><a href="${catLink('hair')}">Козметика за коса</a></li>
            <li><a href="${catLink('makeup')}">Грим</a></li>
            <li><a href="${catLink('gift')}">Подаръчни изделия</a></li>
            <li><a href="blog.html">Блог и ревюта</a></li>
          </ul>
        </div>
        <div>
          <h4>Информация</h4>
          <ul>
            <li><a href="terms.html#delivery">Доставка и плащане</a></li>
            <li><a href="terms.html#returns">Връщане и замяна</a></li>
            <li><a href="terms.html#terms">Общи условия</a></li>
            <li><a href="terms.html#privacy">Поверителност</a></li>
          </ul>
        </div>
        <div>
          <h4>Посетете ни</h4>
          <ul>${contactLines}</ul>
          <ul class="f-hours">${S.hours.map(([d, h]) => `<li><span>${esc(d)}</span><span>${esc(h)}</span></li>`).join('')}</ul>
        </div>
      </div>
      <div class="f-bottom">
        <span>© ${new Date().getFullYear()} ${esc(S.name)} · ${esc(S.company)}, ЕИК ${esc(S.eik)}</span>
        <span>Доставка с Еконт и Спиди в цялата страна</span>
      </div>
    </div>
  </footer>

  <aside class="drawer" id="drawer" aria-label="Количка" hidden>
    <div class="drawer-head">
      <h3>Вашата количка</h3>
      <button class="x" id="cartClose" aria-label="Затвори">×</button>
    </div>
    <ul class="inq-list" id="cartList"></ul>
    <div class="drawer-foot">
      <p class="inq-total">Междинна сума: <b id="cartTotal">0,00 €</b></p>
      <p class="muted small">Доставката се изчислява при поръчка.</p>
      <a class="btn btn-gold" id="toCheckout" href="checkout.html">Към поръчка</a>
    </div>
  </aside>
  <div class="scrim" id="scrim" hidden></div>
  <div class="toast" id="toast" role="status" aria-live="polite" hidden></div>`);

  document.querySelectorAll('[data-missing]').forEach(a => a.addEventListener('click', e => e.preventDefault()));

  // ---------- Cart (saved in this browser) ----------
  const KEY = 'sentiva-cart';
  const listeners = [];
  let items = {};
  try { items = JSON.parse(localStorage.getItem(KEY)) || {}; } catch { items = {}; }
  const find = id => (window.PRODUCTS || []).find(p => p.id === id);
  const purge = () => { for (const id in items) if (!find(id) || find(id).price == null || items[id] <= 0) delete items[id]; };
  const persist = () => {
    purge();
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
    listeners.forEach(fn => fn()); render();
  };

  window.Cart = {
    lines: () => Object.entries(items).map(([id, qty]) => ({ p: find(id), qty })).filter(l => l.p),
    has: id => !!items[id],
    add(id, n = 1) { items[id] = (items[id] || 0) + n; persist(); toast('Добавено в количката'); },
    set(id, n) { items[id] = n; persist(); },
    clear() { items = {}; persist(); },
    count: () => Object.values(items).reduce((a, b) => a + b, 0),
    subtotal: () => window.Cart.lines().reduce((s, l) => s + l.p.price * l.qty, 0),
    onChange: fn => listeners.push(fn),
    open: () => { render(); drawer.hidden = scrim.hidden = false; },
  };

  const drawer = document.getElementById('drawer'), scrim = document.getElementById('scrim');
  const thumb = p => p.img ? `<img src="${esc(p.img)}" alt="">` : '';
  function render() {
    const lines = window.Cart.lines(), count = window.Cart.count();
    const badge = document.getElementById('cartCount');
    badge.hidden = !count; badge.textContent = count;
    document.getElementById('cartList').innerHTML = lines.length ? lines.map(({ p, qty }) => `
      <li>
        <div class="thumb">${thumb(p)}</div>
        <div class="nm">${esc(p.display || p.name)}<small>${eur(p.price * qty)}</small></div>
        <div class="qty"><button data-dec="${esc(p.id)}" aria-label="По-малко">−</button><span>${qty}</span><button data-inc="${esc(p.id)}" aria-label="Повече">+</button></div>
      </li>`).join('') : '<li class="inq-empty">Количката е празна.</li>';
    document.getElementById('cartTotal').textContent = eur(window.Cart.subtotal());
    document.getElementById('toCheckout').classList.toggle('disabled', !lines.length);
  }
  document.getElementById('cartList').addEventListener('click', e => {
    const inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]');
    if (inc) window.Cart.set(inc.dataset.inc, items[inc.dataset.inc] + 1);
    if (dec) window.Cart.set(dec.dataset.dec, items[dec.dataset.dec] - 1);
  });
  const close = () => { drawer.hidden = scrim.hidden = true; };
  document.getElementById('cartOpen').addEventListener('click', window.Cart.open);
  document.getElementById('cartClose').addEventListener('click', close);
  scrim.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  let toastTimer;
  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 1800);
  }
  window.toast = toast;

  // ---------- Mobile menu ----------
  const menuBtn = document.getElementById('menuBtn'), nav = document.getElementById('nav');
  menuBtn.addEventListener('click', () => menuBtn.setAttribute('aria-expanded', nav.classList.toggle('open')));
  nav.addEventListener('click', e => { if (e.target.closest('a')) { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); } });

  purge(); render();
})();
