# NegahJavan

نسخه تمیز و مستقل «نگاه جوان» برای Cloudflare Workers.

## معماری
- Cloudflare Worker: رابط عمومی، API و پنل تحریریه
- Cloudflare D1: خبرها و دسته‌بندی‌ها
- بدون R2؛ تصاویر بعداً با URL از Arvan استفاده می‌شوند
- Secrets فقط در Cloudflare: `ADMIN_PASSWORD` و `AUTH_SECRET`

## مسیرها
- `/` صفحه اصلی
- `/editorial` پنل تحریریه
- `/api/health` وضعیت Worker / D1 / Auth
- `/category/:slug` دسته خبر
- `/news/:slug` صفحه خبر

## راه‌اندازی Cloudflare
1. ریپو را به Cloudflare Workers متصل و Worker را با نام `negahjavan` Deploy کنید.
2. یک D1 تازه با نام `negahjavan-db` بسازید.
3. در Settings > Bindings یک D1 binding با نام دقیق `DB` به همان دیتابیس اضافه کنید.
4. در Settings > Variables and Secrets دو Secret بسازید: `ADMIN_PASSWORD` و `AUTH_SECRET`.
5. Worker جداول را در اولین درخواست به‌صورت خودکار می‌سازد؛ اجرای دستی schema لازم نیست.

برای `AUTH_SECRET` از یک رشته تصادفی طولانی (حداقل 32 بایت) استفاده کنید.

## توسعه محلی
```bash
npm install
npm run check
npm test
npm run dev
```
