(() => {
  const PRODUCTS = window.PRODUCTS || [];
  const { CATS, esc, Motion } = window;
  const { imgHTML, plural } = window.ProductUI;
  const $ = s => document.querySelector(s);
  const entries = Object.entries(CATS);
  const ofCat = k => PRODUCTS.filter(p => p.cat === k);
  const num = i => String(i + 1).padStart(2, '0');
  const ARROW = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const link = (k, extra = {}) => 'products.html?' + new URLSearchParams({ cat: k, ...extra });

  // ---------- Expanding panels ----------
  $('#worlds').innerHTML = entries.map(([k, c], i) => `
    <a class="world${i ? '' : ' active'}" href="#${k}" style="--accent:${c.accent}" data-reveal="clip" data-world>
      <img src="${esc(c.cover)}" alt="" loading="${i ? 'lazy' : 'eager'}">
      <span class="w-shade"></span>
      <span class="w-num">${num(i)}</span>
      <span class="w-title">${esc(c.short)}</span>
      <span class="w-open">
        <b>${esc(c.title)}</b>
        <span>${plural(ofCat(k).length, 'продукт', 'продукта')}</span>
        <span class="w-go">Разгледай ${ARROW}</span>
      </span>
    </a>`).join('');
  document.querySelectorAll('[data-world]').forEach((w, i) => {
    w.style.setProperty('--d', `${i * 120}ms`);
    const activate = () => document.querySelectorAll('[data-world]').forEach(x => x.classList.toggle('active', x === w));
    w.addEventListener('mouseenter', activate);
    w.addEventListener('focus', activate);
  });

  // ---------- Chapters ----------
  $('#chapters').innerHTML = entries.map(([k, c], i) => {
    const items = ofCat(k);
    const subs = c.chips.map(s => ({ s, list: items.filter(p => p[c.chipKey] === s) })).filter(x => x.list.length);
    const brands = [...new Set(items.map(p => p.brand))].sort((a, b) => a.localeCompare(b));
    const strip = items.filter(p => p.img).slice(0, 4);
    return `
    <section class="chapter${i % 2 ? ' flip' : ''}" id="${k}" style="--accent:${c.accent}" data-chapter aria-labelledby="ch-${k}">
      <span class="ch-ghost" aria-hidden="true">${num(i)}</span>
      <div class="wrap chapter-in">
        <div class="ch-side" data-reveal="${i % 2 ? 'right' : 'left'}">
          <span class="ch-num">${num(i)} / 0${entries.length}</span>
          <h2 id="ch-${k}">${esc(c.title)}</h2>
          <p>${esc(c.blurb)}</p>
          <p class="ch-count"><b data-count="${items.length}">0</b> продукта · <b data-count="${brands.length}">0</b> ${brands.length === 1 ? 'марка' : 'марки'}</p>
          <a class="ch-btn" href="${link(k)}"><span>Всички ${esc(c.title.toLowerCase())}</span>${ARROW}</a>
        </div>
        <div class="ch-main">
          <ul class="subs" data-stagger="80">
            ${subs.map(({ s, list }) => `
            <li><a class="sub" href="${link(k, { type: s })}">
              <span class="sub-name">${esc(s)}</span>
              <span class="sub-thumbs" aria-hidden="true">${list.filter(p => p.img).slice(0, 3).map(p => `<span>${imgHTML(p)}</span>`).join('')}</span>
              <span class="sub-count">${list.length}</span>
              <span class="sub-arrow">${ARROW}</span>
            </a></li>`).join('')}
          </ul>
          <div class="ch-brands" data-reveal>
            <h3>Марки</h3>
            <div class="b-pills">${brands.map(b => `<a href="${link(k, { brand: b })}">${esc(b)}</a>`).join('')}</div>
          </div>
          ${strip.length ? `<div class="ch-strip" data-stagger="90" data-reveal-child="zoom">${strip.map(p => `
            <a class="strip-item" href="products.html?p=${esc(p.id)}" title="${esc(p.display)}">${imgHTML(p)}<span>${esc(p.display)}</span></a>`).join('')}</div>` : ''}
        </div>
      </div>
    </section>`;
  }).join('');

  // ---------- Side navigation + background tint follow the chapter in view ----------
  $('#chapterNav').innerHTML = entries.map(([k, c], i) =>
    `<a href="#${k}" style="--accent:${c.accent}" data-nav="${k}"><span>${esc(c.short)}</span><i>${num(i)}</i></a>`).join('');
  const nav = $('#chapterNav');
  const chapters = [...document.querySelectorAll('[data-chapter]')];
  const setActive = el => {
    if (el) document.body.style.setProperty('--tint', el.style.getPropertyValue('--accent'));
    else document.body.style.removeProperty('--tint');
    nav.classList.toggle('show', !!el);
    nav.querySelectorAll('a').forEach(a => a.classList.toggle('on', !!el && a.dataset.nav === el.id));
  };
  if ('IntersectionObserver' in window) {
    const seen = new Set();
    const obs = new IntersectionObserver(es => {
      es.forEach(e => e.isIntersecting ? seen.add(e.target) : seen.delete(e.target));
      setActive(chapters.find(c => seen.has(c)));
    }, { rootMargin: '-45% 0px -45% 0px' });
    chapters.forEach(c => obs.observe(c));
  }

  // Big ghost numbers drift slower than the page.
  if (!Motion.reduced) {
    const ghosts = [...document.querySelectorAll('.ch-ghost')];
    let tick = false;
    const run = () => {
      tick = false;
      ghosts.forEach(g => {
        const r = g.parentElement.getBoundingClientRect();
        g.style.translate = `0 ${((r.top + r.height / 2) - innerHeight / 2) * -0.25}px`;
      });
    };
    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }
})();
