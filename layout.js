// Shared header, footer, inquiry form and motion helpers for every page.
// ─────────────────────────────────────────────────────────────
// SHOP DETAILS — edit here, they update on every page.
window.SHOP = {
  name: 'SENTIVA Beauty Bar',
  company: 'Сентива 9 ЕООД',          // TODO: проверете името на фирмата
  eik: '208754641',                    // TODO: проверете ЕИК
  address: 'Център, пл. „Саранск“ 8',
  city: '2140 Ботевград',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=42.9072271,23.7931447',
  mapEmbed: 'https://maps.google.com/maps?q=42.9072271,23.7931447&z=17&output=embed',
  phone: '',                           // TODO: напр. '+359 88 888 8888' — включва и бутоните за Viber/WhatsApp
  email: '',                           // TODO: напр. 'hello@sentiva.bg'
  hours: [['Понеделник – петък', '9:00 – 19:00'], ['Събота', '10:00 – 14:00'], ['Неделя', 'почивен ден']],
  social: {
    instagram: 'https://www.instagram.com/sentiva_beauty.bar/',
    facebook: '',                      // TODO: поставете линка към Facebook страницата
    tiktok: 'https://www.tiktok.com/@sentiva.beauty.bar',
  },
  // Текст „За магазина“ във футъра — свободно редактируем.
  about: 'SENTIVA Beauty Bar е магазин за професионална козметика за коса и лице, грим и парфюми в центъра на Ботевград, отворил врати на 25 май 2026 г. Подбираме продукти от Испания, Германия, Италия и САЩ, а авторските ни изделия от епоксидна смола и масивна дървесина са ръчна изработка на основателя на бранда.',
};

// Categories — shared by the home, categories and products pages.
window.CATS = {
  perfume: {
    title: 'Парфюми', short: 'Парфюми', accent: '#e0a95a', cover: 'img/tb-lattafa-yara.webp',
    chipKey: 'gender', chips: ['Дамски', 'Мъжки', 'Унисекс'],
    blurb: 'Оригинални дизайнерски и арабски парфюми — от свежи цитрусови до дълбоки ориенталски аромати. Предлагаме и разливки, за да опитате аромата, преди да изберете флакона.',
  },
  hair: {
    title: 'Козметика за коса', short: 'Коса', accent: '#8fbfae', cover: 'img/anea-curl-power-stop-shampoan-i-maska.webp',
    chipKey: 'sub', chips: ['Шампоани', 'Маски и балсами', 'Грижа и защита', 'Против косопад', 'Стилизиране', 'Боядисване'],
    blurb: 'Салонна грижа у дома — шампоани, маски, защита, стилизиране и боядисване от професионални марки, с които работят фризьорите.',
  },
  makeup: {
    title: 'Грим', short: 'Грим', accent: '#e494a4', cover: 'img/impala-spirala-spider.webp',
    chipKey: 'sub', chips: ['Лице', 'Очи', 'Вежди', 'Устни', 'Аксесоари'],
    blurb: 'Всичко за лице, очи, вежди и устни — за ежедневен естествен вид или за вечерен акцент.',
  },
  gift: {
    title: 'Подаръчни изделия', short: 'Подаръци', accent: '#b9a3e3', cover: 'img/promo1.webp',
    chipKey: 'sub', chips: ['Ваучери', 'Комплекти', 'Ръчна изработка'],
    blurb: 'Подаръчни ваучери, готови комплекти и авторски изделия от епоксидна смола и масивна дървесина — ръчна изработка, всяко в единствен екземпляр.',
  },
};

(() => {
  const S = window.SHOP;
  const PRODUCTS = window.PRODUCTS || [];
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
  PRODUCTS.forEach(p => { p.display = prettyName(p); });

  // ---------- Shared product helpers ----------
  const find = id => PRODUCTS.find(p => p.id === id);
  function placeholder(p) {
    const label = p.sub === 'Ръчна изработка' ? 'Ръчна изработка' : window.CATS[p.cat]?.title || '';
    return `<div class="ph"><span>${esc(p.cat === 'gift' ? p.display : p.brand)}<small>${esc(label)}</small></span></div>`;
  }
  // Images that fail to load are swapped for the same placeholder as products without a photo.
  const imgHTML = (p, lazy = true) => p.img
    ? `<img src="${esc(p.img)}" alt="${esc(p.display)}"${lazy ? ' loading="lazy"' : ''} data-pid="${esc(p.id)}">`
    : placeholder(p);
  const priceHTML = p => p.price == null
    ? '<span class="price"><small>Цена при запитване</small></span>'
    : `<span class="price">${eur(p.price)}${p.perPiece ? ' <small>/ брой</small>' : ''}</span>`;
  const meta = p => p.cat === 'perfume' ? [p.gender, p.volume && p.volume + ' ml'].filter(Boolean).join(' · ') : (p.sub || '');
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  window.ProductUI = { find, imgHTML, priceHTML, placeholder, meta, plural };

  document.addEventListener('error', e => {
    const img = e.target;
    if (img.tagName !== 'IMG') return;
    const p = img.dataset.pid && find(img.dataset.pid);
    if (p) img.outerHTML = placeholder(p);
    else img.classList.add('img-missing');
  }, true);

  const page = document.body.dataset.page || '';
  const ICONS = {
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1Z" fill="currentColor"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.6 3c.3 2.1 1.6 3.6 3.6 3.8v3a7 7 0 0 1-3.6-1.1v6.2a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v3.1a2.6 2.6 0 1 0 1.7 2.4V3h3Z" fill="currentColor"/></svg>',
    chat: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 5.5h16v10H9l-4 3.5v-3.5H4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 9.5h8M8 12.5h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  };
  const SOCIAL_NAMES = { instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok' };
  const socialLinks = () => Object.entries(S.social).map(([k, url]) =>
    `<a class="social" href="${esc(url || '#')}" ${url ? 'target="_blank" rel="noopener"' : 'data-missing'} aria-label="${SOCIAL_NAMES[k]}" title="${SOCIAL_NAMES[k]}">${ICONS[k]}</a>`).join('');
  const cur = p => page === p ? ' aria-current="page"' : '';
  const catLink = c => `products.html?cat=${c}`;

  // ---------- Header ----------
  document.body.insertAdjacentHTML('afterbegin', `
  <a class="skip-link" href="#main">Към съдържанието</a>
  <header class="topbar" id="topbar">
    <div class="wrap topbar-in">
      <a href="index.html" class="brand" aria-label="${esc(S.name)} — начало">
        <span class="brand-name">SENTIVA</span><span class="brand-sub">Beauty Bar</span>
      </a>
      <nav class="nav" id="nav" aria-label="Основно меню">
        <a href="index.html"${cur('home')}>Начало</a>
        <a href="categories.html"${cur('categories')}>Категории</a>
        <a href="products.html"${cur('products')}>Продукти</a>
        <a href="about.html"${cur('about')}>За нас</a>
        <a href="blog.html"${cur('blog')}>Блог</a>
      </nav>
      <button class="btn btn-gold btn-sm ask-top" type="button" data-ask>${ICONS.chat}<span>Попитай ни</span></button>
      <button class="menu-btn" id="menuBtn" aria-label="Меню" aria-expanded="false" aria-controls="nav"><span></span><span></span></button>
    </div>
  </header>`);

  // ---------- Footer ----------
  const contactLines = [
    `<li>${esc(S.address)}<br>${esc(S.city)}</li>`,
    S.phone ? `<li><a href="tel:${esc(S.phone.replace(/\s/g, ''))}">${esc(S.phone)}</a></li>` : '',
    S.email ? `<li><a href="mailto:${esc(S.email)}">${esc(S.email)}</a></li>` : '',
    `<li><button class="link-btn" type="button" data-ask>Изпратете запитване →</button></li>`,
  ].join('');
  document.body.insertAdjacentHTML('beforeend', `
  <footer class="site-footer">
    <div class="wrap">
      <div class="f-cta" data-reveal>
        <h2>Имате въпрос за продукт?</h2>
        <p>Пишете ни — ще ви отговорим за наличност, цена, разливка или съвет и ще се уговорим как да го получите.</p>
        <button class="btn btn-gold" type="button" data-ask>Попитайте ни</button>
      </div>
      <div class="f-grid">
        <div class="f-about">
          <span class="brand-name">SENTIVA</span>
          <p class="f-kicker">Beauty Bar · Ботевград</p>
          <p class="f-text">${esc(S.about)}</p>
          <div class="f-social">${socialLinks()}</div>
        </div>
        <div>
          <h4>Каталог</h4>
          <ul>
            ${Object.entries(window.CATS).map(([k, c]) => `<li><a href="${catLink(k)}">${esc(c.title)}</a></li>`).join('')}
            <li><a href="categories.html">Всички категории</a></li>
          </ul>
        </div>
        <div>
          <h4>Информация</h4>
          <ul>
            <li><a href="about.html">За нас</a></li>
            <li><a href="about.html#faq">Как да купя продукт</a></li>
            <li><a href="blog.html">Блог и ревюта</a></li>
            <li><a href="terms.html">Условия и поверителност</a></li>
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
        <span>Онлайн каталог · покупка след запитване</span>
      </div>
    </div>
  </footer>
  <div class="toast" id="toast" role="status" aria-live="polite" hidden></div>`);

  document.querySelectorAll('[data-missing]').forEach(a => a.addEventListener('click', e => e.preventDefault()));

  let toastTimer;
  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 2200);
  }
  window.toast = toast;

  // ---------- Header behaviour ----------
  const topbar = document.getElementById('topbar');
  const onScroll = () => topbar.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const menuBtn = document.getElementById('menuBtn'), nav = document.getElementById('nav');
  menuBtn.addEventListener('click', () => menuBtn.setAttribute('aria-expanded', nav.classList.toggle('open')));
  nav.addEventListener('click', e => { if (e.target.closest('a')) { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); } });

  // ---------- Inquiry ("Попитай за продукта") ----------
  // Buying happens in a conversation: the visitor sends a question, the shop answers by the channel they chose.
  const CHANNELS = {
    phone: { label: 'Телефон', field: 'Телефонен номер *', type: 'tel', ph: '08X XXX XXXX', auto: 'tel' },
    viber: { label: 'Viber', field: 'Номер във Viber *', type: 'tel', ph: '08X XXX XXXX', auto: 'tel' },
    whatsapp: { label: 'WhatsApp', field: 'Номер в WhatsApp *', type: 'tel', ph: '08X XXX XXXX', auto: 'tel' },
    email: { label: 'Имейл', field: 'Имейл адрес *', type: 'email', ph: 'name@example.com', auto: 'email' },
    instagram: { label: 'Instagram', field: 'Потребител в Instagram *', type: 'text', ph: '@потребител', auto: 'off' },
  };
  const QUICK = {
    product: ['Наличен ли е?', 'Как мога да го получа?', 'Можете ли да ме посъветвате?', 'Можете ли да го запазите за мен?'],
    perfume: ['Предлагате ли разливка?'],
    general: ['Търся подарък', 'Съвет за коса', 'Интересувам се от разливки', 'Изделие по поръчка'],
  };

  document.body.insertAdjacentHTML('beforeend', `
  <dialog class="ask" id="ask" aria-labelledby="askTitle">
    <button class="x" type="button" data-ask-close aria-label="Затвори">×</button>
    <div class="ask-view" id="askMain">
      <p class="eyebrow">Запитване</p>
      <h3 id="askTitle">Попитайте ни</h3>
      <p class="muted small ask-intro">Ще ви отговорим по удобния за вас начин — за наличност, цена, разливка или съвет. Покупката уговаряме заедно.</p>
      <div class="ask-product" id="askProduct" hidden></div>
      <form id="askForm" name="inquiry" method="POST" data-netlify="true" netlify-honeypot="bot-field" novalidate>
        <input type="hidden" name="form-name" value="inquiry">
        <input type="hidden" name="product">
        <p hidden><label>Не попълвайте: <input name="bot-field"></label></p>
        <div class="ask-quick" id="askQuick" aria-label="Бързи въпроси"></div>
        <label>Вашият въпрос *<textarea name="message" rows="4" required></textarea></label>
        <label>Име *<input name="name" required autocomplete="name"></label>
        <fieldset class="channels">
          <legend>Как да се свържем с вас? *</legend>
          <div class="channel-list">${Object.entries(CHANNELS).map(([k, c], i) =>
            `<label class="channel"><input type="radio" name="channel" value="${c.label}" data-ch="${k}"${i ? '' : ' checked'}><span>${c.label}</span></label>`).join('')}</div>
        </fieldset>
        <label><span id="contactLabel">Телефонен номер *</span><input name="contact" id="contactInput" required></label>
        <label class="consent"><input type="checkbox" name="consent" value="да" required> <span>Съгласен/на съм данните ми да бъдат използвани само за отговор на запитването. <a href="terms.html#privacy" target="_blank">Поверителност</a></span></label>
        <p class="form-error" id="askError" role="alert" hidden></p>
        <button class="btn btn-gold" type="submit" id="askSubmit">Изпрати запитването</button>
      </form>
    </div>
    <div class="ask-view ask-done" id="askDone" hidden>
      <svg class="tick" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24"/><path d="m15 27 7 7 15-16"/></svg>
      <h3>Благодарим ви!</h3>
      <p class="muted">Получихме запитването и ще се свържем с вас <b id="askDoneVia"></b> възможно най-скоро.</p>
      <button class="btn btn-ghost" type="button" data-ask-close>Към каталога</button>
    </div>
    <div class="ask-view" id="askFallback" hidden>
      <p class="eyebrow">Почти готово</p>
      <h3>Изпратете ни съобщението директно</h3>
      <p class="muted small">Формата не можа да бъде изпратена от тук. Копирайте текста и ни го изпратете по някой от каналите по-долу.</p>
      <textarea id="askText" rows="7" readonly></textarea>
      <div class="ask-links" id="askLinks"></div>
    </div>
  </dialog>`);

  const ask = document.getElementById('ask'), form = document.getElementById('askForm');
  const $a = id => document.getElementById(id);
  const MEMO = 'sentiva-contact';
  let current = null;

  function setChannel(k) {
    const c = CHANNELS[k];
    $a('contactLabel').textContent = c.field;
    Object.assign($a('contactInput'), { type: c.type, placeholder: c.ph, autocomplete: c.auto });
  }
  form.addEventListener('change', e => { if (e.target.name === 'channel') setChannel(e.target.dataset.ch); });

  $a('askQuick').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const ta = form.message, line = b.textContent;
    if (!ta.value.includes(line)) ta.value = (ta.value.trim() ? ta.value.trim() + '\n' : '') + line;
    b.setAttribute('aria-pressed', 'true'); ta.focus();
  });
  $a('askProduct').addEventListener('click', e => {
    if (!e.target.closest('[data-unlink]')) return;
    current = null; form.product.value = ''; $a('askProduct').hidden = true;
    form.message.value = form.message.value.replace(/^Здравейте! Интересувам се от „[^“]*“\.\n?/, '');
    renderQuick();
  });

  function renderQuick() {
    const list = current ? [...QUICK.product, ...(current.cat === 'perfume' ? QUICK.perfume : [])] : QUICK.general;
    $a('askQuick').innerHTML = list.map(q => `<button type="button" class="chip" aria-pressed="false">${esc(q)}</button>`).join('');
  }

  function openAsk(id) {
    current = id ? find(id) : null;
    ['askDone', 'askFallback'].forEach(v => { $a(v).hidden = true; });
    $a('askMain').hidden = false; $a('askError').hidden = true;
    form.product.value = current ? `${current.display} (${current.brand})` : '';
    $a('askProduct').hidden = !current;
    if (current) {
      $a('askProduct').innerHTML = `
        <div class="thumb">${imgHTML(current, false)}</div>
        <div><span class="card-brand">${esc(current.brand)}</span><b>${esc(current.display)}</b>${priceHTML(current)}</div>
        <button type="button" class="link-btn" data-unlink aria-label="Общо запитване, без продукт">Премахни</button>`;
    }
    $a('askTitle').textContent = current ? 'Попитайте за продукта' : 'Попитайте ни';
    form.message.value = current ? `Здравейте! Интересувам се от „${current.display}“.\n` : '';
    renderQuick();
    try {
      const m = JSON.parse(localStorage.getItem(MEMO)) || {};
      if (m.name && !form.name.value) form.name.value = m.name;
      if (m.contact && !form.contact.value) form.contact.value = m.contact;
      const r = m.ch && form.querySelector(`[data-ch="${m.ch}"]`);
      if (r) r.checked = true;
    } catch {}
    setChannel(form.querySelector('[name=channel]:checked').dataset.ch);
    ask.showModal();
    setTimeout(() => (form.name.value ? form.message : form.message).focus(), 50);
    const end = form.message.value.length; form.message.setSelectionRange(end, end);
  }
  window.Inquiry = { open: openAsk };

  document.addEventListener('click', e => {
    const t = e.target.closest('[data-ask]');
    if (t) { e.preventDefault(); e.stopPropagation(); openAsk(t.dataset.ask || null); }
  }, true);
  ask.addEventListener('click', e => { if (e.target === ask || e.target.closest('[data-ask-close]')) ask.close(); });

  function messageText(f) {
    const head = f.get('product') ? [`Продукт: ${f.get('product')}`] : [];
    return [...head, f.get('message').trim(), '', `${f.get('name')} · ${f.get('channel')}: ${f.get('contact')}`].join('\n');
  }

  function fallbackLinks(text) {
    const links = [];
    const phone = S.phone.replace(/[^\d+]/g, '');
    if (S.email) links.push(`<a class="btn btn-ghost btn-sm" href="mailto:${esc(S.email)}?subject=${encodeURIComponent('Запитване от сайта')}&body=${encodeURIComponent(text)}">Имейл</a>`);
    if (phone) {
      links.push(`<a class="btn btn-ghost btn-sm" href="https://wa.me/${esc(phone.replace('+', ''))}?text=${encodeURIComponent(text)}" target="_blank" rel="noopener">WhatsApp</a>`);
      links.push(`<a class="btn btn-ghost btn-sm" href="viber://chat?number=${encodeURIComponent(phone)}">Viber</a>`);
    }
    if (S.social.instagram) links.push(`<a class="btn btn-ghost btn-sm" href="${esc(S.social.instagram)}" target="_blank" rel="noopener">Instagram</a>`);
    return `<button class="btn btn-gold btn-sm" type="button" id="askCopy">Копирай текста</button>${links.join('')}`;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const err = $a('askError');
    if (!form.checkValidity()) {
      const bad = form.querySelector(':invalid');
      err.textContent = bad?.name === 'consent' ? 'Моля, потвърдете съгласието си.'
        : bad?.name === 'contact' && bad.validity.typeMismatch ? 'Моля, проверете имейл адреса.'
        : 'Моля, попълнете полетата, отбелязани със *.';
      err.hidden = false; bad?.focus(); return;
    }
    err.hidden = true;
    const f = new FormData(form);
    try { localStorage.setItem(MEMO, JSON.stringify({ name: f.get('name'), contact: f.get('contact'), ch: form.querySelector('[name=channel]:checked').dataset.ch })); } catch {}
    const btn = $a('askSubmit');
    btn.disabled = true; btn.textContent = 'Изпращане…';
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(f).toString(),
      });
      if (!res.ok) throw new Error(res.status);
      $a('askDoneVia').textContent = 'по ' + f.get('channel');
      $a('askMain').hidden = true; $a('askDone').hidden = false;
      form.message.value = '';
    } catch {
      // Not hosted on Netlify yet (or offline): let the visitor send the message themselves.
      const text = messageText(f);
      $a('askText').value = text;
      $a('askLinks').innerHTML = fallbackLinks(text);
      $a('askMain').hidden = true; $a('askFallback').hidden = false;
    } finally {
      btn.disabled = false; btn.textContent = 'Изпрати запитването';
    }
  });
  ask.addEventListener('click', async e => {
    if (!e.target.closest('#askCopy')) return;
    try { await navigator.clipboard.writeText($a('askText').value); toast('Текстът е копиран'); }
    catch { $a('askText').select(); }
  });

  // ---------- Motion: reveal on scroll, counters ----------
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function countUp(el) {
    const to = +el.dataset.count, dur = 1400, t0 = performance.now();
    if (reduced) { el.textContent = to; return; }
    const step = t => {
      const k = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  // A fully clipped element has no visible area, so "clip" reveals watch their parent instead.
  const proxied = new Map();
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    const t = en.target, kids = proxied.get(t);
    if (kids) { kids.forEach(k => k.classList.add('in')); proxied.delete(t); }
    if (t.hasAttribute('data-reveal')) t.classList.add('in');
    if (t.dataset.count) countUp(t);
    io.unobserve(t);
  }), { rootMargin: '0px 0px -8% 0px', threshold: .12 }) : null;
  function observe(el) {
    if (el.dataset.reveal !== 'clip') return io.observe(el);
    const p = el.parentElement;
    proxied.set(p, [...(proxied.get(p) || []), el]);
    io.observe(p);
  }

  function scan(root = document) {
    root.querySelectorAll('[data-stagger]').forEach(group => {
      const step = +group.dataset.stagger || 90;
      [...group.children].forEach((el, i) => {
        if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', group.dataset.revealChild || '');
        el.style.setProperty('--d', `${i * step}ms`);
      });
    });
    root.querySelectorAll('[data-reveal]:not(.in), [data-count]:not([data-seen])').forEach(el => {
      if (el.dataset.count) el.dataset.seen = '';
      if (io && !reduced) observe(el);
      else { el.classList.add('in'); if (el.dataset.count) el.textContent = el.dataset.count; }
    });
  }
  window.Motion = { scan, reduced };
  addEventListener('DOMContentLoaded', () => scan());
})();
