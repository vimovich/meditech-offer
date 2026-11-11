# MEDITECH — шаблон корпоративного сайта-каталога

Статический многостраничный шаблон (RU / UZ / EN) по ТЗ клиента. Публикуется на GitHub Pages.

## Структура
- `src/data.mjs` — категории, товары, бренды, новости, FAQ, контакты (заглушки до интеграции с 1С)
- `src/i18n.mjs` — строки интерфейса на трёх языках
- `src/build.mjs` — генератор страниц (`node src/build.mjs`)
- `assets/css/style.css`, `assets/js/main.js` — стили и поведение
- Сгенерированные страницы: `index.html`, `catalog/…`, `brands/`, `services/`, `leasing/`, `about/`, `news/`, `contacts/`, `privacy/`, `sitemap.xml`, `robots.txt`

## Интеграции (точки подключения)
- Формы: `assets/js/main.js` → `handleForm` — payload с источником страницы/товара, отправка в CRM и Telegram-бот
- Аналитика: `window.dataLayer.push({event:'lead_submit'})` на каждую отправку формы
- Фото: Unsplash (бесплатная лицензия), заменяются на фото клиента
