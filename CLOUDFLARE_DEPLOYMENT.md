# دليل النشر على Cloudflare Pages

## نظرة عامة
هذا الدليل يشرح كيفية نشر Web Panel على Cloudflare Pages بدلاً من Vercel.

## الخطوات

### 1. إعداد Cloudflare Pages

#### الطريقة الأولى: عبر Git Integration

1. سجل دخول إلى [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. اذهب إلى **Pages** → **Create a project**
3. اختر **Connect to Git**
4. اختر repository: `karam-55/garage-management-system`
5. إعدادات البناء:
   - **Build command:** `npm run build`
   - **Build output directory:** `.next`
   - **Root directory:** `apps/web-panel`
6. إعدادات Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `https://garage-backend.onrender.com`
   - `NODE_ENV`: `production`
7. انقر على **Save and Deploy**

بعد النشر، سيكون الـ URL:
```
https://garage-management-system.pages.dev
```

#### الطريقة الثانية: عبر Wrangler CLI

```bash
# تثبيت Wrangler
npm install -g wrangler

# تسجيل الدخول
wrangler login

# بناء المشروع
cd apps/web-panel
npm install
npm run build

# النشر
wrangler pages deploy .next
```

### 2. إعدادات DNS (اختياري)

إذا كان لديك domain خاص:

1. اذهب إلى Cloudflare Dashboard
2. اختر domain الخاص بك
3. أضف CNAME record:
   - **Name:** `garage` (أو أي اسم تريده)
   - **Target:** `garage-management-system.pages.dev`
   - **Proxy status:** Proxied (Cloudflare orange cloud)

### 3. تحديث Environment Variables في Backend

في Render Dashboard:
1. اذهب إلى backend service
2. اذهب إلى Environment Variables
3. تحديث:
   - `CORS_ORIGIN`: `https://garage-management-system.pages.dev`
   - `SOCKET_CORS_ORIGIN`: `https://garage-management-system.pages.dev`

### 4. إعدادات الـ Headers والـ Redirects

الملفات موجودة بالفعل في `apps/web-panel/`:
- `_headers`: إعدادات security headers
- `_redirects`: إعدادات redirects لـ Next.js
- `wrangler.toml`: إعدادات Wrangler

### 5. Auto Deployment

Cloudflare Pages سيقوم تلقائياً بـ:
- مراقبة repository
- بناء المشروع عند كل push
- نشر النسخة الجديدة

### 6. التحقق من النشر

1. افتح URL: `https://garage-management-system.pages.dev`
2. تأكد من أن جميع الصفحات تعمل
3. تأكد من أن API calls تعمل بشكل صحيح
4. تأكد من أن Auth يعمل

### 7. إعدادات إضافية (اختياري)

#### Analytics
- Cloudflare Pages Web Analytics مُفعّل افتراضياً
- يمكن إعداده من Dashboard

#### Custom Domain
- يمكن إضافة custom domain من Dashboard
- سيقوم Cloudflare تلقائياً بإصدار SSL certificate

#### Access Control
- يمكن إضافة Cloudflare Access لحماية التطبيق
- مفيد للـ staging environments

## المزايا

- **سرعة:** Cloudflare CDN عالمي
- **مجاني:** 500 requests/second مجاني
- **SSL:** SSL/TLS مجاني
- **DDoS Protection:** مدمج
- **Analytics:** مجاني

## الدعم

للدعم الفني:
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare Community](https://community.cloudflare.com/)
