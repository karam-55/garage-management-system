# دليل التشغيل السريع لنظام إدارة الكراج
# Garage Management System - Quick Start Guide

**إعداد بواسطة**: Senior Full-Stack Engineer + DevOps + Architect
**الإصدار**: 1.0
**التاريخ**: 2024

---

## جدول المحتويات

1. [متطلبات النظام](#1-متطلبات-النظام)
2. [تثبيت البرامج](#2-تثبيت-البرامج)
3. [إعداد قاعدة البيانات](#3-إعداد-قاعدة-البيانات)
4. [إعداد ملف .env](#4-إعداد-ملف-env)
5. [تثبيت المشروع](#5-تثبيت-المشروع)
6. [تشغيل النظام](#6-تشغيل-النظام)
7. [بناء التطبيقات](#7-بناء-التطبيقات)
8. [تجربة سيناريو كامل](#8-تجربة-سيناريو-كامل)
9. [حل المشكلات](#9-حل-المشكلات)

---

## 1. متطلبات النظام

### 1.1 متطلبات الأجهزة

- **CPU**: Intel Core i5 أو أعلى (أو AMD equivalent)
- **RAM**: 8GB كحد أدنى، 16GB موصى به
- **Storage**: 20GB مساحة حرة
- **OS**: Windows 10 أو 11

### 1.2 متطلبات البرامج

- **Node.js**: v18.0.0 أو أعلى
- **pnpm**: v8.0.0 أو أعلى
- **PostgreSQL**: v15.0 أو أعلى
- **Flutter SDK**: v3.0.0 أو أعلى
- **Git**: أحدث إصدار
- **Java JDK**: v11 أو أعلى (لـ Flutter Android build)
- **Android Studio**: أحدث إصدار (اختياري، لبناء APK)

---

## 2. تثبيت البرامج

### 2.1 تثبيت Node.js

1. تحميل Node.js من: https://nodejs.org/
2. اختر LTS version (مثلاً v20.x)
3. قم بتثبيت مع خيارات افتراضية
4. تحقق من التثبيت:
```bash
node --version
npm --version
```

### 2.2 تثبيت pnpm

```bash
npm install -g pnpm
```

تحقق من التثبيت:
```bash
pnpm --version
```

### 2.3 تثبيت PostgreSQL

1. تحميل PostgreSQL من: https://www.postgresql.org/download/windows/
2. اختر الإصدار 15 أو أعلى
3. قم بتثبيت مع خيارات:
   - Port: 5432 (افتراضي)
   - Password: اختر كلمة مرور قوية (احفظها)
   - قم بتحديد pgAdmin أثناء التثبيت
4. تحقق من التثبيت:
```bash
psql --version
```

### 2.4 تثبيت Flutter

1. تحميل Flutter SDK من: https://flutter.dev/docs/get-started/install/windows
2. استخرج الملفات إلى: `C:\flutter`
3. إضافة Flutter إلى PATH:
   - ابحث عن "Environment Variables" في Windows
   - أضف `C:\flutter\bin` إلى Path
4. تحقق من التثبيت:
```bash
flutter --version
flutter doctor
```

### 2.5 تثبيت Git

1. تحميل Git من: https://git-scm.com/download/win
2. قم بتثبيت مع خيارات افتراضية
3. تحقق من التثبيت:
```bash
git --version
```

### 2.6 تثبيت Java JDK (لـ Flutter)

1. تحميل Java JDK من: https://adoptium.net/
2. اختر Temurin JDK 11 أو 17
3. قم بتثبيت مع خيارات افتراضية
4. تحقق من التثبيت:
```bash
java -version
```

---

## 3. إعداد قاعدة البيانات

### 3.1 إنشاء قاعدة البيانات

1. افتح pgAdmin
2. قم بتسجيل الدخول باستخدام كلمة المرور التي اخترتها
3. انقر بزر الماوس الأيمن على "Databases"
4. اختر "Create" → "Database"
5. أدخل:
   - Database name: `garage_db`
   - Owner: `postgres` (أو المستخدم الذي أنشأته)
6. انقر "Save"

### 3.2 إنشاء مستخدم (اختياري)

```sql
-- افتح Query Tool في pgAdmin
-- نفذ الأمر التالي:

CREATE USER garage_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE garage_db TO garage_user;
```

### 3.3 تشغيل PostgreSQL Service

تأكد من أن PostgreSQL service يعمل:

1. افتح Services (Win + R → services.msc)
2. ابحث عن "postgresql-x64-15"
3. تأكد من أن الحالة "Running"

أو عبر command line:
```bash
net start postgresql-x64-15
```

---

## 4. إعداد ملف .env

### 4.1 إنشاء ملف .env للـ Backend

انتقل إلى: `apps/backend/`

أنشئ ملف جديد: `.env`

أضف المحتوى التالي:

```env
# Database
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/garage_db"

# JWT
JWT_SECRET="your-secret-key-change-in-production-min-32-chars"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=development

# WhatsApp
WHATSAPP_API_KEY=""
WHATSAPP_API_URL="https://api.whatsapp.com/v1"
WHATSAPP_ENABLED="false"

# CORS
CORS_ORIGIN="http://localhost:3001,http://localhost:3000"

# Socket
SOCKET_CORS_ORIGIN="http://localhost:3001"
```

**مهم**: استبدل `your_password` بكلمة مرور PostgreSQL الفعلية.
**مهم**: استبدل `your-secret-key-change-in-production-min-32-chars` بمفتاح سري قوي (32 حرف على الأقل).

### 4.2 إنشاء ملف .env للـ Web Panel

انتقل إلى: `apps/web-panel/`

أنشئ ملف جديد: `.env.local`

أضف المحتوى التالي:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 5. تثبيت المشروع

### 5.1 استنساخ المشروع (إذا كان في Git)

```bash
git clone <repository-url>
cd garage-management-system
```

### 5.2 تثبيت Dependencies

في المجلد الجذري للمشروع:

```bash
# تثبيت جميع dependencies
pnpm install

# تثبيت dependencies لكل app
pnpm install --filter @garage/backend
pnpm install --filter @garage/web-panel
pnpm install --filter @garage/desktop-app
```

تثبيت Flutter dependencies:
```bash
cd apps/mobile-app
flutter pub get
cd ../..
```

---

## 6. تشغيل النظام

### 6.1 تشغيل Backend

افتح Terminal جديد:

```bash
cd apps/backend

# تشغيل Prisma migrations
npx prisma migrate dev

# تشغيل Prisma generate
npx prisma generate

# تشغيل Backend في وضع التطوير
pnpm dev
```

**النتيجة المتوقعة**:
- Backend يعمل على: http://localhost:3000
- API Documentation: http://localhost:3000/api
- رسالة في Terminal: "🚀 Backend is running on http://localhost:3000"

### 6.2 تشغيل Web Panel

افتح Terminal جديد:

```bash
cd apps/web-panel

# تشغيل Web Panel في وضع التطوير
pnpm dev
```

**النتيجة المتوقعة**:
- Web Panel يعمل على: http://localhost:3001
- يفتح تلقائياً في المتصفح

### 6.3 تشغيل Desktop App (Development)

افتح Terminal جديد:

```bash
cd apps/desktop-app

# تشغيل Desktop App في وضع التطوير
pnpm dev
```

**النتيجة المتوقعة**:
- Desktop App يفتح تلقائياً
- يعرض Web Panel داخل Electron

### 6.4 تشغيل Flutter App على المحاكي

افتح Terminal جديد:

```bash
cd apps/mobile-app

# تشغيل على المحاكي
flutter run

# أو تحديد جهاز محدد
flutter devices
flutter run -d <device-id>
```

**النتيجة المتوقعة**:
- Flutter App يعمل على المحاكي أو الجهاز
- يظهر التطبيق على الشاشة

---

## 7. بناء التطبيقات

### 7.1 بناء EXE للويندوز

```bash
cd apps/desktop-app

# بناء Desktop App
pnpm build

# ملف EXE يُنشأ في: dist/
```

**النتيجة المتوقعة**:
- ملف EXE في: `apps/desktop-app/dist/`
- اسم الملف: `Garage Management Setup.exe` (لـ NSIS)
- أو `Garage Management.exe` (لـ Portable)

### 7.2 بناء APK للأندرويد

```bash
cd apps/mobile-app

# بناء APK Debug
flutter build apk --debug
# APK يُنشأ في: build/app/outputs/flutter-apk/app-debug.apk

# بناء APK Release
flutter build apk --release
# APK يُنشأ في: build/app/outputs/flutter-apk/app-release.apk
```

**النتيجة المتوقعة**:
- ملف APK في: `apps/mobile-app/build/app/outputs/flutter-apk/`
- اسم الملف: `app-debug.apk` أو `app-release.apk`

---

## 8. تجربة سيناريو كامل

### 8.1 السيناريو: إدخال سيارة → تعيين ميكانيكي → تحديث الحالة → إرسال إشعار → إصدار فاتورة

#### الخطوة 1: فتح Web Panel

1. افتح المتصفح
2. اذهب إلى: http://localhost:3001
3. ستظهر صفحة تسجيل الدخول

#### الخطوة 2: تسجيل الدخول

1. أدخل البريد الإلكتروني: `admin@garage.com`
2. أدخل كلمة المرور: `admin123`
3. اضغط "Login"

#### الخطوة 3: إدخال عميل جديد

1. اذهب إلى "Customers" من القائمة الجانبية
2. اضغط زر "Add Customer"
3. أدخل البيانات:
   - Full Name: محمد أحمد
   - Phone: 0501234567
   - Email: mohammed@example.com
   - Address: الرياض، حي الملز
4. اضغط "Save"

#### الخطوة 4: إدخال سيارة جديدة

1. افتح ملف العميل (اضغط على اسم العميل)
2. اضغط زر "Add Vehicle"
3. أدخل البيانات:
   - License Plate: ABC1234
   - Make: Toyota
   - Model: Camry
   - Year: 2020
   - Mileage: 50000
4. اضغط "Save"

#### الخطوة 5: إنشاء حجز

1. اذهب إلى "Bookings" من القائمة الجانبية
2. اضغط زر "New Booking"
3. أدخل البيانات:
   - Customer: محمد أحمد
   - Vehicle: Toyota Camry - ABC1234
   - Service: تغيير الزيت
   - Scheduled Date: اختر تاريخ ووقت
   - Notes: الصيانة الدورية
4. اضغط "Save"
5. سيُطبع QR Code تلقائياً

#### الخطوة 6: تعيين ميكانيكي

1. افتح الحجز (اضغط على رقم الحجز)
2. اضغط زر "Assign Mechanic"
3. اختر ميكانيكي متاح من القائمة
4. اضغط "Save"

#### الخطوة 7: تحديث الحالة من Flutter App

1. افتح Flutter App على المحاكي
2. سجل الدخول كـ Mechanic
3. اذهب إلى "My Bookings"
4. افتح الحجز المُسند إليك
5. اضغط زر "Start Work"
6. أدخل وصف العمل: "بدء تغيير الزيت"
7. اضغط "Save"

#### الخطوة 8: إرسال إشعار

- النظام يُرسل إشعار واتساب تلقائياً للعميل
- يمكنك التحقق من الإشعار في:
  - Backend: http://localhost:3000/api
  - أو في Notifications Queue

#### الخطوة 9: إصدار فاتورة

1. في Web Panel، اذهب إلى "Invoices"
2. اضغط زر "Create from Booking"
3. اختر الحجز
4. اضغط "Create"
5. الفاتورة تُنشأ تلقائياً مع:
   - الخدمة الأساسية
   - الضريبة 15%
   - الإجمالي

#### الخطوة 10: دفع

1. افتح الفاتورة
2. اضغط زر "Add Payment"
3. أدخل البيانات:
   - Amount: المبلغ الكامل
   - Payment Method: Cash
4. اضغط "Save"
5. حالة الفاتورة تتغير إلى "PAID"

---

## 9. حل المشكلات

### 9.1 مشكلة: Backend لا يعمل

**الأعراض**:
- رسالة خطأ عند تشغيل Backend
- Backend لا يعمل على http://localhost:3000

**الحل**:
```bash
# تحقق من أن PostgreSQL يعمل
net start postgresql-x64-15

# تحقق من ملف .env
cd apps/backend
cat .env

# تأكد من DATABASE_URL صحيح
# أعد تشغيل Backend
pnpm dev
```

### 9.2 مشكلة: Web Panel لا يتصل بـ Backend

**الأعراض**:
- Web Panel لا يعرض البيانات
- رسالة خطأ في Console

**الحل**:
```bash
# تحقق من أن Backend يعمل
# افتح http://localhost:3000/api في المتصفح

# تحقق من ملف .env.local في Web Panel
cd apps/web-panel
cat .env.local

# تأكد من NEXT_PUBLIC_API_URL صحيح
# أعد تشغيل Web Panel
pnpm dev
```

### 9.3 مشكلة: Prisma Migration فشل

**الأعراض**:
- رسالة خطأ عند تشغيل `npx prisma migrate dev`

**الحل**:
```bash
cd apps/backend

# تحقق من DATABASE_URL
cat .env

# تأكد من أن PostgreSQL يعمل
# أعد تشغيل PostgreSQL service

# حاول مرة أخرى
npx prisma migrate dev
```

### 9.4 مشكلة: Flutter لا يعمل

**الأعراض**:
- رسالة خطأ عند تشغيل `flutter run`
- Flutter لا يكتشف الأجهزة

**الحل**:
```bash
# تشغيل Flutter Doctor
flutter doctor

# حل المشاكل المشار إليها
# عادةً تحتاج إلى:
# - تثبيت Android SDK
# - تثبيت Java JDK
# - إعداد Android SDK path

# بعد حل المشاكل
flutter run
```

### 9.5 مشكلة: Electron Build فشل

**الأعراض**:
- رسالة خطأ عند تشغيل `pnpm build`
- ملف EXE لا يُنشأ

**الحل**:
```bash
cd apps/desktop-app

# تحقق من dependencies
pnpm install

# حاول بناء مجلد فقط
pnpm pack

# إذا فشل، تحقق من electron-builder.yml
cat electron-builder.yml
```

---

## روابط الوصول

- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api
- **Web Panel**: http://localhost:3001
- **Desktop App**: يفتح تلقائياً عند التشغيل
- **Flutter App**: يعمل على المحاكي أو الجهاز

---

## الدعم

إذا واجهت أي مشكلة:
1. راجع قسم "حل المشكلات"
2. تحقق من Logs في Terminal
3. تحقق من Console في المتصفح (F12)
4. راجع ملف PROJECT_ARCHITECTURE.md

---

**النظام جاهز للاستخدام!**
