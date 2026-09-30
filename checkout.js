(() => {
  const $ = s => document.querySelector(s);
  const { eur, esc, Cart, SHOP } = window;
  const form = $('#orderForm');
  const PICKUP = 'Вземане от магазина';

  const delivery = () => form.delivery.value;
  const freeShipping = () => SHOP.freeShippingFrom != null && Cart.subtotal() >= SHOP.freeShippingFrom;

  function renderSummary() {
    const lines = Cart.lines();
    $('#emptyCart').hidden = !!lines.length;
    $('#checkout').hidden = !lines.length;
    if (!lines.length) return;
    $('#coLines').innerHTML = lines.map(({ p, qty }) => `
      <li><div class="thumb">${p.img ? `<img src="${esc(p.img)}" alt="">` : ''}</div>
      <span>${esc(p.display)} <small class="muted">× ${qty}</small></span><b>${eur(p.price * qty)}</b></li>`).join('');
    const sub = Cart.subtotal();
    $('#coSub').textContent = eur(sub);
    const pickup = delivery() === PICKUP;
    // Courier prices depend on weight and destination, so the courier charges them on delivery.
    $('#coShip').textContent = pickup || freeShipping() ? 'безплатно' : 'по тарифа на куриера';
    $('#coTotal').textContent = eur(sub) + (pickup || freeShipping() ? '' : ' + доставка');
    $('#coShipNote').textContent = pickup ? ''
      : freeShipping() ? 'Поръчката ви е с безплатна доставка.'
      : 'Цената на доставката се заплаща на куриера при получаване.' +
        (SHOP.freeShippingFrom != null ? ` Безплатна доставка над ${eur(SHOP.freeShippingFrom)}.` : '');
  }

  function updateDeliveryFields() {
    const d = delivery(), pickup = d === PICKUP;
    $('#shipFields').hidden = pickup;
    $('#pickupNote').hidden = !pickup;
    form.city.required = form.address.required = !pickup;
    $('#addrText').textContent = d.startsWith('Еконт') ? 'Офис на Еконт *' : d.startsWith('Спиди') ? 'Офис на Спиди *' : 'Адрес (улица, номер, блок, вход, етаж, ап.) *';
    form.address.placeholder = d.includes('офис') ? 'име или адрес на офиса' : 'ул. …, № …';
    $('#payLabel').textContent = pickup ? 'Плащане в магазина' : 'Наложен платеж';
    $('#payHint').textContent = pickup ? 'в брой или с карта при вземане' : 'плащате при получаване на пратката';
    renderSummary();
  }
  $('#pickupAddr').textContent = `${SHOP.address}, ${SHOP.city}`;
  $('#shipOpts').addEventListener('change', updateDeliveryFields);

  function orderText(id) {
    const f = new FormData(form);
    const lines = Cart.lines().map(({ p, qty }) => `• ${p.display} × ${qty} — ${eur(p.price * qty)}`);
    return [
      `Поръчка ${id}`, ...lines, `Продукти: ${eur(Cart.subtotal())}`, '',
      `Име: ${f.get('name')}`, `Телефон: ${f.get('phone')}`, f.get('email') && `Имейл: ${f.get('email')}`,
      `Доставка: ${f.get('delivery')}`,
      delivery() !== PICKUP && `Адрес: ${f.get('city')} ${f.get('postcode') || ''}, ${f.get('address')}`,
      `Плащане: ${delivery() === PICKUP ? 'в магазина' : 'наложен платеж'}`,
      f.get('note') && `Бележка: ${f.get('note')}`,
    ].filter(Boolean).join('\n');
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const err = $('#formError');
    if (!form.checkValidity()) {
      const bad = form.querySelector(':invalid');
      err.textContent = bad?.name === 'consent' ? 'Моля, приемете Общите условия.' : 'Моля, попълнете задължителните полета (*).';
      err.hidden = false; bad?.focus(); return;
    }
    err.hidden = true;
    const d = new Date();
    const id = `SNT-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    form['order-id'].value = id;
    form['order-items'].value = Cart.lines().map(({ p, qty }) => `${p.display} × ${qty} = ${eur(p.price * qty)}`).join('\n');
    form['order-total'].value = eur(Cart.subtotal());
    const text = orderText(id);

    const btn = $('#submitBtn');
    btn.disabled = true; btn.textContent = 'Изпращане…';
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString(),
      });
      if (!res.ok) throw new Error(res.status);
      $('#doneId').textContent = id;
      $('#checkout').hidden = true; $('#done').hidden = false;
      Cart.clear();
    } catch {
      // Not hosted on Netlify yet (or offline): let the customer send the order by message instead.
      $('#fallbackText').value = text;
      $('#igLink').href = SHOP.social.instagram;
      $('#checkout').hidden = true; $('#fallback').hidden = false;
    } finally {
      btn.disabled = false; btn.textContent = 'Потвърди поръчката';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  $('#copyOrder').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText($('#fallbackText').value); window.toast('Копирано'); }
    catch { $('#fallbackText').select(); }
  });

  Cart.onChange(() => { if ($('#done').hidden && $('#fallback').hidden) renderSummary(); });
  updateDeliveryFields();
})();
