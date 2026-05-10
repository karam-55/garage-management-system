# Garage Management System - Backend API

نظام إدارة ورشة السيارات - Backend API مُبني بـ NestJS و Prisma و PostgreSQL.

## التقنيات المستخدمة

- **Framework**: NestJS
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Validation**: class-validator
- **Language**: TypeScript

## هيكل المشروع

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── prisma.config.ts       # Prisma configuration
├── src/
│   ├── main.ts                # Application entry point
│   ├── app.module.ts          # Root module
│   ├── prisma.service.ts      # Prisma client service
│   ├── customers/             # Customers module
│   │   ├── customers.module.ts
│   │   ├── customers.controller.ts
│   │   ├── customers.service.ts
│   │   └── customers.dto.ts
│   ├── vehicles/              # Vehicles module
│   ├── technicians/           # Technicians module
│   ├── bookings/              # Bookings module
│   ├── invoices/              # Invoices module
│   ├── inventory/             # Inventory module
│   ├── notifications/         # Notifications module
│   ├── tracking/              # Vehicle tracking module
│   └── whatsapp/              # WhatsApp placeholder service
├── .env.example               # Environment variables example
├── package.json
└── tsconfig.json
```

## إعداد البيئة

### المتطلبات الأساسية

- Node.js (v18 أو أحدث)
- PostgreSQL (v14 أو أحدث)
- npm أو yarn

### خطوات التثبيت

1. استنساخ المشروع:
```bash
cd backend
```

2. تثبيت التبعيات:
```bash
npm install
```

3. إعداد متغيرات البيئة:
```bash
cp .env.example .env
```

عدّل ملف `.env` وأضف رابط قاعدة البيانات:
```
DATABASE_URL="postgresql://user:password@localhost:5432/garage_db?schema=public"
PORT=3000
```

4. توليد Prisma Client:
```bash
npm run prisma:generate
```

5. تشغيل التهجيرات (إنشاء الجداول في قاعدة البيانات):
```bash
npm run prisma:migrate
```

## تشغيل المشروع

### وضع التطوير (Development)
```bash
npm run dev
```

### وضع الإنتاج (Production)
```bash
npm run build
npm start
```

## API Endpoints

### العملاء (Customers)
- `GET /customers` - الحصول على جميع العملاء
- `GET /customers/:id` - الحصول على عميل محدد
- `POST /customers` - إضافة عميل جديد
- `PUT /customers/:id` - تعديل عميل
- `DELETE /customers/:id` - حذف عميل

### السيارات (Vehicles)
- `GET /vehicles` - الحصول على جميع السيارات
- `GET /vehicles/:id` - الحصول على سيارة محددة
- `POST /vehicles` - إضافة سيارة جديدة
- `PUT /vehicles/:id` - تعديل سيارة
- `DELETE /vehicles/:id` - حذف سيارة

### الفنيين (Technicians)
- `GET /technicians` - الحصول على جميع الفنيين
- `GET /technicians/:id` - الحصول على فني محدد
- `POST /technicians` - إضافة فني جديد
- `PUT /technicians/:id` - تعديل فني
- `DELETE /technicians/:id` - حذف فني

### الحجوزات (Bookings)
- `GET /bookings` - الحصول على جميع الحجوزات
- `GET /bookings/:id` - الحصول على حجز محدد
- `POST /bookings` - إضافة حجز جديد
- `PUT /bookings/:id` - تعديل حجز
- `DELETE /bookings/:id` - حذف حجز

### الفواتير (Invoices)
- `GET /invoices` - الحصول على جميع الفواتير
- `GET /invoices/:id` - الحصول على فاتورة محددة
- `POST /invoices` - إضافة فاتورة جديدة
- `PUT /invoices/:id` - تعديل فاتورة
- `DELETE /invoices/:id` - حذف فاتورة

### المخزون (Inventory)
- `GET /inventory` - الحصول على جميع عناصر المخزون
- `GET /inventory/:id` - الحصول على عنصر محدد
- `POST /inventory` - إضافة عنصر جديد
- `PUT /inventory/:id` - تعديل عنصر
- `DELETE /inventory/:id` - حذف عنصر

### الإشعارات (Notifications)
- `GET /notifications` - الحصول على جميع الإشعارات
- `GET /notifications/:id` - الحصول على إشعار محدد
- `DELETE /notifications/:id` - حذف إشعار

### تتبع السيارة (Vehicle Tracking)
- `GET /track/:vehicleId` - تتبع سيارة (بدون تسجيل دخول)

## Database Schema

يحتوي النظام على الكيانات التالية:

- **Customer**: العملاء
- **Vehicle**: السيارات
- **Technician**: الفنيين
- **Booking**: الحجوزات
- **Invoice**: الفواتير
- **InventoryItem**: عناصر المخزون
- **Notification**: الإشعارات
- **VehicleTracking**: تتبع السيارات

## WhatsApp Integration

الخدمة موجودة كـ placeholder فقط للتنفيذ المستقبلي. لا يتم إرسال أي رسائل فعالية حالياً.

## CORS

تم تفعيل CORS للسماح بطلبات من أي مصدر. قم بتحديث الإعدادات في `main.ts` للإنتاج.

## Error Handling

تُرجع الـ API رموز HTTP التالية:
- `200` - نجاح
- `400` - خطأ في الطلب
- `404` - المورد غير موجود
- `500` - خطأ في السيرفر

## الترخيص

ISC
