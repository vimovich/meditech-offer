/* MEDITECH template — shared behaviour. No dependencies. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const D = window.MT_DATA || { products: [], categories: [], brands: [], i18n: {}, base: './' };
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.remove('no-js');

  /* ---------- Language ---------- */
  let lang = 'ru';
  try { lang = localStorage.getItem('mt_lang') || 'ru'; } catch (e) {}
  const t = (k) => (D.i18n[lang] && D.i18n[lang][k]) || (D.i18n.ru && D.i18n.ru[k]) || k;
  function applyLang() {
    document.documentElement.lang = lang === 'uz' ? 'uz-Latn' : lang;
    $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    $$('[data-i18n-label]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nLabel)); });
    $$('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  }
  $$('.lang button').forEach((b) => b.addEventListener('click', () => {
    lang = b.dataset.lang; try { localStorage.setItem('mt_lang', lang); } catch (e) {}
    applyLang(); renderPicker(); renderCalc();
  }));

  /* ---------- Header / mobile nav ---------- */
  const header = $('.header');
  const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  const burger = $('.burger'), mnav = $('.mobile-nav');
  if (burger && mnav) {
    burger.addEventListener('click', () => {
      const open = burger.getAttribute('aria-expanded') !== 'true';
      burger.setAttribute('aria-expanded', String(open));
      mnav.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      $$('.mn-link', mnav).forEach((a, i) => { a.style.transitionDelay = open ? (60 + i * 50) + 'ms' : '0ms'; });
    });
  }

  /* ---------- Image fallback ---------- */
  $$('.ph img').forEach((im) => {
    im.addEventListener('error', () => { const ph = im.closest('.ph'); if (ph && !ph.closest('.cta-bg')) { ph.classList.add('is-missing'); ph.setAttribute('data-alt', im.alt || ''); if (!ph.textContent.trim()) ph.insertAdjacentHTML('beforeend', '<span>' + (im.alt || 'Фото') + '</span>'); } }, { once: true });
  });

  /* ---------- Reveal ---------- */
  const revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    revealEls.forEach((el) => io.observe(el));
  } else { revealEls.forEach((el) => el.classList.add('is-in')); }
  // Stagger children inside groups
  $$('[data-stagger]').forEach((g) => { Array.from(g.children).forEach((c, i) => { c.style.setProperty('--d', (i * (parseInt(g.dataset.stagger, 10) || 80)) + 'ms'); if (!c.hasAttribute('data-reveal')) c.setAttribute('data-reveal', ''); }); });
  // Re-observe late-added reveal children
  if (!reduce && 'IntersectionObserver' in window) {
    const io2 = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io2.unobserve(en.target); } }), { rootMargin: '0px 0px -10% 0px' });
    $$('[data-stagger] > [data-reveal]:not(.is-in)').forEach((el) => io2.observe(el));
  } else { $$('[data-reveal]').forEach((el) => el.classList.add('is-in')); }

  // Safety net: anything already above the fold line is shown (covers fast programmatic scrolls)
  let pending = false;
  const sweep = () => { pending = false; const lim = window.innerHeight * 0.95; $$('[data-reveal]:not(.is-in)').forEach((el) => { if (el.getBoundingClientRect().top < lim) el.classList.add('is-in'); }); };
  window.addEventListener('scroll', () => { if (!pending) { pending = true; requestAnimationFrame(sweep); } }, { passive: true });
  setTimeout(sweep, 300);

  // Signature: shutter on the hero picture
  window.addEventListener('load', () => { $$('.shutter').forEach((el, i) => setTimeout(() => el.classList.add('is-open'), 120 + i * 180)); });

  // Counters
  $$('.counter').forEach((el) => {
    const end = parseFloat(el.dataset.to || el.textContent), suffix = el.dataset.suffix || '';
    if (reduce || isNaN(end)) return;
    const io = new IntersectionObserver((es) => { es.forEach((en) => { if (!en.isIntersecting) return; io.disconnect();
      const t0 = performance.now(), dur = 1200;
      const step = (now) => { const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(end * e) + suffix; if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step); }); });
    io.observe(el);
  });

  /* ---------- Advantages hover description ---------- */
  const advDesc = $('.adv-desc p');
  if (advDesc) {
    const items = $$('.adv-group li[data-desc]');
    const show = (li) => { items.forEach((x) => x.classList.toggle('is-active', x === li)); advDesc.style.opacity = 0; setTimeout(() => { advDesc.textContent = li.dataset.desc; advDesc.style.opacity = 1; }, 120); };
    items.forEach((li) => { li.addEventListener('mouseenter', () => show(li)); li.addEventListener('focus', () => show(li)); li.tabIndex = 0; });
    if (items[0]) show(items[0]);
  }

  /* ---------- Equipment picker (live thing) ---------- */
  const PICK = {
    profiles: { ru: { clinic: 'Многопрофильная клиника', lab: 'Лаборатория', dent: 'Стоматология', diag: 'Диагностический центр', icu: 'Реанимация / ОРИТ' },
                uz: { clinic: 'Ko‘p tarmoqli klinika', lab: 'Laboratoriya', dent: 'Stomatologiya', diag: 'Diagnostika markazi', icu: 'Reanimatsiya / ORIT' },
                en: { clinic: 'Multi-profile clinic', lab: 'Laboratory', dent: 'Dental practice', diag: 'Diagnostic centre', icu: 'ICU' } },
    scales: { ru: { s: '1 кабинет', m: 'Отделение', l: 'Клиника под ключ' }, uz: { s: '1 kabinet', m: 'Bo‘lim', l: 'To‘liq klinika' }, en: { s: '1 room', m: 'Department', l: 'Turnkey clinic' } },
    sets: {
      clinic: [['mindray-resona-i9', 1, 2, 4], ['fujifilm-fdr-smart-x', 0, 1, 1], ['mindray-beneview-n17', 1, 4, 12], ['sysmex-xn-1000', 0, 1, 1], ['bed-ward-2', 2, 10, 60], ['getinge-hs66', 0, 1, 2]],
      lab: [['sysmex-xn-1000', 1, 1, 2], ['roche-cobas-c311', 0, 1, 2], ['mindray-bc-6800', 0, 0, 1], ['olympus-cx43', 1, 2, 4], ['getinge-46-series', 0, 1, 1]],
      dent: [['planmeca-compact-i5', 1, 3, 8], ['planmeca-promax-3d', 0, 1, 1], ['getinge-hs66', 0, 1, 1], ['cabinet-med', 1, 3, 8]],
      diag: [['mindray-resona-i9', 1, 2, 3], ['ge-voluson-e10', 0, 1, 1], ['siemens-somatom-go-top', 0, 1, 1], ['canon-vantage-orian', 0, 0, 1], ['fujifilm-fdr-smart-x', 0, 1, 1]],
      icu: [['mindray-beneview-n17', 1, 6, 12], ['draeger-evita-v800', 1, 4, 8], ['mindray-benefusion-u8', 2, 12, 24], ['bed-functional-4', 1, 6, 12], ['draeger-perseus-a500', 0, 1, 2]],
    },
  };
  let pick = { profile: 'clinic', scale: 'm' };
  const pickRoot = $('.picker');
  function renderPicker() {
    if (!pickRoot) return;
    const pc = $('[data-pick="profile"]', pickRoot), sc = $('[data-pick="scale"]', pickRoot), out = $('.picker-result ol', pickRoot), tot = $('.picker-total', pickRoot);
    const mk = (map, key, cur) => Object.keys(map).map((k) => `<button class="chip" type="button" data-${key}="${k}" aria-pressed="${k === cur}">${map[k]}</button>`).join('');
    pc.innerHTML = mk(PICK.profiles[lang] || PICK.profiles.ru, 'profile', pick.profile);
    sc.innerHTML = mk(PICK.scales[lang] || PICK.scales.ru, 'scale', pick.scale);
    const idx = { s: 1, m: 2, l: 3 }[pick.scale];
    const rows = PICK.sets[pick.profile].map(([slug, ...q]) => [D.products.find((p) => p.slug === slug), q[idx - 1]]).filter(([p, n]) => p && n > 0);
    out.innerHTML = rows.map(([p, n]) => `<li><a href="${D.base}${p.url}">${p.name}</a><span>× ${n}</span></li>`).join('');
    const total = rows.reduce((a, [, n]) => a + n, 0);
    tot.textContent = { ru: `${rows.length} позиций · ${total} единиц оборудования`, uz: `${rows.length} pozitsiya · ${total} birlik uskuna`, en: `${rows.length} items · ${total} units` }[lang];
    const ctx = `${(PICK.profiles[lang] || PICK.profiles.ru)[pick.profile]} · ${(PICK.scales[lang] || PICK.scales.ru)[pick.scale]}`;
    $('.picker-result .btn', pickRoot).dataset.ctx = ctx;
  }
  if (pickRoot) {
    pickRoot.addEventListener('click', (e) => {
      const b = e.target.closest('.chip'); if (!b) return;
      if (b.dataset.profile) pick.profile = b.dataset.profile; if (b.dataset.scale) pick.scale = b.dataset.scale;
      renderPicker();
      const list = $('.picker-result ol', pickRoot); list.style.opacity = 0; requestAnimationFrame(() => { list.style.transition = 'opacity .35s'; list.style.opacity = 1; });
    });
    renderPicker();
  }

  /* ---------- Search ---------- */
  const sInput = $('#catalog-search'), sRes = $('.search-results');
  const norm = (s) => (s || '').toLowerCase().replace(/ё/g, 'е');
  function search(q) {
    q = norm(q.trim()); if (q.length < 2) { sRes.classList.remove('is-open'); return; }
    const hits = D.products.filter((p) => norm(p.name + ' ' + p.short + ' ' + p.brandName + ' ' + p.catName).includes(q)).slice(0, 6);
    const cats = D.categories.filter((c) => norm(c.name).includes(q)).slice(0, 2);
    let html = cats.map((c) => `<a href="${D.base}${c.url}"><span class="ph is-missing"><span>${c.short.slice(0, 2)}</span></span><span>${c.name}</span><span class="small muted">${t('nav.catalog')}</span></a>`).join('');
    html += hits.map((p) => `<a href="${D.base}${p.url}"><span class="ph"><img src="${p.thumb}" alt="" width="56" height="56" loading="lazy"></span><span>${p.name}</span><span class="status small" data-status="${p.status}">${t('status.' + p.status)}</span></a>`).join('');
    sRes.innerHTML = html || `<div class="empty">${t('search.empty')}</div>`;
    sRes.classList.add('is-open');
  }
  if (sInput && sRes) {
    sInput.addEventListener('input', () => search(sInput.value));
    sInput.closest('form').addEventListener('submit', (e) => { e.preventDefault(); search(sInput.value); if (sInput.value.trim().length < 2) location.href = D.base + 'catalog/'; });
    $$('.search-hint button').forEach((b) => b.addEventListener('click', () => { sInput.value = b.textContent; search(b.textContent); sInput.focus(); }));
    document.addEventListener('click', (e) => { if (!e.target.closest('.search')) sRes.classList.remove('is-open'); });
  }

  /* ---------- Catalog filters ---------- */
  const flt = $('.filters');
  if (flt) {
    const grid = $('.products'), cards = $$('.card', grid), found = $('.found b', flt);
    const sel = { brand: $('[name="brand"]', flt), status: $('[name="status"]', flt), sub: $('[name="sub"]', flt) };
    const apply = () => {
      let n = 0;
      cards.forEach((c) => {
        const ok = (!sel.brand || !sel.brand.value || c.dataset.brand === sel.brand.value) && (!sel.status || !sel.status.value || c.dataset.status === sel.status.value) && (!sel.sub || !sel.sub.value || c.dataset.sub === sel.sub.value);
        c.style.display = ok ? '' : 'none'; if (ok) n++;
      });
      if (found) found.textContent = n;
      let empty = $('.empty', grid); if (!n && !empty) { empty = document.createElement('p'); empty.className = 'empty'; empty.textContent = t('search.empty'); grid.appendChild(empty); } else if (n && empty) empty.remove();
    };
    Object.values(sel).forEach((s) => s && s.addEventListener('change', apply));
    $('.filters [type="reset"]', flt) && $('.filters [type="reset"]', flt).addEventListener('click', (e) => { e.preventDefault(); Object.values(sel).forEach((s) => s && (s.value = '')); apply(); });
    const params = new URLSearchParams(location.search); if (params.get('sub') && sel.sub) sel.sub.value = params.get('sub');
    apply();
  }

  /* ---------- Leasing calculator ---------- */
  const calc = $('.calc');
  function renderCalc() {
    if (!calc) return;
    const sum = +$('#c-sum').value, months = +$('#c-months').value, adv = +$('#c-adv').value;
    const fmt = (n) => Math.round(n).toLocaleString('ru-RU');
    $('#c-sum-out').textContent = fmt(sum) + ' USD';
    $('#c-months-out').textContent = months + ({ ru: ' мес.', uz: ' oy', en: ' mo.' }[lang]);
    $('#c-adv-out').textContent = adv + '%';
    const principal = sum * (1 - adv / 100), rate = 0.18 / 12; // indicative annual rate 18%
    const pay = principal * rate / (1 - Math.pow(1 + rate, -months));
    $('#c-pay').textContent = fmt(pay) + ' USD';
    $('#c-first').textContent = fmt(sum * adv / 100) + ' USD';
    $('#c-total').textContent = fmt(pay * months + sum * adv / 100) + ' USD';
  }
  if (calc) { $$('input[type="range"]', calc).forEach((r) => r.addEventListener('input', renderCalc)); renderCalc(); }

  /* ---------- Forms ---------- */
  const phoneOk = (v) => /^\+?998[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/.test(v.trim()) || /^\+?\d{9,15}$/.test(v.replace(/[\s-()]/g, ''));
  function formatPhone(input) {
    input.addEventListener('focus', () => { if (!input.value) input.value = '+998 '; });
    input.addEventListener('blur', () => { if (input.value.trim() === '+998') input.value = ''; });
  }
  $$('input[type="tel"]').forEach(formatPhone);
  function handleForm(form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if ($('.hp input', form) && $('.hp input', form).value) return; // honeypot
      let ok = true;
      const name = $('[name="name"]', form), phone = $('[name="phone"]', form);
      [[name, (v) => v.trim().length >= 2], [phone, phoneOk]].forEach(([inp, test]) => {
        if (!inp) return; const f = inp.closest('.field'); const good = test(inp.value); f.classList.toggle('is-error', !good); if (!good) ok = false;
      });
      if (!ok) { ($('.is-error input', form) || {}).focus && $('.is-error input', form).focus(); return; }
      const payload = Object.fromEntries(new FormData(form).entries());
      payload.page = location.pathname; payload.source = form.dataset.source || document.title; payload.lang = lang; payload.ts = new Date().toISOString();
      // Integration point: POST payload to CRM + Telegram bot (serverless function). Template logs it.
      console.info('[MEDITECH lead]', payload);
      if (window.dataLayer) window.dataLayer.push({ event: 'lead_submit', form: payload.source });
      form.classList.add('is-sent');
    });
  }
  $$('form.form').forEach(handleForm);

  // Lead magnet
  const leadForm = $('.lead-grid form');
  if (leadForm) leadForm.addEventListener('submit', (e) => {
    e.preventDefault(); const inp = $('input', leadForm); if (!phoneOk(inp.value)) { inp.focus(); inp.style.outline = '2px solid #b3261e'; return; }
    console.info('[MEDITECH lead-magnet]', { phone: inp.value, page: location.pathname });
    leadForm.outerHTML = `<p class="ok lead">${t('form.ok.text')}</p>`;
  });

  /* ---------- Modal ---------- */
  const modal = $('.modal');
  let lastFocus = null;
  function openModal(ctx, source) {
    if (!modal) return; lastFocus = document.activeElement;
    const c = $('.ctx', modal); c.textContent = ctx || ''; c.style.display = ctx ? '' : 'none';
    const f = $('form', modal); f.classList.remove('is-sent'); f.reset(); f.dataset.source = source || 'modal'; $$('.is-error', f).forEach((x) => x.classList.remove('is-error'));
    const hid = $('[name="context"]', f); if (hid) hid.value = ctx || '';
    modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden';
    setTimeout(() => { const first = $('input', f); first && first.focus(); }, 60);
  }
  function closeModal() { if (!modal) return; modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; lastFocus && lastFocus.focus && lastFocus.focus(); }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-modal]'); if (b) { e.preventDefault(); openModal(b.dataset.ctx || b.dataset.modal === 'true' ? b.dataset.ctx : b.dataset.modal, b.dataset.source || b.textContent.trim()); return; }
    if (e.target.closest('.modal-close') || e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  applyLang();
})();
