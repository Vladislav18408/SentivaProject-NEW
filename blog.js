(() => {
  const $ = s => document.querySelector(s);
  const { esc, eur, Cart } = window;
  const POSTS = window.POSTS || [], REVIEWS = window.REVIEWS || [], PRODUCTS = window.PRODUCTS || [];
  const fmtDate = iso => new Date(iso + 'T12:00').toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' });
  let kind = '';

  function renderList() {
    const kinds = [...new Set(POSTS.map(p => p.kind))];
    $('#kinds').innerHTML = ['', ...kinds].map(k => `<button class="chip" data-kind="${esc(k)}" aria-pressed="${kind === k}">${k || 'Всички'}</button>`).join('');
    $('#posts').innerHTML = POSTS.filter(p => !kind || p.kind === kind).map(p => `
      <a class="post-card" href="#${esc(p.id)}">
        <div class="post-img">${p.img ? `<img src="${esc(p.img)}" alt="" loading="lazy">` : ''}</div>
        <div class="post-body"><span class="post-kind">${esc(p.kind)} · ${fmtDate(p.date)}</span><h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p></div>
      </a>`).join('');
  }
  $('#kinds').addEventListener('click', e => { const b = e.target.closest('[data-kind]'); if (b) { kind = b.dataset.kind; renderList(); } });

  function showPost(id) {
    const p = POSTS.find(x => x.id === id);
    $('#listView').hidden = !!p; $('#postView').hidden = !p;
    if (!p) { document.title = 'Блог и ревюта — SENTIVA Beauty Bar'; return; }
    document.title = `${p.title} — SENTIVA Beauty Bar`;
    $('#pKind').textContent = p.kind;
    $('#pTitle').textContent = p.title;
    $('#pDate').textContent = fmtDate(p.date);
    $('#pImg').src = p.img || ''; $('#pImg').hidden = !p.img;
    $('#pBody').innerHTML = p.body; // trusted, written by the shop in blog-data.js
    const prods = p.products.map(id => PRODUCTS.find(x => x.id === id)).filter(Boolean);
    $('#pProducts').innerHTML = prods.length ? `<h3 class="rel-title">Продуктите от статията</h3><div class="rel-grid">${prods.map(x => `
      <div class="rel">
        <div class="thumb">${x.img ? `<img src="${esc(x.img)}" alt="">` : ''}</div>
        <div><span class="card-brand">${esc(x.brand)}</span><b>${esc(x.display)}</b><span class="price">${x.price != null ? eur(x.price) : ''}</span></div>
        ${x.price != null ? `<button class="btn btn-gold btn-sm" data-add="${esc(x.id)}">Купи</button>` : ''}
      </div>`).join('')}</div>` : '';
    window.scrollTo(0, 0);
  }
  $('#pProducts').addEventListener('click', e => { const b = e.target.closest('[data-add]'); if (b) Cart.add(b.dataset.add); });
  $('#back').addEventListener('click', e => { e.preventDefault(); history.pushState(null, '', 'blog.html'); showPost(null); });
  window.addEventListener('hashchange', () => showPost(location.hash.slice(1)));

  // ---------- Reviews ----------
  $('#reviewList').innerHTML = REVIEWS.length ? REVIEWS.map(r => `
    <figure class="review">
      <div class="rating" aria-label="${r.rating} от 5">${'★'.repeat(r.rating)}<span>${'★'.repeat(5 - r.rating)}</span></div>
      <blockquote>${esc(r.text)}</blockquote>
      <figcaption><b>${esc(r.name)}</b>${r.product ? ` · ${esc(r.product)}` : ''}<span class="muted"> · ${fmtDate(r.date)}</span></figcaption>
    </figure>`).join('')
    : `<div class="empty-state small-pad"><p>Все още няма публикувани отзиви. Пазарували сте при нас? Бъдете първите, които ще споделят мнението си!</p></div>`;
  $('#productNames').innerHTML = PRODUCTS.map(p => `<option value="${esc(p.display)}">`).join('');

  const form = $('#reviewForm');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const err = $('#reviewError');
    if (!form.checkValidity()) { err.textContent = 'Моля, попълнете име, отзив и съгласие за публикуване.'; err.hidden = false; return; }
    err.hidden = true;
    try {
      const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(form)).toString() });
      if (!res.ok) throw new Error(res.status);
      form.innerHTML = '<h3>Благодарим за отзива!</h3><p class="muted">Ще го публикуваме след преглед.</p>';
    } catch {
      err.textContent = 'Отзивът не можа да бъде изпратен. Моля, опитайте по-късно или ни пишете в Instagram.';
      err.hidden = false;
    }
  });

  renderList();
  showPost(location.hash.slice(1));
})();
