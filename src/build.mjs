// Static site generator for the MEDITECH template. `node src/build.mjs` → writes HTML into the repo root.
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { img, photo, brands, categories, products, news, faq, projects, company } from './data.mjs';
import { i18n } from './i18n.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://meditech-site-ibragimbeast-7903s-projects.vercel.app';
const brandOf = (slug) => brands.find((b) => b.slug === slug);
const catOf = (slug) => categories.find((c) => c.slug === slug);
const subOf = (cat, sub) => catOf(cat).subs.find((s) => s.slug === sub);
const prodUrl = (p) => `catalog/${p.cat}/${p.slug}.html`;
const catUrl = (c) => `catalog/${c.slug}/`;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const fmtDate = (d) => new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

const ph = (key, ratio, alt, { cls = '', w = 1600, h = 1000, eager = false, extra = '' } = {}) => {
  const dims = { '1:1': [1200, 1200], '3:4': [1200, 1600], '4:5': [1200, 1500], '4:3': [1600, 1200], '16:10': [1600, 1000], '21:9': [2100, 900] }[ratio] || [w, h];
  return `<figure class="ph ${cls}" data-ratio="${ratio}" ${extra}><img src="${photo(key, dims[0], dims[1])}" alt="${esc(alt)}" width="${dims[0]}" height="${dims[1]}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'}></figure>`;
};

const svgTg = '<svg viewBox="0 0 24 24"><path d="M9.04 15.47 8.66 20.8c.54 0 .78-.23 1.06-.51l2.55-2.44 5.28 3.87c.97.53 1.65.25 1.91-.89l3.46-16.2c.31-1.43-.52-1.98-1.46-1.63L1.5 10.73c-1.39.54-1.37 1.31-.24 1.66l5.2 1.62L18.5 6.4c.57-.37 1.08-.17.66.2L9.04 15.47Z"/></svg>';
const svgWa = '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.8-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4c1.7.7 2.1.6 2.8.5a2.4 2.4 0 0 0 1.6-1.1c.2-.6.2-1 .1-1.1l-.6-.3Z"/></svg>';

function layout({ rel, title, desc, path, body, current = '', ogImage = img.or1, schema = '' }) {
  const navItems = [['catalog/', 'nav.catalog', 'Каталог'], ['brands/', 'nav.brands', 'Бренды'], ['services/', 'nav.services', 'Услуги'], ['leasing/', 'nav.leasing', 'Лизинг'], ['about/', 'nav.about', 'О компании'], ['news/', 'nav.news', 'Новости'], ['contacts/', 'nav.contacts', 'Контакты']];
  const nav = (cls) => navItems.map(([href, key, label]) => `<a class="${cls}" href="${rel}${href}" data-i18n="${key}" ${current === href ? 'aria-current="page"' : ''}>${label}</a>`).join('');
  return `<!DOCTYPE html>
<html lang="ru" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}/${path}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="website"><meta property="og:url" content="${SITE}/${path}"><meta property="og:image" content="${photo(Object.keys(img).find((k) => img[k] === ogImage) || 'or1', 1200, 630)}">
<link rel="icon" href="${rel}assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Onest:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${rel}assets/css/style.css">
${schema}
</head>
<body>
<header class="header">
  <div class="wrap header-in">
    <a class="logo" href="${rel}" aria-label="MEDITECH — на главную"><span class="logo-mark" aria-hidden="true"></span>MEDITECH</a>
    <nav class="nav" aria-label="Основное меню">${nav('')}</nav>
    <div class="header-right">
      <div class="lang" role="group" aria-label="Язык"><button type="button" data-lang="ru" aria-pressed="true">RU</button><button type="button" data-lang="uz" aria-pressed="false">UZ</button><button type="button" data-lang="en" aria-pressed="false">EN</button></div>
      <a class="btn btn-sm" href="#" data-modal="true" data-source="header" data-i18n="nav.consult">Получить консультацию</a>
      <button class="burger" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="Меню"><span></span><span></span><span></span></button>
    </div>
  </div>
  <div class="mobile-nav" id="mobile-nav">
    ${nav('mn-link')}
    <a class="btn btn-block" href="#" data-modal="true" data-source="mobile-menu" data-i18n="nav.consult">Получить консультацию</a>
    <div class="mn-contacts"><a href="${company.phoneHref}">${company.phone}</a><br><a href="mailto:${company.email}">${company.email}</a><br>${company.address}</div>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="footer">
  <div class="footer-ph">${ph('hall1', '3:4', 'Коридор клиники, оснащённой MEDITECH')}</div>
  <div class="footer-col">
    <a class="logo" href="${rel}"><span class="logo-mark" aria-hidden="true"></span>MEDITECH</a>
    <ul class="footer-menu">${navItems.map(([href, key, label]) => `<li><a href="${rel}${href}" data-i18n="${key}">${label}</a></li>`).join('')}</ul>
    <div class="footer-blocks">
      <div><h4 data-i18n="footer.contacts">Контакты</h4><a href="${company.phoneHref}">${company.phone}</a><br><a href="mailto:${company.email}">${company.email}</a><br>${company.address}<br>${company.hours}<br><a class="link-accent" href="${company.map}" target="_blank" rel="noopener" data-i18n="footer.map">Открыть на карте</a></div>
      <div><h4 data-i18n="footer.messengers">Мессенджеры</h4><a href="${company.telegram}" target="_blank" rel="noopener">Telegram</a><br><a href="${company.whatsapp}" target="_blank" rel="noopener">WhatsApp</a><br><a href="#" data-modal="true" data-source="footer" data-i18n="btn.download">Скачать каталог PDF</a></div>
    </div>
    <div class="footer-legal"><span data-i18n="footer.legal">© MEDITECH. Медицинское оборудование. Все права защищены.</span><a href="${rel}privacy/" data-i18n="footer.privacy">Политика конфиденциальности</a></div>
  </div>
</footer>
<div class="float"><a class="tg" href="${company.telegram}" target="_blank" rel="noopener" aria-label="Telegram">${svgTg}</a><a class="wa" href="${company.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp">${svgWa}</a></div>
<div class="modal" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="modal-title">
  <div class="modal-box">
    <button class="modal-close" type="button" aria-label="Закрыть" data-i18n-label="nav.close">×</button>
    <h3 id="modal-title" data-i18n="modal.title">Оставить заявку</h3>
    <p class="modal-sub" data-i18n="modal.sub">Заполните форму — менеджер свяжется в течение рабочего часа.</p>
    <p class="ctx"></p>
    ${leadForm('modal')}
  </div>
</div>
<script src="${rel}assets/js/data.js" defer></script>
<script src="${rel}assets/js/main.js" defer></script>
</body>
</html>`;
}

function leadForm(source, { comment = true, cls = '' } = {}) {
  return `<form class="form ${cls}" data-source="${source}" novalidate>
  <input type="hidden" name="context" value="">
  <div class="form-row">
    <div class="field"><label for="${source}-name" data-i18n="form.name">Имя</label><input id="${source}-name" name="name" type="text" autocomplete="name" required><span class="err" data-i18n="form.err.name">Укажите имя</span></div>
    <div class="field"><label for="${source}-phone" data-i18n="form.phone">Телефон</label><input id="${source}-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+998 __ ___ __ __" required><span class="err" data-i18n="form.err.phone">Укажите телефон в формате +998 XX XXX XX XX</span></div>
  </div>
  <div class="field"><label for="${source}-org" data-i18n="form.org">Клиника / организация</label><input id="${source}-org" name="org" type="text" autocomplete="organization"></div>
  ${comment ? `<div class="field"><label for="${source}-comment" data-i18n="form.comment">Комментарий</label><textarea id="${source}-comment" name="comment" rows="3"></textarea></div>` : ''}
  <p class="hp" aria-hidden="true"><label>Не заполняйте <input type="text" name="website" tabindex="-1" autocomplete="off"></label></p>
  <button class="btn btn-block" type="submit" data-i18n="form.send">Отправить заявку</button>
  <p class="consent" data-i18n="form.consent">Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.</p>
  <div class="form-ok"><h3 data-i18n="form.ok.title">Заявка отправлена</h3><p class="muted" data-i18n="form.ok.text">Менеджер свяжется с вами в течение рабочего часа. Если срочно — напишите в Telegram.</p></div>
</form>`;
}

const crumbs = (rel, items) => `<nav class="crumbs" aria-label="Вы здесь"><span><a href="${rel}">Главная</a></span>${items.map(([l, h]) => `<span>${h ? `<a href="${h}">${l}</a>` : l}</span>`).join('')}</nav>`;

const innerCta = (rel, key, title, text) => `<section class="wrap inner-cta" aria-labelledby="ic-h">
  <div data-reveal="scale">${ph(key, '4:3', 'Оборудование MEDITECH в клинике')}</div>
  <div class="ic-text" data-reveal><h2 id="ic-h">${title}</h2><p>${text}</p>
  <div class="hero-actions"><a class="btn" href="#" data-modal="true" data-source="inner-cta" data-i18n="btn.price">Запросить цену / КП</a><a class="btn btn-ghost" href="${rel}catalog/" data-i18n="hero.catalog">Перейти в каталог</a></div></div>
</section>`;

const productCard = (rel, p) => {
  const b = brandOf(p.brand);
  return `<a class="card" href="${rel}${prodUrl(p)}" data-brand="${p.brand}" data-status="${p.status}" data-sub="${p.sub}">
  ${ph(p.photo, '4:3', p.name)}
  <div class="card-meta"><span>${b.name}</span><span class="status" data-status="${p.status}" data-i18n="status.${p.status}">${p.status === 'stock' ? 'В наличии' : 'Под заказ'}</span></div>
  <h3>${p.name}</h3><p>${p.short}</p>
  <div class="card-actions"><span class="link" data-i18n="btn.more">Подробнее</span></div>
</a>`;
};

/* ------------------------------------------------------------------ HOME */
function home() {
  const rel = './';
  const advGroups = [
    ['adv.g1', 'Официальные поставки', [
      ['Прямые контракты с производителями', 'Поставляем напрямую от заводов и официальных дистрибьюторов — без посредников и серых схем.'],
      ['Регистрационные удостоверения', 'Каждая позиция имеет регистрационное удостоверение и сертификат соответствия Узбекистана.'],
      ['Документы для лицензирования', 'Передаём полный пакет: сертификаты, паспорта, акты ввода в эксплуатацию.'],
      ['Склад в Ташкенте', 'Ходовые позиции — в наличии, отгрузка за 1–3 рабочих дня.'],
      ['Таможня и логистика', 'Берём на себя импорт, растаможку и доставку до клиники в любой регион.'],
    ]],
    ['adv.g2', 'Гарантия и сервис', [
      ['Гарантия производителя от 12 месяцев', 'Гарантийное обслуживание ведут наши сертифицированные инженеры.'],
      ['Сервисные инженеры в штате', 'Инженеры обучены на заводах производителей; выезд по Ташкенту — до 4 часов.'],
      ['Подменное оборудование', 'На время ремонта по сервисному контракту предоставляем подменный аппарат.'],
      ['Монтаж и пусконаладка', 'Собираем, подключаем, калибруем и сдаём оборудование по акту.'],
      ['Обучение персонала', 'Врачей и медсестёр обучаем на рабочем месте, выдаём методички и сертификаты.'],
    ]],
    ['adv.g3', 'Финансирование', [
      ['Лизинг до 5 лет', 'Работаем с лизинговыми компаниями: первый платёж от 15%, решение за 3 дня.'],
      ['Рассрочка на складские позиции', 'Для оборудования в наличии возможна поэтапная оплата.'],
      ['Оплата по этапам поставки', 'Крупные проекты оплачиваются по мере поставки отделений.'],
      ['Работаем с бюджетом и тендерами', 'Готовим документацию для государственных закупок и тендеров.'],
    ]],
  ];
  const body = `
<section class="hero wrap" aria-labelledby="h1">
  <div class="hero-rail">
    <div class="hero-ph-sm" data-reveal style="--d:300ms">${ph('mon1', '1:1', 'Мониторы пациента в реанимации', { eager: true })}<p class="cap" data-i18n="hero.cap1">Операционные и реанимация</p></div>
    <div class="hero-ph-tall">${ph('ct1', '3:4', 'Компьютерный томограф в диагностическом центре', { cls: 'shutter', eager: true })}<p class="cap" data-i18n="hero.cap2">Диагностическая визуализация</p></div>
    <div class="hero-ph-wide" data-reveal style="--d:500ms">${ph('lab1', '16:10', 'Лабораторный анализатор', { cls: 'drift', eager: true })}<p class="cap" data-i18n="hero.cap3">Лабораторное оборудование</p></div>
  </div>
  <div class="hero-text">
    <h1 id="h1" data-reveal data-i18n="hero.title">Оборудование для клиник Узбекистана</h1>
    <div class="hero-side" data-reveal style="--d:120ms">
      <p data-i18n="hero.lead">Официальные поставки, монтаж, сервис и лизинг. Подбираем оборудование под лицензирование и готовим КП за два дня.</p>
      <div class="hero-actions"><a class="btn" href="${rel}catalog/" data-i18n="hero.catalog">Перейти в каталог</a><a class="btn btn-ghost" href="#" data-modal="true" data-source="hero" data-i18n="hero.consult">Получить консультацию</a></div>
    </div>
  </div>
</section>

<section class="search wrap" aria-labelledby="search-h">
  <h2 id="search-h" class="visually-hidden" data-i18n="search.label">Поиск по каталогу</h2>
  <form class="search-box" role="search" data-reveal>
    <input id="catalog-search" type="search" autocomplete="off" placeholder="Например: УЗИ, монитор пациента, автоклав…" data-i18n-ph="search.placeholder" aria-label="Поиск по каталогу" data-i18n-label="search.label">
    <button class="btn" type="submit" data-i18n="search.go">Найти</button>
  </form>
  <div class="search-results" aria-live="polite"></div>
  <div class="search-hint" data-reveal style="--d:100ms"><span data-i18n="search.hint">Популярное:</span><button type="button">УЗИ</button><button type="button">Монитор пациента</button><button type="button">ИВЛ</button><button type="button">Стерилизатор</button><button type="button">Стоматологическая установка</button><button type="button">КТ</button></div>
</section>

<section class="section" aria-labelledby="cats-h">
  <div class="wrap band-head"><h2 id="cats-h" data-reveal data-i18n="cats.title">Категории оборудования</h2><a class="link band-link" href="${rel}catalog/" data-reveal><span data-i18n="cats.all">Весь каталог</span> <span class="arrow">→</span></a></div>
  <div class="band" data-reveal="fade">
    ${categories.map((c) => `<a href="${rel}${catUrl(c)}"><img src="${photo(c.photo, 900, 1400)}" alt="" width="900" height="1400" loading="lazy"><div class="band-label"><h3>${c.name}</h3><span>${c.subs.map((s) => s.name).join(' · ')}</span></div></a>`).join('')}
  </div>
  <p class="wrap cap band-caption" data-i18n="cats.caption">Наведите на панель, чтобы раскрыть категорию. Полный список — в каталоге.</p>
</section>

<section class="section wrap adv" aria-labelledby="adv-h">
  <h2 id="adv-h" data-reveal data-i18n="adv.title">Почему с нами</h2>
  <div class="adv-cols">
    ${advGroups.map(([key, name, items], gi) => `<div class="adv-group" data-reveal style="--d:${gi * 120}ms"><h3 data-i18n="${key}">${name}</h3><ul>${items.map(([n, d]) => `<li data-desc="${esc(d)}">${n}</li>`).join('')}</ul><p class="adv-sum">${items[0][1]}</p></div>`).join('')}
    <div class="adv-desc" data-reveal style="--d:360ms"><p></p></div>
  </div>
</section>

<section class="section wrap" aria-labelledby="how-h">
  <div class="how-grid">
    <h2 id="how-h" class="how-head" data-reveal data-i18n="how.title">Как мы работаем</h2>
    <div class="how-ph1" data-reveal="scale">${ph('mri', '3:4', 'Врачи обсуждают снимки МРТ')}</div>
    <div class="how-t1" data-reveal style="--d:120ms">
      <div class="how-step"><h3 data-i18n="how.s1">Заявка</h3><p class="muted" data-i18n="how.s1t">Вы оставляете заявку на сайте или в мессенджере. Менеджер связывается в течение рабочего часа и уточняет задачу: профиль, помещение, сроки.</p></div>
    </div>
    <div class="how-ph2" data-reveal="scale">${ph('lab2', '1:1', 'Инженер настраивает лабораторный анализатор')}</div>
    <div class="how-t2" data-reveal style="--d:120ms">
      <div class="how-step"><h3 data-i18n="how.s2">Подбор и КП</h3><p class="muted" data-i18n="how.s2t">Инженер подбирает оборудование под стандарт оснащения и бюджет. За 1–2 дня вы получаете коммерческое предложение с конфигурацией и сроками.</p></div>
    </div>
    <div class="how-ph3" data-reveal="scale">${ph('or2', '16:10', 'Смонтированная операционная')}</div>
    <div class="how-t3" data-reveal style="--d:120ms">
      <div class="how-step"><h3 data-i18n="how.s3">Поставка и монтаж</h3><p class="muted" data-i18n="how.s3t">Поставка со склада или от производителя, монтаж, пусконаладка, обучение персонала и передача документов для лицензирования.</p></div>
      <div class="how-step"><h3 data-i18n="how.s4">Сервис</h3><p class="muted" data-i18n="how.s4t">Гарантийное и постгарантийное обслуживание, подменное оборудование, выезд инженера по сервисному контракту.</p></div>
    </div>
  </div>
</section>

<section class="section wrap" aria-labelledby="brands-h">
  <div class="brands-grid">
    <h2 id="brands-h" data-reveal data-i18n="brands.title">Бренды-производители</h2>
    <ul class="brands-list" data-reveal style="--d:120ms">
      <li class="kind">Визуализация</li>${brands.filter((b) => /GE|Siemens|Philips|Canon|Fujifilm/.test(b.name)).map((b) => `<li><a href="${rel}brands/#${b.slug}">${b.name}</a></li>`).join('')}
      <li class="kind">Реанимация и хирургия</li>${brands.filter((b) => /Mindray|Dräger|Nihon|Getinge|Olympus/.test(b.name)).map((b) => `<li><a href="${rel}brands/#${b.slug}">${b.name}</a></li>`).join('')}
      <li class="kind">Лаборатория и профили</li>${brands.filter((b) => /Sysmex|Roche|Planmeca|BTL/.test(b.name)).map((b) => `<li><a href="${rel}brands/#${b.slug}">${b.name}</a></li>`).join('')}
    </ul>
    <p class="brands-more" data-reveal><a class="link" href="${rel}brands/"><span data-i18n="brands.all">Все бренды</span> <span class="arrow">→</span></a></p>
  </div>
</section>

<section class="section wrap" aria-labelledby="proj-h">
  <div class="proj-head"><h2 id="proj-h" data-reveal data-i18n="proj.title">Реализованные проекты</h2><p class="muted" data-reveal data-i18n="proj.caption">Клиники, которые мы оснащали под ключ или по отделениям.</p></div>
  <div class="proj-row" data-stagger="110">
    ${projects.map((p, i) => `<a class="proj" href="${rel}news/proekt-klinika-150.html" data-reveal="scale">${ph(p.photo, i % 2 ? '4:5' : '16:10', p.name)}<h3>${p.name}</h3><p>${p.scope} · ${p.year}</p></a>`).join('')}
  </div>
</section>

<section class="section wrap" aria-labelledby="about-h">
  <h2 id="about-h" data-reveal data-i18n="about.title">О компании</h2>
  <p class="lead about-lead" data-reveal style="--d:100ms" data-i18n="about.lead">MEDITECH поставляет медицинское оборудование клиникам, лабораториям и стоматологиям по всему Узбекистану — от одного кабинета до стационара под ключ.</p>
  <div class="about-tiles">
    <div class="about-photo" data-reveal="scale">${ph('bld2', '16:10', 'Здание медицинского центра, оснащённого компанией')}<p class="about-note">Работаем с частными клиниками, государственными больницами и лабораториями. Проектируем, поставляем, монтируем и обслуживаем — одной командой.</p></div>
    <div class="about-tile" data-reveal style="--d:120ms" aria-hidden="true">
      <svg viewBox="0 0 100 60" role="img" aria-label="Стилизованная карта Узбекистана, точка — Ташкент"><path d="M4 26 L14 14 L30 10 L44 14 L50 20 L56 18 L62 22 L70 26 L76 24 L82 18 L88 16 L94 20 L98 26 L92 30 L84 28 L80 34 L72 40 L64 46 L56 52 L46 50 L40 44 L34 46 L26 42 L18 44 L10 40 L4 34 Z" fill="rgba(255,255,255,.18)"/><circle cx="87" cy="22" r="2.6" fill="#fff"/><text x="78" y="32" font-size="4.2" fill="#fff" font-family="Onest, sans-serif">Ташкент</text></svg>
    </div>
    <div class="about-facts" data-reveal style="--d:200ms">
      <div><b><span class="counter" data-to="12" data-suffix="+">12+</span></b><span>лет на рынке</span></div>
      <div><b><span class="counter" data-to="300" data-suffix="+">300+</span></b><span>оснащённых клиник</span></div>
      <div><b><span class="counter" data-to="14">14</span></b><span>брендов напрямую</span></div>
      <div><b><span class="counter" data-to="4" data-suffix=" ч">4 ч</span></b><span>выезд инженера в Ташкенте</span></div>
    </div>
  </div>
  <p data-reveal style="margin-top:40px"><a class="link" href="${rel}about/"><span data-i18n="about.more">Подробнее о компании</span> <span class="arrow">→</span></a></p>
</section>

<section class="picker" aria-labelledby="pick-h">
  <div class="picker-grid">
    <div class="picker-intro" data-reveal><h2 id="pick-h" data-i18n="pick.title">Подобрать оборудование</h2><p data-i18n="pick.lead">Выберите профиль и масштаб — покажем базовый комплект, с которого начинаем подбор.</p></div>
    <div class="picker-controls" data-reveal style="--d:100ms">
      <div><h4 data-i18n="pick.profile">Профиль</h4><div class="chips" data-pick="profile"></div></div>
      <div><h4 data-i18n="pick.scale">Масштаб</h4><div class="chips" data-pick="scale"></div></div>
    </div>
    <div class="picker-result" data-reveal style="--d:200ms">
      <h4 data-i18n="pick.result">Базовый комплект</h4>
      <ol></ol>
      <p class="picker-total"></p>
      <a class="btn" href="#" data-modal="true" data-source="picker" data-i18n="pick.cta">Запросить КП на комплект</a>
    </div>
  </div>
</section>

<section class="faq" aria-labelledby="faq-h">
  <div class="wrap faq-grid">
    <div class="faq-col">
      <h2 id="faq-h" data-reveal data-i18n="faq.title">Частые вопросы</h2>
      <div class="faq-facts" data-reveal style="--d:100ms">${company.address}<br>${company.hours}<br><a href="${company.phoneHref}">${company.phone}</a></div>
      <div class="faq-list" data-stagger="70">
        ${faq.map((f, i) => `<details ${i === 0 ? 'open' : ''}><summary>${f.q}<span class="chev" aria-hidden="true"></span></summary><p class="faq-a">${f.a}</p></details>`).join('')}
      </div>
      <div class="faq-actions" data-reveal><a class="btn" href="#" data-modal="true" data-source="faq" data-i18n="btn.consult">Получить консультацию</a><a class="link" href="${company.telegram}" target="_blank" rel="noopener">Telegram <span class="arrow">→</span></a></div>
    </div>
    <div class="faq-ph-wrap">
      ${ph('bed2', '3:4', 'Палата клиники с функциональной кроватью', { cls: 'faq-ph-tall', extra: 'data-reveal="scale"' })}
      ${ph('steth', '1:1', 'Стетоскоп', { cls: 'faq-ph-sq', extra: 'data-reveal style="--d:200ms"' })}
    </div>
  </div>
</section>

<section class="lead-strip" aria-labelledby="lead-h">
  <div class="wrap lead-grid">
    <div class="lead-text" data-reveal><h2 id="lead-h" data-i18n="lead.title">Каталог оборудования в PDF</h2><p data-i18n="lead.text">Оставьте телефон — пришлём актуальный каталог и прайс-условия в Telegram или на почту.</p></div>
    <form data-reveal style="--d:120ms"><input type="tel" inputmode="tel" placeholder="+998 __ ___ __ __" aria-label="Телефон" data-i18n-label="form.phone" required><button class="btn" type="submit" data-i18n="lead.btn">Получить каталог</button></form>
  </div>
</section>

<section class="cta" aria-labelledby="cta-h">
  <div class="cta-bg">${ph('or1', '16:10', 'Операционная, оснащённая под ключ')}</div>
  <div class="wrap cta-grid">
    <div class="cta-text" data-reveal><h2 id="cta-h" data-i18n="cta.title">Оставьте заявку на подбор</h2><p data-i18n="cta.lead">Менеджер свяжется в течение рабочего часа. Коммерческое предложение — за 1–2 дня.</p></div>
    <div class="cta-form" data-reveal style="--d:150ms">${leadForm('home-cta')}</div>
  </div>
</section>`;
  const schema = `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', name: 'MEDITECH', url: SITE, telephone: company.phone, email: company.email, address: { '@type': 'PostalAddress', addressLocality: 'Ташкент', addressCountry: 'UZ', streetAddress: company.address } })}</script>`;
  return layout({ rel, title: 'MEDITECH — медицинское оборудование для клиник Узбекистана', desc: 'Официальные поставки медицинского оборудования: диагностика, лаборатория, операционные, реанимация, стоматология. Монтаж, сервис, лизинг. Коммерческое предложение за 1–2 дня.', path: '', body, current: '', schema });
}

/* ------------------------------------------------------------------ CATALOG */
function catalogIndex() {
  const rel = '../';
  const body = `
<section class="wrap page-hero">
  ${crumbs(rel, [['Каталог']])}
  <div class="page-hero-grid"><h1 data-reveal data-i18n="nav.catalog">Каталог</h1><p class="page-lead" data-reveal style="--d:100ms">${categories.length} категорий, ${products.length} позиций в этом шаблоне. Цены — по запросу: нажмите «Запросить цену / КП» в любой карточке.</p></div>
  <div class="page-ph-split">${ph('ct2', '16:10', 'Компьютерный томограф', { extra: 'data-reveal="scale"' })}${ph('dent1', '4:5', 'Стоматологическая установка', { extra: 'data-reveal style="--d:150ms"' })}</div>
</section>
<section class="wrap section-tight" aria-label="Категории">
  <div class="cat-rows">
  ${categories.map((c) => `<div class="cat-row">
    <div class="cat-ph" data-reveal="scale">${ph(c.photo, '4:3', c.name)}</div>
    <div class="cat-body" data-reveal style="--d:120ms"><h2><a href="${rel}${catUrl(c)}">${c.name}</a></h2><p>${c.lead}</p>
      <ul>${c.subs.map((s) => `<li><a href="${rel}${catUrl(c)}?sub=${s.slug}">${s.name}<small>${products.filter((p) => p.cat === c.slug && p.sub === s.slug).length}</small></a></li>`).join('')}</ul>
      <a class="btn btn-ghost btn-sm" href="${rel}${catUrl(c)}">Открыть категорию <span class="arrow">→</span></a></div>
  </div>`).join('')}
  </div>
</section>
${innerCta(rel, 'lab2', 'Не нашли нужную позицию?', 'В каталоге шаблона показана часть ассортимента. Напишите, что нужно — подберём и подготовим предложение.')}`;
  return layout({ rel, title: 'Каталог медицинского оборудования — MEDITECH', desc: 'Каталог медицинского оборудования по категориям: визуализация, лаборатория, операционные, реанимация, стоматология, стерилизация, мебель, реабилитация.', path: 'catalog/', body, current: 'catalog/' });
}

function categoryPage(c) {
  const rel = '../../';
  const list = products.filter((p) => p.cat === c.slug);
  const bs = [...new Set(list.map((p) => p.brand))].map(brandOf);
  const body = `
<section class="wrap page-hero">
  ${crumbs(rel, [['Каталог', `${rel}catalog/`], [c.name]])}
  <div class="page-hero-grid"><h1 data-reveal>${c.name}</h1><p class="page-lead" data-reveal style="--d:100ms">${c.lead} Официальная поставка, монтаж и сервис в Узбекистане.</p></div>
  <div class="page-ph" data-reveal="scale">${ph(c.photo, '21:9', c.name, { cls: 'drift' })}</div>
  <nav class="subnav" aria-label="Подкатегории" data-reveal><a href="${rel}${catUrl(c)}" aria-current="true" data-i18n="filter.all">Все</a>${c.subs.map((s) => `<a href="?sub=${s.slug}">${s.name}</a>`).join('')}</nav>
  <form class="filters" data-reveal style="--d:80ms">
    <div class="field"><label for="f-sub" data-i18n="filter.cat">Категория</label><select id="f-sub" name="sub"><option value="">Все подкатегории</option>${c.subs.map((s) => `<option value="${s.slug}">${s.name}</option>`).join('')}</select></div>
    <div class="field"><label for="f-brand" data-i18n="filter.brand">Бренд</label><select id="f-brand" name="brand"><option value="">Все бренды</option>${bs.map((b) => `<option value="${b.slug}">${b.name}</option>`).join('')}</select></div>
    <div class="field"><label for="f-status" data-i18n="filter.status">Наличие</label><select id="f-status" name="status"><option value="">Все</option><option value="stock">В наличии</option><option value="order">Под заказ</option></select></div>
    <button class="link" type="reset" data-i18n="filter.reset">Сбросить</button>
    <p class="found"><span data-i18n="filter.found">Найдено позиций:</span> <b>${list.length}</b></p>
  </form>
</section>
<section class="wrap" aria-label="Товары">
  <div class="products" data-stagger="90">${list.map((p) => productCard(rel, p)).join('')}</div>
</section>
${innerCta(rel, 'or2', 'Нужна консультация по разделу?', 'Инженер подскажет, какая конфигурация подходит под ваш профиль и помещение, и подготовит КП.')}`;
  return layout({ rel, title: `${c.name} — купить в Узбекистане — MEDITECH`, desc: `${c.lead} Официальная поставка, монтаж, сервис. Запросите КП.`, path: catUrl(c), body, current: 'catalog/', ogImage: img[c.photo] });
}

function productPage(p) {
  const rel = '../../';
  const c = catOf(p.cat), s = subOf(p.cat, p.sub), b = brandOf(p.brand);
  const similar = products.filter((x) => x.cat === p.cat && x.slug !== p.slug).slice(0, 3);
  const alt = Object.keys(img).filter((k) => k !== p.photo && img[k]);
  const g2 = c.photo !== p.photo ? c.photo : alt[0], g3 = alt.find((k) => k !== g2 && k !== p.photo && ['or2', 'mon2', 'lab3', 'bed3', 'dent3', 'hall2', 'ct4'].includes(k));
  const schema = `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.short, brand: { '@type': 'Brand', name: b.name }, image: photo(p.photo, 1600, 1200), category: c.name, offers: { '@type': 'Offer', availability: p.status === 'stock' ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder', priceCurrency: 'UZS', price: '0', priceSpecification: { '@type': 'PriceSpecification', price: '0', priceCurrency: 'UZS', description: 'Цена по запросу' } } })}</script>`;
  const body = `
<section class="wrap page-hero">
  ${crumbs(rel, [['Каталог', `${rel}catalog/`], [c.name, `${rel}${catUrl(c)}`], [s.name, `${rel}${catUrl(c)}?sub=${s.slug}`], [p.name]])}
  <div class="prod-grid">
    <div class="prod-gallery">
      ${ph(p.photo, '4:3', p.name, { eager: true, cls: 'shutter' })}
      ${ph(g2, '1:1', `${p.name} — в интерьере клиники`, { extra: 'data-reveal="scale"' })}
      ${ph(g3 || 'or2', '4:3', `${p.name} — детали`, { extra: 'data-reveal="scale" style="--d:120ms"' })}
    </div>
    <aside class="prod-info" data-reveal>
      <p class="prod-brand"><span data-i18n="prod.brand">Производитель</span>: <a class="link" href="${rel}brands/#${b.slug}">${b.name}</a> · ${b.country}</p>
      <h1>${p.name}</h1>
      <p class="status" data-status="${p.status}" data-i18n="status.${p.status}">${p.status === 'stock' ? 'В наличии' : 'Под заказ'}</p>
      <p>${p.short}</p>
      <div class="prod-actions">
        <a class="btn" href="#" data-modal="true" data-ctx="${esc(p.name)}" data-source="product-price" data-i18n="btn.price">Запросить цену / КП</a>
        <a class="btn btn-ghost" href="#" data-modal="true" data-ctx="${esc(p.name)}" data-source="product-consult" data-i18n="btn.consult">Получить консультацию</a>
      </div>
      <p class="prod-note">Цена зависит от комплектации и условий поставки. КП с конфигурацией и сроками — за 1–2 рабочих дня. Данные о наличии обновляются из 1С.</p>
    </aside>
    <div class="prod-tabs">
      <section aria-labelledby="specs-h" data-reveal><h2 id="specs-h" data-i18n="prod.specs">Характеристики</h2>
        <div class="specs">${p.specs.map(([k, v]) => `<div><span>${k}</span><span>${v}</span></div>`).join('')}</div></section>
      ${p.docs.length ? `<section aria-labelledby="docs-h" data-reveal><h2 id="docs-h" data-i18n="prod.docs">Документы</h2>
        <ul class="docs">${p.docs.map((d) => `<li><a href="#" data-modal="true" data-ctx="${esc(p.name + ' — ' + d)}" data-source="product-doc"><span>${d}</span><span>PDF ↓</span></a></li>`).join('')}</ul></section>` : ''}
    </div>
  </div>
</section>
${similar.length ? `<section class="wrap section-tight" aria-labelledby="sim-h"><h2 id="sim-h" data-reveal data-i18n="prod.similar">Похожие товары</h2><div class="products" data-stagger="90">${similar.map((x) => productCard(rel, x)).join('')}</div></section>` : ''}
${innerCta(rel, c.photo, 'Подберём конфигурацию', 'Расскажите о профиле и помещении — инженер предложит оптимальную комплектацию и альтернативы по бюджету.')}`;
  return layout({ rel, title: `${p.name} — ${b.name} — MEDITECH`, desc: `${p.short} ${p.status === 'stock' ? 'В наличии в Ташкенте.' : 'Поставка под заказ.'} Официальная гарантия, монтаж, сервис. Запросите КП.`, path: prodUrl(p), body, current: 'catalog/', ogImage: img[p.photo], schema });
}

/* ------------------------------------------------------------------ BRANDS */
function brandsPage() {
  const rel = '../';
  const body = `
<section class="wrap page-hero">
  ${crumbs(rel, [['Бренды']])}
  <div class="page-hero-grid"><h1 data-reveal data-i18n="brands.title">Бренды-производители</h1><p class="page-lead" data-reveal style="--d:100ms">Работаем напрямую с производителями и их официальными дистрибьюторами. Поставляем оборудование с регистрационными удостоверениями Узбекистана.</p></div>
  <div class="page-ph-split">${ph('or2', '16:10', 'Операционная с оборудованием ведущих производителей', { extra: 'data-reveal="scale"' })}${ph('lab5', '4:5', 'Лабораторный микроскоп', { extra: 'data-reveal style="--d:150ms"' })}</div>
</section>
<section class="wrap" aria-label="Список брендов">
  <div class="brand-rows" data-stagger="50">
    ${brands.map((b) => `<div class="brand-row" id="${b.slug}"><h2 class="b-name">${b.name}</h2><p class="b-country">${b.country}</p><p class="b-focus">${b.focus}</p><p class="b-link"><a class="link" href="${rel}catalog/?brand=${b.slug}">Оборудование <span class="arrow">→</span></a></p></div>`).join('')}
  </div>
</section>
${innerCta(rel, 'ct1', 'Нужен бренд, которого нет в списке?', 'Подберём аналог из нашего портфеля или организуем поставку под заказ с полным пакетом документов.')}`;
  return layout({ rel, title: 'Бренды-производители медицинского оборудования — MEDITECH', desc: 'Официальные поставки оборудования Mindray, GE HealthCare, Siemens Healthineers, Philips, Dräger, Getinge, Sysmex, Roche и других производителей в Узбекистане.', path: 'brands/', body, current: 'brands/' });
}

/* ------------------------------------------------------------------ SERVICES */
function servicesPage() {
  const rel = '../';
  const svcs = [
    ['Оснащение клиник под ключ', 'bld2', 'Берём объект с этапа планировки и сдаём отделения, готовые к лицензированию: оборудование, мебель, стерилизация, расходные материалы и документы.', ['Стандарт оснащения под профиль и лицензию', 'Спецификация и бюджет по этапам', 'Поставка, монтаж, пусконаладка', 'Обучение персонала и передача документации']],
    ['Проектирование', 'mon2', 'Технологическое проектирование медицинских помещений: расстановка оборудования, инженерные требования, медицинские газы, радиационная защита.', ['Технологические решения и планировки', 'Задания на инженерные сети', 'Проекты рентген-кабинетов и КТ/МРТ', 'Согласование с надзорными органами']],
    ['Монтаж и пусконаладка', 'or1', 'Инженеры, обученные производителями, устанавливают, подключают и калибруют оборудование, затем сдают его по акту ввода в эксплуатацию.', ['Такелаж и внос тяжёлого оборудования', 'Подключение к сетям и газам', 'Калибровка и тестовые протоколы', 'Акт ввода в эксплуатацию']],
    ['Сервис и обучение персонала', 'lab2', 'Гарантийное и постгарантийное обслуживание с подменным оборудованием, плановые ТО и обучение врачей и медсестёр на рабочем месте.', ['Выезд по Ташкенту — до 4 часов', 'Сервисные контракты и плановые ТО', 'Оригинальные запчасти и расходники', 'Обучение с выдачей сертификатов']],
  ];
  const body = `
<section class="wrap page-hero">
  ${crumbs(rel, [['Услуги']])}
  <div class="page-hero-grid"><h1 data-reveal data-i18n="nav.services">Услуги</h1><p class="page-lead" data-reveal style="--d:100ms">От проектирования до сервиса — одна команда отвечает за результат на каждом этапе. Так клиника открывается в срок и проходит лицензирование с первого раза.</p></div>
  <div class="page-ph" data-reveal="scale">${ph('hall1', '21:9', 'Коридор оснащённой клиники', { cls: 'drift' })}</div>
</section>
<section class="wrap section" aria-label="Перечень услуг">
  <div class="svc-rows">
    ${svcs.map(([name, key, text, items]) => `<article class="svc"><div class="svc-ph" data-reveal="scale">${ph(key, '4:3', name)}</div><div class="svc-body" data-reveal style="--d:120ms"><h2>${name}</h2><p>${text}</p><ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul><a class="btn" href="#" data-modal="true" data-ctx="${esc(name)}" data-source="services">Обсудить задачу</a></div></article>`).join('')}
  </div>
</section>
${innerCta(rel, 'bed1', 'Оснащаете кабинет или клинику?', 'Оставьте заявку на оснащение под ключ — пришлём стандарт оснащения по профилю и ориентир по бюджету.')}`;
  return layout({ rel, title: 'Услуги: оснащение клиник под ключ, проектирование, монтаж, сервис — MEDITECH', desc: 'Оснащение клиник под ключ, технологическое проектирование, монтаж и пусконаладка медицинского оборудования, сервис и обучение персонала в Узбекистане.', path: 'services/', body, current: 'services/' });
}

/* ------------------------------------------------------------------ LEASING */
function leasingPage() {
  const rel = '../';
  const body = `
<section class="wrap page-hero">
  ${crumbs(rel, [['Лизинг и условия оплаты']])}
  <div class="page-hero-grid"><h1 data-reveal>Лизинг и условия оплаты</h1><p class="page-lead" data-reveal style="--d:100ms">Оборудование начинает работать и приносить доход сразу, а оплачивается по мере использования. Срок — до 5 лет, первый платёж — от 15%.</p></div>
</section>
<section class="wrap" aria-label="Калькулятор">
  <div class="leasing-grid">
    <form class="calc" data-reveal="scale" aria-labelledby="calc-h">
      <h2 id="calc-h" style="font-size:var(--step-lead)">Ориентировочный расчёт</h2>
      <div class="field"><div class="range-head"><label for="c-sum">Стоимость оборудования</label><b id="c-sum-out"></b></div><input id="c-sum" type="range" min="5000" max="500000" step="5000" value="80000"></div>
      <div class="field"><div class="range-head"><label for="c-months">Срок</label><b id="c-months-out"></b></div><input id="c-months" type="range" min="12" max="60" step="6" value="36"></div>
      <div class="field"><div class="range-head"><label for="c-adv">Первый платёж</label><b id="c-adv-out"></b></div><input id="c-adv" type="range" min="15" max="50" step="5" value="20"></div>
      <div class="calc-out"><div><b id="c-pay"></b><span>ежемесячный платёж</span></div><div><b id="c-first"></b><span>первый платёж</span></div><div><b id="c-total"></b><span>итого за срок</span></div></div>
      <p class="calc-note">Расчёт ориентировочный, по ставке 18% годовых. Точные условия зависят от суммы, срока и финансового состояния организации и утверждаются лизинговой компанией.</p>
      <a class="btn" href="#" data-modal="true" data-ctx="Лизинг" data-source="leasing-calc">Получить точный расчёт</a>
    </form>
    <div class="leasing-text">
      <div data-reveal><h3>Кому подходит</h3><p>Частным клиникам, лабораториям, стоматологиям и диагностическим центрам, которые хотят открыть кабинет или заменить оборудование без крупных единовременных затрат.</p></div>
      <div data-reveal><h3>Другие варианты оплаты</h3><p>Рассрочка на складские позиции, оплата по этапам поставки для крупных проектов, работа с бюджетными организациями по тендерам. Работаем официально по договору.</p></div>
      <div data-reveal><h3>Как оформить</h3>
        <ol class="steps">
          <li><b>Заявка и выбор оборудования</b><span>Фиксируем конфигурацию и стоимость в КП.</span></li>
          <li><b>Пакет документов</b><span>Учредительные документы, финансовая отчётность, анкета лизингополучателя.</span></li>
          <li><b>Решение за 3 рабочих дня</b><span>Лизинговая компания согласует условия и график.</span></li>
          <li><b>Договор и поставка</b><span>После первого платежа отгружаем и монтируем оборудование.</span></li>
        </ol>
      </div>
      <div data-reveal>${ph('bld1', '16:10', 'Здание современной клиники')}</div>
    </div>
  </div>
</section>
${innerCta(rel, 'ct4', 'Подберём оборудование и финансирование вместе', 'Один менеджер ведёт и подбор оборудования, и оформление лизинга — вам не нужно согласовывать две стороны.')}`;
  return layout({ rel, title: 'Лизинг медицинского оборудования и условия оплаты — MEDITECH', desc: 'Лизинг медицинского оборудования в Узбекистане: срок до 5 лет, первый платёж от 15%, решение за 3 дня. Калькулятор платежа и другие условия оплаты.', path: 'leasing/', body, current: 'leasing/' });
}

/* ------------------------------------------------------------------ ABOUT */
function aboutPage() {
  const rel = '../';
  const body = `
<section class="wrap page-hero">
  ${crumbs(rel, [['О компании']])}
  <div class="page-hero-grid"><h1 data-reveal data-i18n="about.title">О компании</h1><p class="page-lead" data-reveal style="--d:100ms">MEDITECH — поставщик медицинского оборудования с собственной инженерной службой. Оснащаем клиники по всему Узбекистану: от одного кабинета до стационара под ключ.</p></div>
  <div class="page-ph" data-reveal="scale">${ph('bld2', '21:9', 'Здание медицинского центра', { cls: 'drift' })}</div>
</section>
<section class="wrap" aria-label="История и подход">
  <div class="about-story">
    <div class="st-text" data-reveal><h2>Одна команда на весь цикл</h2><p style="margin-top:20px">Компания начиналась с поставок лабораторного оборудования частным лабораториям Ташкента. Сегодня мы работаем со всеми профилями — визуализация, хирургия, реанимация, стоматология — и ведём проекты целиком: проектирование, поставка, монтаж, обучение, сервис.</p><p>Главный принцип — клиника должна открыться в срок и пройти лицензирование с первого раза. Поэтому мы заранее собираем комплект под стандарт оснащения и передаём полный пакет документов.</p></div>
    <div class="st-ph" data-reveal="scale">${ph('mri', '4:3', 'Врачи обсуждают результаты исследования')}</div>
    <div class="st-ph2" data-reveal="scale">${ph('lab3', '3:4', 'Инженер в лаборатории')}</div>
    <div class="st-text2" data-reveal><h2>Сервис, который рядом</h2><p style="margin-top:20px">Сервисные инженеры в штате, обучены производителями, работают в Ташкенте и регионах. Для реанимационного оборудования — дежурство 24/7, выезд в Ташкенте до 4 часов, подменное оборудование по сервисному контракту.</p></div>
  </div>
  <div class="about-facts" style="grid-column:auto;display:grid;grid-template-columns:repeat(4,1fr);gap:24px;margin-top:96px" data-stagger="100">
    <div><b><span class="counter" data-to="12" data-suffix="+">12+</span></b><span>лет на рынке</span></div>
    <div><b><span class="counter" data-to="300" data-suffix="+">300+</span></b><span>оснащённых клиник</span></div>
    <div><b><span class="counter" data-to="14">14</span></b><span>брендов напрямую</span></div>
    <div><b><span class="counter" data-to="18">18</span></b><span>сервисных инженеров</span></div>
  </div>
  <div class="values">
    <div data-reveal><h3>Честная спецификация</h3><p>Предлагаем то, что нужно для задачи и лицензии, — без лишних опций и без «экономии» на критичном.</p></div>
    <div data-reveal style="--d:100ms"><h3>Документы в порядке</h3><p>Регистрационные удостоверения, сертификаты, паспорта и акты — передаём комплектом, который принимают с первого раза.</p></div>
    <div data-reveal style="--d:200ms"><h3>Ответственность за результат</h3><p>Один договор, один менеджер и одна инженерная служба отвечают за оборудование до и после запуска.</p></div>
  </div>
</section>
<section class="wrap section-tight" aria-labelledby="team-h">
  <h2 id="team-h" data-reveal>Команда</h2>
  <div class="team" data-stagger="90">
    ${[['Руководитель отдела продаж', 'Подбор и КП'], ['Главный инженер', 'Монтаж и сервис'], ['Руководитель проектов', 'Оснащение под ключ'], ['Специалист по лизингу', 'Финансирование']].map(([r, d]) => `<div class="person"><figure class="ph is-missing" data-ratio="4:5"><span>Фото сотрудника</span></figure><h4>Имя Фамилия</h4><span>${r} · ${d}</span></div>`).join('')}
  </div>
</section>
${innerCta(rel, 'or1', 'Познакомимся на вашем объекте', 'Инженер приедет, посмотрит помещение и предложит стандарт оснащения с ориентиром по бюджету — бесплатно.')}`;
  return layout({ rel, title: 'О компании MEDITECH — поставщик медицинского оборудования в Узбекистане', desc: 'MEDITECH — поставка, монтаж и сервис медицинского оборудования в Узбекистане. Собственная инженерная служба, прямые контракты с производителями, оснащение клиник под ключ.', path: 'about/', body, current: 'about/' });
}

/* ------------------------------------------------------------------ NEWS */
function newsIndex() {
  const rel = '../';
  const body = `
<section class="wrap page-hero">
  ${crumbs(rel, [['Новости и статьи']])}
  <div class="page-hero-grid"><h1 data-reveal>Новости и полезные статьи</h1><p class="page-lead" data-reveal style="--d:100ms">Как выбирать оборудование, что требуется для лицензирования, новости компании и реализованные проекты.</p></div>
</section>
<section class="wrap" aria-label="Публикации">
  <div class="news-grid" data-stagger="90">
    ${news.map((n, i) => `<a class="post" href="${rel}news/${n.slug}.html" data-reveal="scale">${ph(n.photo, i % 3 === 0 ? '16:10' : i % 3 === 1 ? '4:5' : '4:3', n.title)}<div class="post-meta"><span>${n.type}</span><span>${fmtDate(n.date)}</span></div><h3>${n.title}</h3><p>${n.lead}</p></a>`).join('')}
  </div>
</section>
${innerCta(rel, 'lab4', 'Подписка на новости для клиник', 'Раз в месяц — о новых поставках, условиях лизинга и изменениях в требованиях к оснащению. Оставьте контакты.')}`;
  return layout({ rel, title: 'Новости и полезные статьи — MEDITECH', desc: 'Статьи о выборе медицинского оборудования, лицензировании кабинетов, новости компании MEDITECH и реализованные проекты.', path: 'news/', body, current: 'news/' });
}

function articlePage(n) {
  const rel = '../';
  const others = news.filter((x) => x.slug !== n.slug).slice(0, 2);
  const body = `
<section class="wrap page-hero">
  ${crumbs(rel, [['Новости', `${rel}news/`], [n.title]])}
  <div class="page-hero-grid"><h1 data-reveal>${n.title}</h1><p class="page-lead" data-reveal style="--d:100ms">${n.type} · ${fmtDate(n.date)}</p></div>
  <div class="article">
    <div class="art-ph" data-reveal="scale">${ph(n.photo, '21:9', n.title, { cls: 'drift' })}</div>
    <div class="art-body" data-reveal><p>${n.lead}</p>${n.body.map((p) => `<p>${p}</p>`).join('')}</div>
    <aside class="art-aside" data-reveal style="--d:100ms">Поделиться:<br><a href="https://t.me/share/url?url=${encodeURIComponent(SITE + '/news/' + n.slug + '.html')}" target="_blank" rel="noopener">Telegram</a><br><a href="#" data-modal="true" data-ctx="${esc(n.title)}" data-source="article">Задать вопрос</a></aside>
  </div>
</section>
<section class="wrap section-tight" aria-labelledby="more-h"><h2 id="more-h" data-reveal>Читайте также</h2>
  <div class="news-grid" data-stagger="90">${others.map((o, i) => `<a class="post" href="${rel}news/${o.slug}.html" data-reveal="scale">${ph(o.photo, i ? '4:5' : '16:10', o.title)}<div class="post-meta"><span>${o.type}</span><span>${fmtDate(o.date)}</span></div><h3>${o.title}</h3><p>${o.lead}</p></a>`).join('')}</div>
</section>
${innerCta(rel, 'ct1', 'Остались вопросы по теме?', 'Напишите — инженер ответит и при необходимости подготовит подбор оборудования под вашу задачу.')}`;
  return layout({ rel, title: `${n.title} — MEDITECH`, desc: n.lead, path: `news/${n.slug}.html`, body, current: 'news/', ogImage: img[n.photo] });
}

/* ------------------------------------------------------------------ CONTACTS */
function contactsPage() {
  const rel = '../';
  const body = `
<section class="wrap page-hero">
  ${crumbs(rel, [['Контакты']])}
  <div class="page-hero-grid"><h1 data-reveal data-i18n="nav.contacts">Контакты</h1><p class="page-lead" data-reveal style="--d:100ms">Офис и склад в Ташкенте, поставки по всему Узбекистану. Напишите в мессенджер — отвечаем в рабочее время в течение часа.</p></div>
</section>
<section class="wrap" aria-label="Контактные данные">
  <div class="contacts-grid">
    <div class="c-list" data-stagger="80">
      <div><h4>Телефон</h4><a href="${company.phoneHref}">${company.phone}</a></div>
      <div><h4>Почта</h4><a href="mailto:${company.email}">${company.email}</a></div>
      <div><h4>Адрес</h4><p>${company.address}</p></div>
      <div><h4>Режим работы</h4><p>${company.hours}</p></div>
      <div><h4 data-i18n="footer.messengers">Мессенджеры</h4><a href="${company.telegram}" target="_blank" rel="noopener">Telegram</a><a href="${company.whatsapp}" target="_blank" rel="noopener">WhatsApp</a></div>
    </div>
    <div class="c-map" data-reveal="scale"><iframe title="Карта: офис MEDITECH в Ташкенте" src="https://yandex.uz/map-widget/v1/?ll=69.279737%2C41.311151&z=12" loading="lazy" allowfullscreen></iframe></div>
    <div class="c-form" data-reveal><h2 style="font-size:var(--step-lead);margin-bottom:20px">Написать нам</h2>${leadForm('contacts')}</div>
  </div>
</section>
<div style="height:var(--section)"></div>`;
  return layout({ rel, title: 'Контакты — MEDITECH, Ташкент', desc: 'Контакты MEDITECH: телефон, почта, адрес офиса и склада в Ташкенте, Telegram и WhatsApp.', path: 'contacts/', body, current: 'contacts/' });
}

function privacyPage() {
  const rel = '../';
  const body = `<section class="wrap page-hero">${crumbs(rel, [['Политика конфиденциальности']])}<div class="page-hero-grid"><h1 data-reveal>Политика конфиденциальности</h1></div>
  <div class="article"><div class="art-body" style="grid-column:1 / span 8;margin-top:40px" data-reveal><p>Оставляя заявку на сайте, вы передаёте имя, телефон и название организации. Данные используются только для связи с вами по вашему запросу и подготовки коммерческого предложения.</p><p>Данные хранятся в CRM компании и не передаются третьим лицам, кроме случаев, предусмотренных законодательством Республики Узбекистан. Вы можете запросить удаление своих данных, написав на ${company.email}.</p><p class="muted small">Текст политики — шаблон. Перед запуском его согласует юрист клиента.</p></div></div></section><div style="height:var(--section)"></div>`;
  return layout({ rel, title: 'Политика конфиденциальности — MEDITECH', desc: 'Политика обработки персональных данных сайта MEDITECH.', path: 'privacy/', body });
}

/* ------------------------------------------------------------------ WRITE */
const out = (p, s) => { const f = join(ROOT, p); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, s); };
['catalog', 'brands', 'services', 'leasing', 'about', 'news', 'contacts', 'privacy'].forEach((d) => { if (existsSync(join(ROOT, d))) rmSync(join(ROOT, d), { recursive: true }); });

out('index.html', home());
out('catalog/index.html', catalogIndex());
categories.forEach((c) => out(`catalog/${c.slug}/index.html`, categoryPage(c)));
products.forEach((p) => out(prodUrl(p), productPage(p)));
out('brands/index.html', brandsPage());
out('services/index.html', servicesPage());
out('leasing/index.html', leasingPage());
out('about/index.html', aboutPage());
out('news/index.html', newsIndex());
news.forEach((n) => out(`news/${n.slug}.html`, articlePage(n)));
out('contacts/index.html', contactsPage());
out('privacy/index.html', privacyPage());

// Client-side data for search / picker
const base = '/meditech-site/';
out('assets/js/data.js', `window.MT_DATA=${JSON.stringify({
  base: '',
  i18n,
  categories: categories.map((c) => ({ slug: c.slug, name: c.name, short: c.short, url: catUrl(c) })),
  products: products.map((p) => ({ slug: p.slug, name: p.name, short: p.short, status: p.status, brandName: brandOf(p.brand).name, catName: catOf(p.cat).name, url: prodUrl(p), thumb: photo(p.photo, 112, 112) })),
})};window.MT_DATA.base=(function(){var s=document.currentScript&&document.currentScript.getAttribute('src')||'';return s.replace(/assets\\/js\\/data\\.js$/,'');})();`);

out('assets/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#0b7a75"/><rect x="14" y="7" width="4" height="18" fill="#fff"/><rect x="7" y="14" width="18" height="4" fill="#fff"/></svg>`);
const urls = ['', 'catalog/', ...categories.map(catUrl), ...products.map(prodUrl), 'brands/', 'services/', 'leasing/', 'about/', 'news/', ...news.map((n) => `news/${n.slug}.html`), 'contacts/'];
out('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE}/${u}</loc></url>`).join('\n')}\n</urlset>\n`);
out('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
out('.nojekyll', '');
console.log(`Built ${urls.length + 1} pages.`);
