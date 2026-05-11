# Garage Management System - Deployment Guide

دليل النشر الكامل لنظام إدارة ورشة السيارات.

## الخطوات اليدوية المطلوبة

### 1. إعداد قاعدة البيانات PostgreSQL

#### على Render (Recommended)

1. قم بإنشاء حساب على [Render](https://render.com)
2. أنشئ PostgreSQL Database جديد
3. احصل على رابط الاتصال (DATABASE_URL)
4. احفظ الرابط في مكان آمن

#### محلياً (للتطوير)

1. ثبت PostgreSQL على جهازك
2. أنشئ قاعدة بيانات جديدة:
```sql
CREATE DATABASE garage_db;
```

### 2. نشر Backend على Render

1. أنشئ حساب على [Render](https://render.com)
2. أنشئ New Web Service
3. قم بربط المشروع من GitHub
4. إعدادات البناء:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. إعدادات البيئة:
   - `DATABASE_URL`: رابط قاعدة البيانات من Render PostgreSQL
   - `PORT`: 3000
6. اضغط Deploy

### 3. نشر Flutter Web على Cloudflare Pages

1. بناء تطبيق Flutter Web:
```bash
cd frontend
flutter build web
```

2. أنشئ حساب على [Cloudflare Pages](https://pages.cloudflare.com)
3. أنشئ مشروع جديد
4. رفع مجلد `frontend/build/web` أو ربط من GitHub
5. إعدادات البيئة:
   - `API_BASE_URL`: رابط Backend من Render
6. اضغط Deploy

### 4. إعداد DNS (اختياري)

1. اشترِ اسم نطاق (Domain)
2. في Cloudflare:
   - أضف النطاق إلى حسابك
   - أنشئ CNAME record للـ Backend
   - أنشئ CNAME record للـ Frontend

### 5. إعداد WhatsApp (اختياري - مستقبلي)

لتفعيل WhatsApp لاحقاً:
1. سجل في WhatsApp Business API
2. احصل على API Key
3. عدّل `src/whatsapp/whatsapp.service.ts` لإضافة التنفيذ الفعلي
4. أضف متغيرات البيئة:
   - `WHATSAPP_API_KEY`
   - `WHATSAPP_PHONE_NUMBER_ID`

### 6. تشغيل التهجيرات على Render

بعد نشر Backend لأول مرة:
1. افتح Render Dashboard
2. اذهب إلى Web Service
3. افتح Shell
4. شغّل:
```bash
npm run prisma:migrate
```

### 7. اختبار النظام

1. افتح رابط Frontend من Cloudflare
2. تأكد من الاتصال بالـ Backend
3. جرّب إضافة عميل وسيارة
4. تأكد من عمل QR Code

## ملاحظات مهمة

### الأمان

- لا تشارك ملف `.env` أو `DATABASE_URL`
- استخدم HTTPS في الإنتاج
- فعل Authentication في المستقبل

### النسخ الاحتياطي

- Render PostgreSQL يقوم بإنشاء نسخ احتياطية تلقائية
- تأكد من إعدادات النسخ الاحتياطي صحيحة

### المراقبة

- استخدم Render Logs لمراقبة الأخطاء
- استخدم Cloudflare Analytics لمراقبة الزوار

## تكلفة التقديرية

### Render
- PostgreSQL: $7/شهر (Free tier قد يكون متاح)
- Web Service: $7/شهر (Free tier قد يكون متاح)

### Cloudflare Pages
- مجاني تماماً

### إجمالي تقديري: $14/شهر (أو مجاني مع Free Tiers)

## الدعم

في حال وجود مشاكل:
1. تحقق من Logs في Render
2. تأكد من صحة DATABASE_URL
3. تأكد من أن Backend يعمل
4. تأكد من أن Flutter يتصل بالرابط الصحيح
