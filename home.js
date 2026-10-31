(() => {
  const PRODUCTS = window.PRODUCTS || [];
  const { SHOP: S, CATS, esc, Motion } = window;
  const { imgHTML, priceHTML, meta, plural } = window.ProductUI;
  const $ = s => document.querySelector(s);
  const root = document.documentElement;
  const count = c => PRODUCTS.filter(p => p.cat === c).length;

  // ---------- Intro tour ----------
  // Shelves are drawn in CSS so the tour works without loading any photos.
  const SHELVES = {
    perfume: [
      ['perf', 5, 8, '#c98a3a'], ['perf round', 6, 7, '#b4566a'], ['perf', 4, 10, '#e7d8c0'], ['perf', 5, 9, '#2f2a3a'],
      ['perf round', 7, 6, '#7c3b52'], ['perf', 4, 8, '#d9a441'], ['perf', 6, 9, '#3c5e7a'], ['perf round', 5, 7, '#e8b98a'],
    ],
    hair: [
      ['tube', 4, 12, '#efe6d6'], ['tube', 4, 10, '#6f9f90'], ['jar', 8, 5, '#2b3c38'], ['tube', 3, 13, '#1f1c1a'],
      ['tube', 4, 11, '#c0d8cf'], ['jar', 7, 4, '#8fbfae'], ['tube', 4, 12, '#3f6b5f'], ['tube', 3, 9, '#ede1c9'],
    ],
    makeup: [
      ['lip', 2, 6, '#c2334f'], ['compact', 8, 3, '#e8b7a3'], ['lip', 2, 7, '#e07d8e'], ['pal', 9, 7, '#c27a5a'],
      ['brush', 1, 9, '#d8b48a'], ['lip', 2, 6, '#8e1f3a'], ['compact', 7, 3, '#f0cbb8'], ['lip', 2, 7, '#d65a6f'],
    ],
    gift: [
      ['box', 8, 7, '#5b3f8c'], ['voucher', 10, 6, ''], ['wood', 6, 9, ''], ['resin', 7, 6, ''],
      ['box', 6, 5, '#8c3f55'], ['wood', 9, 4, ''], ['box', 7, 8, '#2f4f6a'], ['resin', 5, 8, ''],
    ],
  };
  function buildShelves() {
    $('#inTrack').innerHTML = Object.entries(SHELVES).map(([cat, items], i) => {
      const t0 = (1.85 + i * 0.9).toFixed(2) + 's';
      const rows = [0, 1, 2].map(r => {
        const row = Array.from({ length: 7 - r % 2 }, (_, k) => items[(k + r * 3) % items.length]);
        return `<div class="in-plank">${row.map(([type, w, h, c], k) =>
          `<i class="it ${type}" style="--w:${w};--h:${h};--c:${c || 'transparent'};--c2:${c};--k:${k + r * 7};--t0:${t0}"></i>`).join('')}</div>`;
      }).join('');
      return `<div class="in-shelf" style="--accent:${CATS[cat].accent}">
        <div class="in-unit" style="--i:${i}">
          <div class="in-label"><small>0${i + 1} · ${plural(count(cat), 'продукт', 'продукта')}</small><b>${esc(CATS[cat].title)}</b></div>
          ${rows}
        </div></div>`;
    }).join('');
  }

  function startHero() { document.body.classList.add('hero-go'); }
  const intro = $('#intro');
  if (root.classList.contains('intro-on')) {
    buildShelves();
    let finished = false;
    const finish = fade => {
      if (finished) return; finished = true;
      try { sessionStorage.setItem('sentiva-intro', '1'); } catch {}
      startHero();
      const cleanup = () => { intro.remove(); root.classList.remove('intro-on'); };
      if (fade) { intro.classList.add('done'); setTimeout(cleanup, 500); } else cleanup();
    };
    requestAnimationFrame(() => intro.classList.add('play'));
    setTimeout(startHero, 6900);
    setTimeout(() => finish(false), 7600);
    $('#inSkip').addEventListener('click', () => finish(true));
    addEventListener('keydown', e => { if (e.key === 'Escape') finish(true); });
    $('#inSkip').focus({ preventScroll: true });
  } else {
    intro.remove();
    requestAnimationFrame(() => requestAnimationFrame(startHero));
  }

  // ---------- Scroll-linked motion: hero parallax, floating art ----------
  if (!Motion.reduced) {
    const hero = $('.hero'), parallax = [...document.querySelectorAll('[data-parallax]')];
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = scrollY, h = hero.offsetHeight;
      if (y < h * 1.2) {
        hero.style.setProperty('--hero-y', `${y * 0.3}px`);
        hero.style.setProperty('--hero-text-y', `${y * 0.15}px`);
        hero.style.setProperty('--hero-fade', Math.max(0, 1 - y / (h * 0.8)).toFixed(3));
      }
      for (const el of parallax) {
        const r = el.getBoundingClientRect();
        const off = (r.top + r.height / 2 - innerHeight / 2) * -0.08;
        el.style.setProperty('--py', `${off.toFixed(1)}px`);
      }
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  // ---------- Category mosaic ----------
  const ARROW = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  $('#catGrid').innerHTML = Object.entries(CATS).map(([k, c]) => `
    <a class="cat-tile" href="categories.html#${k}" style="--accent:${c.accent}">
      <div class="cat-in">
        <img src="${esc(c.cover)}" alt="" loading="lazy"${k === 'gift' ? ' style="background:#fff"' : ''}>
        <span class="cat-label"><span><b>${esc(c.title)}</b><small>${plural(count(k), 'продукт', 'продукта')}</small></span><span class="cat-arrow">${ARROW}</span></span>
      </div>
    </a>`).join('');
  if (!Motion.reduced && matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.cat-tile').forEach(tile => {
      const inner = tile.firstElementChild;
      tile.addEventListener('pointermove', e => {
        const r = tile.getBoundingClientRect();
        inner.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - .5) * 8}deg`);
        inner.style.setProperty('--rx', `${((e.clientY - r.top) / r.height - .5) * -8}deg`);
      });
      tile.addEventListener('pointerleave', () => { inner.style.setProperty('--rx', '0deg'); inner.style.setProperty('--ry', '0deg'); });
    });
  }

  // ---------- Featured products rail ----------
  // A few photographed products from every category, interleaved.
  const picks = Object.keys(CATS).map(c => PRODUCTS.filter(p => p.cat === c && p.img).slice(0, 4));
  const featured = [];
  for (let i = 0; i < 4; i++) picks.forEach(list => list[i] && featured.push(list[i]));
  const rail = $('#rail');
  rail.innerHTML = featured.map((p, i) => `
    <article class="f-card" data-reveal="right" style="--d:${Math.min(i, 5) * 80}ms">
      <a class="f-link" href="products.html?p=${esc(p.id)}" draggable="false">
        <div class="f-img">${imgHTML(p)}</div>
        <div class="f-body"><span class="card-brand">${esc(p.brand)}</span><b>${esc(p.display)}</b><span class="muted small">${esc(meta(p))}</span></div>
      </a>
      <div class="f-foot">${priceHTML(p)}<button class="btn btn-ghost btn-sm" type="button" data-ask="${esc(p.id)}">Попитай</button></div>
    </article>`).join('');
  document.querySelectorAll('[data-rail]').forEach(b => b.addEventListener('click', () =>
    rail.scrollBy({ left: +b.dataset.rail * Math.min(rail.clientWidth * .8, 800), behavior: 'smooth' })));
  // Drag to scroll with a mouse; touch devices scroll natively.
  let drag = null;
  rail.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && !e.target.closest('button')) drag = { x: e.clientX, left: rail.scrollLeft, moved: false }; });
  addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 5) { drag.moved = true; rail.classList.add('dragging'); }
    rail.scrollLeft = drag.left - dx;
  });
  addEventListener('pointerup', () => { if (drag) { setTimeout(() => rail.classList.remove('dragging'), 0); drag = null; } });

  // ---------- Brands marquee & numbers ----------
  const brandOrder = ['KEEN', 'C:EHKO', 'ANEA', 'DIFIABA', 'IMPALA', 'ORYX', 'BROOKLIN', 'Montblanc', 'Versace', 'Paco Rabanne', 'Carolina Herrera', 'Dolce & Gabbana', 'Calvin Klein', 'Boucheron', 'Roberto Cavalli', 'Armaf', 'Lattafa'];
  const present = new Set(PRODUCTS.map(p => p.brand));
  const brands = brandOrder.filter(b => present.has(b));
  const items = brands.map(b => `<li><a href="products.html?brand=${encodeURIComponent(b)}" style="text-decoration:none">${esc(b)}</a></li>`).join('');
  $('#brandList').innerHTML = items + items.replace(/<li>/g, '<li aria-hidden="true">').replace(/<a /g, '<a tabindex="-1" ');
  $('#nProducts').dataset.count = PRODUCTS.length;
  // Own products and the mixed "Arabian Collection" group are not counted as brands.
  $('#nBrands').dataset.count = [...present].filter(b => !/^SENTIVA|^Arabian Collection$/.test(b)).length;

  // ---------- Visit & blog ----------
  $('#visitInfo').innerHTML = [
    ['Адрес', `${esc(S.address)}, ${esc(S.city)}`],
    ['Работно време', S.hours.map(([d, h]) => `${esc(d)}: ${esc(h)}`).join('<br>')],
    S.phone && ['Телефон', `<a href="tel:${esc(S.phone.replace(/\s/g, ''))}">${esc(S.phone)}</a>`],
    ['Запитвания', '<button class="link-btn" type="button" data-ask>Пишете ни от сайта</button>'],
  ].filter(Boolean).map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  $('#mapLink').href = S.mapUrl;

  $('#latestPosts').innerHTML = (window.POSTS || []).slice(0, 3).map(p => `
    <a class="post-card" href="blog.html#${esc(p.id)}">
      <div class="post-img">${p.img ? `<img src="${esc(p.img)}" alt="" loading="lazy">` : ''}</div>
      <div class="post-body"><span class="post-kind">${esc(p.kind)}</span><h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p></div>
    </a>`).join('');
})();
