(() => {
  const PRODUCTS = window.PRODUCTS || [];
  const { SHOP: S, esc, Motion } = window;
  const $ = s => document.querySelector(s);

  // Headline words rise in one after another.
  requestAnimationFrame(() => document.body.classList.add('ready'));

  // ---------- Manifesto: each word lights up as it scrolls through the screen ----------
  const man = $('#manifesto');
  man.innerHTML = man.textContent.trim().split(/\s+/).map(w => `<span>${esc(w)}</span> `).join('');
  const words = [...man.children];
  // ---------- Journey: the line fills as you scroll ----------
  const journey = $('#journey');
  let tick = false;
  const run = () => {
    tick = false;
    const r = man.getBoundingClientRect();
    const k = Math.min(1, Math.max(0, (innerHeight * .85 - r.top) / (r.height + innerHeight * .35)));
    const lit = Math.round(k * words.length);
    words.forEach((w, i) => w.classList.toggle('lit', i < lit));
    const j = journey.getBoundingClientRect();
    journey.style.setProperty('--jp', Math.min(1, Math.max(0, (innerHeight * .7 - j.top) / j.height)).toFixed(3));
  };
  if (Motion.reduced) { words.forEach(w => w.classList.add('lit')); journey.style.setProperty('--jp', 1); }
  else { addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(run); } }, { passive: true }); run(); }

  // ---------- Numbers ----------
  const brands = new Set(PRODUCTS.map(p => p.brand).filter(b => !/^SENTIVA|^Arabian Collection$/.test(b)));
  $('#aProducts').dataset.count = PRODUCTS.length;
  $('#aBrands').dataset.count = brands.size;

  // ---------- FAQ: one answer open at a time ----------
  document.querySelectorAll('.faq details').forEach(d => d.addEventListener('toggle', () => {
    if (d.open) document.querySelectorAll('.faq details[open]').forEach(o => { if (o !== d) o.open = false; });
  }));

  // ---------- Visit ----------
  $('#aInfo').innerHTML = [
    ['Адрес', `${esc(S.address)}<br>${esc(S.city)}`],
    ['Работно време', S.hours.map(([d, h]) => `<span class="hr"><span>${esc(d)}</span><span>${esc(h)}</span></span>`).join('')],
    S.phone && ['Телефон', `<a href="tel:${esc(S.phone.replace(/\s/g, ''))}">${esc(S.phone)}</a>`],
    S.email && ['Имейл', `<a href="mailto:${esc(S.email)}">${esc(S.email)}</a>`],
    S.social.instagram && ['Instagram', `<a href="${esc(S.social.instagram)}" target="_blank" rel="noopener">@${esc(S.social.instagram.replace(/\/+$/, '').split('/').pop())}</a>`],
  ].filter(Boolean).map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  $('#aMap').href = S.mapUrl;
  $('#aMapFrame').src = S.mapEmbed;
})();
