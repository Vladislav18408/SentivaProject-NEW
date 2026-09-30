(() => {
  const PRODUCTS = window.PRODUCTS || [];
  const S = window.SHOP;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const { esc, eur } = window;

  const CATS = {
    perfume: { title: 'Парфюми', chipKey: 'gender', chips: ['Дамски', 'Мъжки', 'Унисекс'] },
    hair: { title: 'Козметика за коса', chipKey: 'sub', chips: ['Шампоани', 'Маски и балсами', 'Грижа и защита', 'Против косопад', 'Стилизиране', 'Боядисване'] },
    makeup: { title: 'Грим', chipKey: 'sub', chips: ['Лице', 'Очи', 'Вежди', 'Устни', 'Аксесоари'] },
    gift: { title: 'Подаръчни изделия', chipKey: 'sub', chips: ['Ваучери', 'Комплекти', 'Ръчна изработка'] },
  };

  const params = new URLSearchParams(location.search);
  const state = { cat: CATS[params.get('cat')] ? params.get('cat') : 'perfume', chip: '', brand: '', q: '', sort: '' };

  // ---------- Catalog ----------
  function placeholder(p) {
    const label = p.sub === 'Ръчна изработка' ? 'Ръчна изработка' : CATS[p.cat].title;
    return `<div class="ph"><span>${esc(p.cat === 'gift' ? p.display : p.brand)}<small>${esc(label)}</small></span></div>`;
  }
  const imgHTML = p => p.img ? `<img src="${esc(p.img)}" alt="${esc(p.display)}" loading="lazy">` : placeholder(p);
  function priceHTML(p) {
    if (p.price == null) return '<span class="price"><small>При запитване</small></span>';
    return `<span class="price">${eur(p.price)}${p.perPiece ? ' <small>/ брой</small>' : ''}</span>`;
  }
  function meta(p) {
    if (p.cat === 'perfume') return [p.gender, p.volume && p.volume + ' ml'].filter(Boolean).join(' · ');
    return p.sub || '';
  }

  function filtered() {
    const q = state.q.trim().toLowerCase();
    const cfg = CATS[state.cat];
    const list = PRODUCTS.filter(p => p.cat === state.cat
      && (!state.chip || p[cfg.chipKey] === state.chip)
      && (!state.brand || p.brand === state.brand)
      && (!q || [p.display, p.name, p.brand, p.short, p.family, p.desc?.text].join(' ').toLowerCase().includes(q)));
    if (state.sort === 'asc') list.sort((a, b) => (a.price ?? 1e9) - (b.price ?? 1e9));
    if (state.sort === 'desc') list.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    if (state.sort === 'name') list.sort((a, b) => a.display.localeCompare(b.display, 'bg'));
    return list;
  }

  function renderControls() {
    const cfg = CATS[state.cat];
    $('#catTitle').textContent = cfg.title;
    $$('.tabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.cat === state.cat));
    const inCat = PRODUCTS.filter(p => p.cat === state.cat);
    const chips = cfg.chips.filter(c => inCat.some(p => p[cfg.chipKey] === c));
    $('#chips').innerHTML = ['', ...chips].map(c =>
      `<button class="chip" data-chip="${esc(c)}" aria-pressed="${state.chip === c}">${c || 'Всички'}</button>`).join('');
    const brands = [...new Set(inCat.map(p => p.brand))].sort((a, b) => a.localeCompare(b));
    $('#brand').hidden = brands.length < 2;
    $('#brand').innerHTML = `<option value="">Всички марки</option>` +
      brands.map(b => `<option ${b === state.brand ? 'selected' : ''}>${esc(b)}</option>`).join('');
  }

  function buyButton(p, small) {
    if (p.price == null) return `<a class="btn btn-ghost${small ? ' btn-sm' : ''}" href="#visit" data-ask>Запитване</a>`;
    return `<button class="btn btn-gold${small ? ' btn-sm' : ''}" data-add="${esc(p.id)}">${small ? 'Купи' : 'Добави в количката'}</button>`;
  }

  function renderGrid() {
    const list = filtered();
    $('#resultCount').textContent = `${list.length} ${list.length === 1 ? 'продукт' : 'продукта'}`;
    $('#grid').innerHTML = list.length ? list.map(p => `
      <article class="card" data-id="${esc(p.id)}" tabindex="0" aria-label="${esc(p.display)}">
        <div class="card-img">${imgHTML(p)}${p.tester ? '<span class="badge">Без кутия</span>' : ''}</div>
        <div class="card-body">
          <span class="card-brand">${esc(p.brand)}</span>
          <span class="card-name">${esc(p.display)}</span>
          ${p.short ? `<span class="card-short">${esc(p.short)}</span>` : ''}
          <span class="card-meta">${esc(meta(p))}</span>
          <span class="card-foot">${priceHTML(p)}${buyButton(p, true)}</span>
        </div>
      </article>`).join('')
      : '<p class="empty">Няма продукти по тези критерии. Опитайте с друго търсене.</p>';
  }

  function setCat(cat, scroll) {
    Object.assign(state, { cat, chip: '', brand: '', q: '' });
    $('#q').value = '';
    history.replaceState(null, '', `?cat=${cat}#catalog`);
    renderControls(); renderGrid();
    if (scroll) $('#catalog').scrollIntoView({ behavior: 'smooth' });
  }

  $('.tabs').addEventListener('click', e => { const b = e.target.closest('[data-cat]'); if (b) setCat(b.dataset.cat); });
  $('#chips').addEventListener('click', e => {
    const b = e.target.closest('[data-chip]'); if (!b) return;
    state.chip = b.dataset.chip; renderControls(); renderGrid();
  });
  $('#brand').addEventListener('change', e => { state.brand = e.target.value; renderGrid(); });
  $('#sort').addEventListener('change', e => { state.sort = e.target.value; renderGrid(); });
  $('#q').addEventListener('input', e => { state.q = e.target.value; renderGrid(); });
  // Category links in the header, tiles and teasers switch the catalog without reloading.
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-go]'); if (!el) return;
    e.preventDefault(); setCat(el.dataset.go, true);
  });

  // Add-to-cart from cards and modal; clicking elsewhere on a card opens details.
  document.addEventListener('click', e => {
    const add = e.target.closest('[data-add]');
    if (add) { e.stopPropagation(); window.Cart.add(add.dataset.add); return; }
    if (e.target.closest('[data-ask]')) { modal.close(); return; }
    const card = e.target.closest('.card');
    if (card) openProduct(card.dataset.id);
  });
  $('#grid').addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.classList.contains('card')) openProduct(e.target.dataset.id);
  });

  // ---------- Product modal ----------
  const modal = $('#modal');
  function openProduct(id) {
    const p = PRODUCTS.find(x => x.id === id); if (!p) return;
    $('#mImg').innerHTML = imgHTML(p);
    $('#mBrand').textContent = p.brand;
    $('#mTitle').textContent = p.display;
    const tags = p.cat === 'perfume'
      ? [p.gender, p.family, p.season, p.volume && p.volume + ' ml', p.tester && 'Без кутия (тестер)']
      : [p.sub];
    $('#mTags').innerHTML = tags.filter(Boolean).map(t => `<span>${esc(t)}</span>`).join('');
    $('#mPrice').innerHTML = p.price == null ? 'Цена при запитване' : eur(p.price) + (p.perPiece ? ' <small class="muted">/ брой</small>' : '');
    $('#mBuy').innerHTML = buyButton(p, false) + (p.price == null ? '<p class="muted small">Свържете се с нас за цена и срок на изработка.</p>' : '');
    const d = p.desc || {};
    $('#mText').textContent = d.text || p.short || '';
    $('#mBenefits').innerHTML = d.benefits?.length ? `<h4>Ползи</h4><ul>${d.benefits.map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : '';
    $('#mUsage').innerHTML = d.usage ? `<h4>Начин на употреба</h4><p class="muted">${esc(d.usage)}</p>` : '';
    modal.showModal();
  }
  modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('[data-close]')) modal.close(); });

  // ---------- Page content from shared data ----------
  for (const c of Object.keys(CATS)) {
    const n = PRODUCTS.filter(p => p.cat === c).length;
    $('#cnt-' + c).textContent = n + ' продукта';
  }
  const brandOrder = ['KEEN', 'C:EHKO', 'ANEA', 'DIFIABA', 'IMPALA', 'ORYX', 'BROOKLIN', 'Montblanc', 'Versace', 'Paco Rabanne', 'Carolina Herrera', 'Dolce & Gabbana', 'Calvin Klein', 'Boucheron', 'Roberto Cavalli', 'Armaf', 'Lattafa'];
  const present = new Set(PRODUCTS.map(p => p.brand));
  $('#brandList').innerHTML = brandOrder.filter(b => present.has(b)).map(b => `<li>${esc(b)}</li>`).join('');

  $('#visitInfo').innerHTML = [
    ['Адрес', `${esc(S.address)}, ${esc(S.city)}`],
    ['Работно време', S.hours.map(([d, h]) => `${esc(d)}: ${esc(h)}`).join('<br>')],
    ['Телефон', S.phone ? `<a href="tel:${esc(S.phone.replace(/\s/g, ''))}">${esc(S.phone)}</a>` : '—'],
  ].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  $('#mapLink').href = S.mapUrl;

  const posts = (window.POSTS || []).slice(0, 3);
  $('#latestPosts').innerHTML = posts.map(p => `
    <a class="post-card" href="blog.html#${esc(p.id)}">
      <div class="post-img">${p.img ? `<img src="${esc(p.img)}" alt="" loading="lazy">` : ''}</div>
      <div class="post-body"><span class="post-kind">${esc(p.kind)}</span><h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p></div>
    </a>`).join('');

  renderControls(); renderGrid();
})();
