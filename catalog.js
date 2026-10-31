(() => {
  const PRODUCTS = window.PRODUCTS || [];
  const { CATS, esc, eur, Motion } = window;
  const { find, imgHTML, priceHTML, meta, plural } = window.ProductUI;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  const PRICES = { '0-25': [0, 25], '25-50': [25, 50], '50-': [50, Infinity] };
  const params = new URLSearchParams(location.search);
  const state = {
    cat: CATS[params.get('cat')] ? params.get('cat') : '',
    chip: params.get('type') || '',
    brands: new Set((params.get('brand') || '').split(',').filter(Boolean)),
    price: PRICES[params.get('price')] ? params.get('price') : '',
    q: params.get('q') || '',
    sort: params.get('sort') || '',
  };
  if (!state.cat) state.chip = '';
  const cfg = () => CATS[state.cat];

  function syncURL() {
    const u = new URLSearchParams();
    if (state.cat) u.set('cat', state.cat);
    if (state.chip) u.set('type', state.chip);
    if (state.brands.size) u.set('brand', [...state.brands].join(','));
    if (state.price) u.set('price', state.price);
    if (state.q.trim()) u.set('q', state.q.trim());
    if (state.sort) u.set('sort', state.sort);
    if (openId) u.set('p', openId);
    history.replaceState(null, '', u.toString() ? '?' + u : location.pathname);
  }

  const inCat = () => PRODUCTS.filter(p => !state.cat || p.cat === state.cat);
  function filtered() {
    const q = state.q.trim().toLowerCase();
    const range = PRICES[state.price];
    const list = inCat().filter(p => (!state.chip || p[cfg().chipKey] === state.chip)
      && (!state.brands.size || state.brands.has(p.brand))
      && (!range || (p.price != null && p.price >= range[0] && p.price < range[1]))
      && (!q || [p.display, p.name, p.brand, p.short, p.family, p.sub, p.gender, p.desc?.text].join(' ').toLowerCase().includes(q)));
    if (state.sort === 'asc') list.sort((a, b) => (a.price ?? 1e9) - (b.price ?? 1e9));
    if (state.sort === 'desc') list.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    if (state.sort === 'name') list.sort((a, b) => a.display.localeCompare(b.display, 'bg'));
    return list;
  }

  // ---------- Tabs ----------
  $('#tabs').insertAdjacentHTML('beforeend', [['', 'Всички', PRODUCTS.length], ...Object.entries(CATS).map(([k, c]) => [k, c.short, PRODUCTS.filter(p => p.cat === k).length])]
    .map(([k, label, n]) => `<button type="button" class="cat-tab" data-cat="${k}">${esc(label)}<small>${n}</small></button>`).join(''));
  function moveInk() {
    const active = $(`.cat-tab[data-cat="${state.cat}"]`), ink = $('#tabInk');
    ink.style.width = active.offsetWidth + 'px';
    ink.style.transform = `translateX(${active.offsetLeft}px)`;
  }
  addEventListener('resize', moveInk);

  // ---------- Filters ----------
  function renderControls() {
    const c = cfg();
    $('#pageTitle').textContent = c ? c.title : 'Всички продукти';
    $('#pageSub').textContent = c ? c.blurb : 'Изберете продукт и ни попитайте — ще ви отговорим за наличност, цена и как да го получите.';
    document.title = `${c ? c.title : 'Продукти'} — SENTIVA Beauty Bar`;
    document.body.style.setProperty('--accent', c ? c.accent : 'var(--gold)');
    $$('.cat-tab').forEach(b => b.setAttribute('aria-pressed', b.dataset.cat === state.cat));
    moveInk();

    const items = inCat();
    $('#chipGroup').hidden = !c;
    if (c) {
      $('#chipTitle').textContent = c.chipKey === 'gender' ? 'За кого' : 'Вид';
      const chips = c.chips.filter(ch => items.some(p => p[c.chipKey] === ch));
      $('#chips').innerHTML = ['', ...chips].map(ch => {
        const n = ch ? items.filter(p => p[c.chipKey] === ch).length : items.length;
        return `<button class="chip" type="button" data-chip="${esc(ch)}" aria-pressed="${state.chip === ch}">${ch || 'Всички'} <small>${n}</small></button>`;
      }).join('');
    }
    const brands = [...new Set(items.map(p => p.brand))].sort((a, b) => a.localeCompare(b));
    $('#brands').innerHTML = brands.map(b => `
      <li><label class="check"><input type="checkbox" value="${esc(b)}" ${state.brands.has(b) ? 'checked' : ''}><span>${esc(b)}</span><small>${items.filter(p => p.brand === b).length}</small></label></li>`).join('');
    $$('#priceChips .chip').forEach(b => b.setAttribute('aria-pressed', b.dataset.price === state.price));
    $('#q').value = state.q;
    $('#sort').value = state.sort;
  }

  function renderActive() {
    const tags = [];
    if (state.chip) tags.push(['chip', state.chip]);
    state.brands.forEach(b => tags.push(['brand', b]));
    if (state.price) tags.push(['price', $(`#priceChips [data-price="${state.price}"]`).textContent]);
    if (state.q.trim()) tags.push(['q', `„${state.q.trim()}“`]);
    $('#activeFilters').innerHTML = tags.map(([k, v]) =>
      `<button type="button" class="pill" data-clear="${k}" data-value="${esc(v)}">${esc(v)} <span aria-hidden="true">×</span><span class="sr">премахни</span></button>`).join('');
    $('#filterCount').textContent = tags.length ? `(${tags.length})` : '';
  }

  // ---------- Grid ----------
  function card(p, i) {
    return `
      <article class="card" data-id="${esc(p.id)}" tabindex="0" aria-label="${esc(p.display)}" style="--i:${Math.min(i, 15)}">
        <div class="card-img">
          ${imgHTML(p)}
          ${p.tester ? '<span class="badge">Без кутия</span>' : ''}
          <button class="card-ask" type="button" data-ask="${esc(p.id)}">Попитай за продукта</button>
        </div>
        <div class="card-body">
          <span class="card-brand">${esc(p.brand)}</span>
          <h3 class="card-name">${esc(p.display)}</h3>
          <span class="card-meta">${esc(meta(p))}</span>
          <span class="card-foot">${priceHTML(p)}<span class="card-more" aria-hidden="true">Детайли →</span></span>
        </div>
      </article>`;
  }
  function renderGrid() {
    const list = filtered();
    $('#pageCount').textContent = list.length;
    $('#resultCount').textContent = plural(list.length, 'продукт', 'продукта');
    $('#grid').innerHTML = list.length ? list.map(card).join('') : `
      <div class="empty">
        <h3>Не намираме такъв продукт</h3>
        <p>Опитайте с друго търсене — или ни пишете. Ако го нямаме, може да го поръчаме специално за вас.</p>
        <button class="btn btn-gold" type="button" data-ask>Попитайте ни</button>
      </div>`;
    renderActive(); syncURL();
  }
  const update = () => { renderControls(); renderGrid(); };

  $('#tabs').addEventListener('click', e => {
    const b = e.target.closest('[data-cat]'); if (!b) return;
    Object.assign(state, { cat: b.dataset.cat, chip: '' }); state.brands.clear();
    update();
  });
  $('#chips').addEventListener('click', e => { const b = e.target.closest('[data-chip]'); if (b) { state.chip = b.dataset.chip; update(); } });
  $('#brands').addEventListener('change', e => { e.target.checked ? state.brands.add(e.target.value) : state.brands.delete(e.target.value); renderGrid(); });
  $('#priceChips').addEventListener('click', e => { const b = e.target.closest('[data-price]'); if (b) { state.price = b.dataset.price; update(); } });
  $('#q').addEventListener('input', e => { state.q = e.target.value; renderGrid(); });
  $('#sort').addEventListener('change', e => { state.sort = e.target.value; renderGrid(); });
  $('#reset').addEventListener('click', () => { Object.assign(state, { chip: '', price: '', q: '', sort: '' }); state.brands.clear(); update(); });
  $('#activeFilters').addEventListener('click', e => {
    const b = e.target.closest('[data-clear]'); if (!b) return;
    const k = b.dataset.clear;
    if (k === 'brand') state.brands.delete(b.dataset.value); else state[k] = '';
    update();
  });

  // Mobile: filters slide up as a sheet.
  const filters = $('#filters'), scrim = $('#filtersScrim');
  const setFilters = open => { filters.classList.toggle('open', open); scrim.hidden = !open; document.body.classList.toggle('lock', open); };
  $('#filtersOpen').addEventListener('click', () => setFilters(true));
  $('#filtersClose').addEventListener('click', () => setFilters(false));
  scrim.addEventListener('click', () => setFilters(false));

  // ---------- Product sheet ----------
  const sheet = $('#sheet');
  let openId = params.get('p') || '';
  function openSheet(id) {
    const p = find(id); if (!p) return;
    openId = id;
    $('#sImg').innerHTML = imgHTML(p, false);
    $('#sBrand').textContent = p.brand;
    $('#sTitle').textContent = p.display;
    const tags = p.cat === 'perfume'
      ? [p.gender, p.family, p.season, p.volume && p.volume + ' ml', p.tester && 'Без кутия (тестер)']
      : [CATS[p.cat].title, p.sub];
    $('#sTags').innerHTML = tags.filter(Boolean).map(t => `<span>${esc(t)}</span>`).join('');
    $('#sPrice').innerHTML = p.price == null ? '<b>Цена при запитване</b>'
      : `<b>${eur(p.price)}</b>${p.perPiece ? ' <small>/ брой</small>' : ''}<small class="muted">ориентировъчна цена</small>`;
    $('#sAsk').dataset.ask = p.id;
    const d = p.desc || {};
    $('#sText').textContent = d.text || p.short || '';
    $('#sBenefits').innerHTML = d.benefits?.length ? `<h4>Ползи</h4><ul>${d.benefits.map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : '';
    $('#sUsage').innerHTML = d.usage ? `<h4>Начин на употреба</h4><p>${esc(d.usage)}</p>` : '';
    const key = CATS[p.cat].chipKey;
    const similar = PRODUCTS.filter(x => x.cat === p.cat && x.id !== p.id && x[key] === p[key]).slice(0, 4);
    $('#sSimilar').innerHTML = similar.length ? `<h4>Може да харесате още</h4><div class="s-sim-grid">${similar.map(x => `
      <button type="button" class="s-sim" data-open="${esc(x.id)}"><span class="thumb">${imgHTML(x)}</span><span><span class="card-brand">${esc(x.brand)}</span><b>${esc(x.display)}</b></span></button>`).join('')}</div>` : '';
    if (!sheet.open) sheet.showModal();
    sheet.scrollTop = 0;
    sheet.classList.remove('swap'); void sheet.offsetWidth; sheet.classList.add('swap');
    syncURL();
  }
  function closeSheet() {
    sheet.classList.add('closing');
    setTimeout(() => { sheet.close(); sheet.classList.remove('closing'); }, Motion.reduced ? 0 : 280);
  }
  sheet.addEventListener('close', () => { openId = ''; syncURL(); });
  sheet.addEventListener('cancel', e => { e.preventDefault(); closeSheet(); });
  sheet.addEventListener('click', e => {
    if (e.target === sheet || e.target.closest('[data-close]')) return closeSheet();
    const o = e.target.closest('[data-open]'); if (o) openSheet(o.dataset.open);
  });
  $('#sShare').addEventListener('click', async () => {
    const url = location.href, title = $('#sTitle').textContent;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else { await navigator.clipboard.writeText(url); window.toast('Линкът е копиран'); }
    } catch {}
  });

  $('#grid').addEventListener('click', e => { const c = e.target.closest('.card'); if (c) openSheet(c.dataset.id); });
  $('#grid').addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.classList.contains('card')) openSheet(e.target.dataset.id);
  });

  update();
  if (openId) openSheet(openId);
})();
