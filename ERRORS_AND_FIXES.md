# قائمة الأخطاء والثغرات المكتشفة
# List of Discovered Errors and Vulnerabilities

**إعداد بواسطة**: Senior QA Engineer + System Analyst + Architect
**التاريخ**: 2024
**الإصدار**: 1.0

---

## جدول المحتويات

1. [أخطاء قاعدة البيانات](#1-أخطاء-قاعدة-البيانات)
2. [أخطاء Backend](#2-أخطاء-backend)
3. [أخطاء Web Panel](#3-أخطاء-web-panel)
4. [أخطاء Desktop App](#4-أخطاء-desktop-app)
5. [أخطاء Mobile App](#6-أخطاء-mobile-app)
6. [أخطاء الإشعارات و WhatsApp](#7-أخطاء-الإشعارات-واتساب)
7. [أخطاء الصلاحيات والأمان](#8-أخطاء-الصلاحيات-والأمان)
8. [أخطاء الفواتير والدفع](#9-أخطاء-الفواتير-والدفع)
9. [أخطاء المخزون](#10-أخطاء-المخزون)
10. [أخطاء السيناريوهات](#11-أخطاء-السيناريوهات)

---

## 1. أخطاء قاعدة البيانات

### خطأ 1: تضارب قاعدة البيانات (SQLite vs PostgreSQL)

**عنوان المشكلة**: تضارب قاعدة البيانات بين SQLite و PostgreSQL

**سبب المشكلة**:
- `garage-go-backend/prisma/schema.prisma` يستخدم SQLite
- `DATABASE_SCHEMA_SQL.sql` صُمم لـ PostgreSQL
- المشروع الجديد `apps/backend` لا يوجد فيه schema.prisma

**تأثير المشكلة**:
- لا يمكن استخدام DATABASE_SCHEMA_SQL.sql مع SQLite
- ميزات PostgreSQL المتقدمة (JSONB, ENUMs, Triggers) غير مدعومة في SQLite
- Audit Trail، Soft Delete، وغيرها من الميزات المتقدمة لن تعمل
- النظام لن يعمل بشكل صحيح

**الإصلاح المقترح**:
1. استخدام PostgreSQL في المشروع الجديد (كما صُمم في DATABASE_SCHEMA_SQL.sql)
2. إنشاء schema.prisma في `apps/backend/prisma/schema.prisma` يدعم PostgreSQL
3. تحويل DATABASE_SCHEMA_SQL.sql إلى Prisma Schema
4. إنشاء Prisma Migration

**الحالة**: ⏳ بانتظار الإصلاح

---

### خطأ 2: Migration غير موجود

**عنوان المشكلة**: لا يوجد Prisma Migration

**سبب المشكلة**:
- لا يوجد مجلد `migrations` في المشروع الجديد
- لا يوجد migration file
- قاعدة البيانات غير مُهيأة

**تأثير المشكلة**:
- قاعدة البيانات غير موجودة
- الجداول غير مُنشأة
- النظام لن يعمل

**الإصلاح المقترح**:
1. إنشاء Prisma Migration
2. تشغيل `npx prisma migrate dev`
3. تشغيل `npx prisma generate`

**الحالة**: ⏳ بانتظار الإصلاح

---

### خطأ 3: Missing Foreign Key Constraints

**عنوان المشكلة**: بعض العلاقات في Prisma لا تحتوي onDelete: Cascade

**سبب المشكلة**:
- بعض العلاقات في schema.prisma لا تحتوي onDelete: Cascade
- قد يؤدي إلى orphan records عند حذف سجل

**تأثير المشكلة**:
- قد يؤدي إلى orphan records
- قاعدة البيانات قد تحتوي على بيانات غير صالحة

**الإصلاح المقترح**:
1. إضافة onDelete: Cascade لجميع العلاقات
2. إضافة onUpdate: Cascade إذا لزم الأمر

**الحالة**: ⏳ بانتظار الإصلاح

---

### خطأ 4: Missing Unique Constraints

**عنوان المشكلة**: لا يوجد unique constraint على (customer_id, plate) في Vehicles

**سبب المشكلة**:
- لا يوجد unique constraint على (customer_id, plate) في Vehicles
- قد تُضاف نفس السيارة مرتين لنفس العميل

**تأثير المشكلة**:
- تكرار البيانات
- ارتباك في إدارة السيارات

**الإصلاح المقترح**:
1. إضافة unique constraint على (customer_id, plate) في Vehicles
2. إضافة validation في Backend

**الحالة**: ⏳ بانتظار الإصلاح

---

## 2. أخطاء Backend

### خطأ 5: Modules الأساسية مفقودة

**عنوان المشكلة**: Modules الأساسية مفقودة في Backend

**سبب المشكلة**:
- فقط Auth و Users موجودين في Backend
- باقي Modules (Customers, Vehicles, Bookings, Services, etc.) مفقودة

**تأثير المشكلة**:
- Backend غير قابل للاستخدام
- لا يمكن إدارة الحجوزات، السيارات، الفواتير، etc.

**الإصلاح المقترح**:
1. إنشاء Customers Module
2. إنشاء Vehicles Module
3. إنشاء Bookings Module
4. إنشاء Services Module
5. إنشاء Additional Services Module
6. إنشاء Mechanics Module
7. إنشاء Mechanic Specializations Module
8. إنشاء Time Logs Module
9. إنشاء Invoices Module
10. إنشاء Payments Module
11. إنشاء Inventory Module
12. إنشاء Notifications Module
13. إنشاء Reports Module
14. إنشاء Garages Module
15. إنشاء Settings Module

**الحالة**: ⏳ بانتظار الإصلاح

---

### خطأ 6: Guards و Middlewares مفقودة

**عنوان المشكلة**: Guards و Middlewares مفقودة في Backend

**سبب المشكلة**:
- فقط JWT Strategy موجود
- Roles Guard غير موجود
- Permissions Guard غير موجود
- Validation Middleware غير موجود
- Error Handling Middleware غير موجود
- Logging Middleware غير موجود
- Rate Limiting Middleware غير موجود

**تأثير المشكلة**:
- الأمان ضعيف
- لا يمكن التحكم في الصلاحيات
- لا يوجد Validation مركزي
- لا يوجد Error Handling مركزي
- لا يوجد Logging مركزي
- لا يوجد Rate Limiting

**الإصلاح المقترح**:
1. إنشاء Roles Guard
2. إنشاء Permissions Guard
3. إنشاء Validation Middleware
4. إنشاء Error Handling Middleware
5. إنشاء Logging Middleware
6. إنشاء Rate Limiting Middleware

**الحالة**: ⏳ بانتظار الإصلاح

---

### خطأ 7: Services مفقودة

**عنوان المشكلة**: Services أساسية مفقودة في Backend

**سبب المشكلة**:
- Notification Service غير موجود
- WhatsApp Service غير موجود
- Email Service غير موجود
- SMS Service غير موجود
- QR Service غير موجود
- File Upload Service غير موجود

**تأثير المشكلة**:
- لا يمكن إرسال إشعارات
- لا يمكن إرسال واتساب
- لا يمكن توليد QR
- لا يمكن رفع الملفات

**الإصلاح المقترح**:
1. إنشاء Notification Service
2. إنشاء WhatsApp Service
3. إنشاء Email Service
4. إنشاء SMS Service
5. إنشاء QR Service
6. إنشاء File Upload Service

**الحالة**: ⏳ بانتظار الإصلاح

---

## 3. أخطاء Web Panel

### خطأ 8: Auth Screens مفقودة

**عنوان المشكلة**: Auth Screens مفقودة في Web Panel

**سبب المشكلة**:
- Login Screen غير موجود
- Register Screen غير موجود
- Forgot Password Screen غير موجود
- Reset Password Screen غير موجود

**تأثير المشكلة**:
- لا يمكن تسجيل الدخول
- لا يمكن التسجيل
- لا يمكن استعادة كلمة المرور

**الإصلاح المقترح**:
1. إنشاء Login Screen
2. إنشاء Register Screen
3. إنشاء Forgot Password Screen
4. إنشاء Reset Password Screen

**الحالة**: ⏳ بانتظار الإصلاح

---

### خطأ 9: Dashboard Screens مفقودة

**عنوان المشكلة**: Dashboard Screens مفقودة في Web Panel

**سبب المشكلة**:
- Receptionist Dashboard غير موجود
- Manager Dashboard غير موجود
- Owner Dashboard غير موجود
- Cashier Dashboard غير موجود

**تأثير المشكلة**:
- لا يوجد Dashboard لأي دور
- لا يمكن رؤية ملخص النشاط

**الإصلاح المقترح**:
1. إنشاء Receptionist Dashboard
2. إنشاء Manager Dashboard
3. إنشاء Owner Dashboard
4. إنشاء Cashier Dashboard

**الحالة**: ⏳ بانتظار الإصلاح

---

### خطأ 10: Feature Screens مفقودة

**عنوان المشكلة**: Feature Screens مفقودة في Web Panel

**سبب المشكلة**:
- Bookings Screens (CRUD) غير موجودة
- Customers Screens (CRUD) غير موجودة
- Vehicles Screens (CRUD) غير موجودة
- Services Screens (CRUD) غير موجودة
- Mechanics Screens (CRUD) غير موجودة
- Invoices Screens (CRUD) غير موجودة
- Inventory Screens (CRUD) غير موجودة
- Notifications Screen غير موجود
- Settings Screen غير موجود
- Reports Screen غير موجود

**تأثير المشكلة**:
- لا يمكن إدارة أي جزء من النظام
- Web Panel غير قابل للاستخدام

**الإصلاح المقترح**:
1. إنشاء Bookings Screens (List, Detail, New, Edit)
2. إنشاء Customers Screens (List, Detail, New, Edit)
3. إنشاء Vehicles Screens (List, Detail, New, Edit)
4. إنشاء Services Screens (List, Detail, New, Edit)
5. إنشاء Mechanics Screens (List, Detail, New, Edit)
6. إنشاء Invoices Screens (List, Detail, New, Edit)
7. إنشاء Inventory Screens (List, Detail, New, Edit)
8. إنشاء Notifications Screen
9. إنشاء Settings Screen
10. إنشاء Reports Screen

**الحالة**: ⏳ بانتظار الإصلاح

---

### خطأ 11: UI Components مفقودة

**عنوان المشكلة**: UI Components مفقودة في Web Panel

**سبب المشكلة**:
- Button, Input, Select, Modal, Table, Card, Form غير موجودة

**تأثير المشكلة**:
- لا يمكن بناء Screens
- يجب إعادة إنشاء كل Component

**الإصلاح المقترح**:
1. إنشاء Button Component
2. إنشاء Input Component
3. إنشاء Select Component
4. إنشاء Modal Component
5. إنشاء Table Component
6. إنشاء Card Component
7. إنشاء Form Component

**الحالة**: ⏳ بانتظار الإصلاح

---

### خطأ 12: Layout Components مفقودة

**عنوان المشكلة**: Layout Components مفقودة في Web Panel

**سبب المشكلة**:
- Sidebar, Header, Navbar غير موجودة

**تأثير المشكلة**:
- لا يوجد Layout للـ Pages
- لا يمكن التنقل بين Pages

**الإصلاح المقترح**:
1. إنشاء Sidebar Component
2. إنشاء Header Component
3. إنشاء Navbar Component

**الحالة**: ⏳ بانتظار الإصلاح

---

### خطأ 13: Services و Hooks مفقودة

**عنوان المشكلة**: Services و Hooks مفقودة في Web Panel

**سبب المشكلة**:
- API Client غير موجود
- Auth Hook غير موجود
- Booking Hook غير موجود
- Customer Hook غير موجود
- Vehicle Hook غير موجود
- Invoice Hook غير موجود

**تأثير المشكلة**:
- لا يمكن الاتصال بـ Backend
- لا يمكن إدارة State
- لا يمكن إدارة Auth

**الإصلاح المقترح**:
1. إنشاء API Client
2. إنشاء Auth Hook
3. إنشاء Booking Hook
4. إنشاء Customer Hook
5. إنشاء Vehicle Hook
6. إنشاء Invoice Hook

**الحالة**: ⏳ بانتظار الإصلاح

---

## 4. أخطاء Desktop App

### خطأ 14: Main Process مفقود

**عنوان المشكلة**: Main Process مفقود في Desktop App

**سبب المشكلة**:
- src/main/index.ts غير موجود
- src/main/window.ts غير موجود
- src/main/ipc.ts غير موجود

**تأثير المشكلة**:
- Desktop App غير قابل للعمل
- لا يوجد Window Management
- لا يوجد IPC Handlers

**الإصلاح المقترح**:
1. إنشاء src/main/index.ts
2. إنشاء src/main/window.ts
3. إنشاء src/main/ipc.ts

**الحالة**: ⏳ بانتظار الإصلاح

---

### خطأ 15: Renderer Process مفقود

**عنوان المشكلة**: Renderer Process مفقود في Desktop App

**سبب المشكلة**:
- src/renderer/index.html غير موجود
- src/renderer/index.tsx غير موجود
- src/renderer/App.tsx غير موجود

**تأثير المشكلة**:
- لا يوجد UI
- لا يوجد Content

**الإصلاح المقترح**:
1. إنشاء src/renderer/index.html
2. إنشاء src/renderer/index.tsx
3. إنشاء src/renderer/App.tsx

**الحالة**: ⏳ بانتظار الإصلاح

---

### خطأ 16: Preload Script مفقود

**عنوان المشكلة**: Preload Script مفقود في Desktop App

**سبب المشكلة**:
- src/preload/index.ts غير موجود

**تأثير المشكلة**:
- لا يوجد Bridge بين Main و Renderer
- لا يمكن استخدام Node APIs في Renderer

**الإصلاح المقترح**:
1. إنشاء src/preload/index.ts

**الحالة**: ⏳ بانتظار الإصلاح

---

### خطأ 17: Resources مفقودة

**عنوان المشكلة**: Resources مفقودة في Desktop App

**سبب المشكلة**:
- resources/icon.ico غير موجود
- resources/icon.png غير موجود

**تأثير المشكلة**:
- لا يوجد Icon للتطبيق
- App سيستخدم Icon افتراضي

**الإصلاح المقترح**:
1. إنشاء resources/icon.ico
2. إنشاء resources/icon.png

**الحالة**: ⏳ بانتظار الإصلاح

---

## 6. أخطاء Mobile App

### خطأ 18: Core Files مفقودة

**عنوان المشكلة**: Core Files مفقودة في Mobile App

**سبب المشكلة**:
- lib/main.dart غير موجود
- lib/app.dart غير موجود

**تأثير المشكلة**:
- Mobile App غير قابل للعمل
- لا يوجد Entry Point

**الإصلاح المقترح**:
1. إنشاء lib/main.dart
2. إنشاء lib/app.dart

**الحالة**: ⏳ بانتظار الإصلاح

---

### خطأ 19: Services مفقودة

**عنوان المشكلة**: Services مفقودة في Mobile App

**سبب المشكلة**:
- API Service غير موجود
- Auth Service غير موجود
- Storage Service غير موجود
- QR Service غير موجود
- Notification Service غير موجود

**تأثير المشكلة**:
- لا يمكن الاتصال بـ Backend
- لا يمكن إدارة Auth
- لا يمكن تخزين البيانات محلياً
- لا يمكن مسح QR
- لا يمكن استقبال إشعارات

**الإصلاح المقترح**:
1. إنشاء lib/services/api.service.dart
2. إنشاء lib/services/auth.service.dart
3. إنشاء lib/services/storage.service.dart
4. إنشاء lib/services/qr.service.dart
5. إنشاء lib/services/notification.service.dart

**الحالة**: ⏳ بانتظار الإصلاح

---

### خطأ 20: Screens مفقودة

**عنوان المشكلة**: Screens مفقودة في Mobile App

**سبب المشكلة**:
- Login Screen غير موجود
- Register Screen غير موجود
- Bookings List Screen غير موجود
- Booking Detail Screen غير موجود
- QR Scanner Screen غير موجود
- QR Result Screen غير موجود
- Notifications Screen غير موجود
- Profile Screen غير موجود

**تأثير المشكلة**:
- لا يوجد UI
- Mobile App غير قابل للاستخدام

**الإصلاح المقترح**:
1. إنشاء lib/features/auth/screens/login_screen.dart
2. إنشاء lib/features/auth/screens/register_screen.dart
3. إنشاء lib/features/bookings/screens/bookings_list_screen.dart
4. إنشاء lib/features/bookings/screens/booking_detail_screen.dart
5. إنشاء lib/features/qr/screens/qr_scanner_screen.dart
6. إنشاء lib/features/qr/screens/qr_result_screen.dart
7. إنشاء lib/features/notifications/screens/notifications_screen.dart
8. إنشاء lib/features/profile/screens/profile_screen.dart

**الحالة**: ⏳ بانتظار الإصلاح

---

### خطأ 21: Models مفقودة

**عنوان المشكلة**: Models مفقودة في Mobile App

**سبب المشكلة**:
- User Model غير موجود
- Booking Model غير موجود
- Vehicle Model غير موجود
- Invoice Model غير موجود

**تأثير المشكلة**:
- لا يمكن تمثيل البيانات
- لا يمكن استخدام TypeScript/Type Safety

**الإصلاح المقترح**:
1. إنشاء lib/models/user.dart
2. إنشاء lib/models/booking.dart
3. إنشاء lib/models/vehicle.dart
4. إنشاء lib/models/invoice.dart

**الحالة**: ⏳ بانتظار الإصلاح

---

## 7. أخطاء الإشعارات و WhatsApp

### خطأ 22: Notification Service غير موجود

**عنوان المشكلة**: Notification Service غير موجود في Backend

**سبب المشكلة**:
- Notification Service غير موجود
- Notification Queue غير مُطبق
- Retry Mechanism غير مُطبق

**تأثير المشكلة**:
- لا يمكن إرسال إشعارات
- الإشعارات الفاشلة لن تُعاد المحاولة

**الإصلاح المقترح**:
1. إنشاء Notification Service
2. إضافة Notification Queue
3. إضافة Retry Mechanism مع Exponential Backoff

**الحالة**: ⏳ بانتظار الإصلاح

---

### خطأ 23: WhatsApp Integration غير موجود

**عنوان المشكلة**: WhatsApp Integration غير موجود

**سبب المشكلة**:
- WhatsApp Service غير موجود
- WhatsApp Templates غير موجود
- WhatsApp Logs غير مُطبق

**تأثير المشكلة**:
- لا يمكن إرسال واتساب
- لا يوجد سجل للواتساب

**الإصلاح المقترح**:
1. إنشاء WhatsApp Service
2. إضافة WhatsApp Templates
3. إضافة WhatsApp Logs

**الحالة**: ⏳ بانتظار الإصلاح

---

## 8. أخطاء الصلاحيات والأمان

### خطأ 24: No Row-Level Security

**عنوان المشكلة**: لا يوجد Row-Level Security في قاعدة البيانات

**سبب المشكلة**:
- لا يوجد RLS Policies
- المستخدمون قد يرون بيانات لا يجب أن يروها

**تأثير المشكلة**:
- اختراق البيانات
- انتهاك الخصوصية

**الإصلاح المقترح**:
1. إضافة RLS Policies لكل جدول
2. إضافة Row-Level Security Guards في Backend

**الحالة**: ⏳ بانتظار الإصلاح

---

### خطأ 25: No Permission System

**عنوان المشكلة**: لا يوجد RBAC System

**سبب المشكلة**:
- Permissions Table غير موجود
- Role-Permissions mapping غير موجود
- Permission checking middleware غير موجود

**تأثير المشكلة**:
- لا يمكن التحكم في الصلاحيات بشكل دقيق
- المستخدمون قد يقومون بأعمال لا يحق لهم

**الإصلاح المقترح**:
1. إضافة Permissions Table
2. إضافة Role-Permissions mapping
3. إضافة Permission checking middleware

**الحالة**: ⏳ بانتظار الإصلاح

---

### خطأ 26: No Rate Limiting

**عنوان المشكلة**: لا يوجد Rate Limiting

**سبب المشكلة**:
- Rate Limiting Middleware غير موجود
- API قد يُهاجم بـ Brute Force

**تأثير المشكلة**:
- هجمات Brute Force
- استهلاك الموارد

**الإصلاح المقترح**:
1. إضافة Rate Limiting Middleware
2. إضافة Rate Limiting في قاعدة البيانات

**الحالة**: ⏳ بانتظار الإصلاح

---

## 9. أخطاء الفواتير والدفع

### خطأ 27: No Tax Calculation Logic

**عنوان المشكلة**: لا يوجد logic لحساب الضريبة

**سبب المشكلة**:
- Tax Calculation Service غير موجود
- الضريبة لا تُحسب تلقائياً

**تأثير المشكلة**:
- الفواتير قد تكون خاطئة
- مشاكل مالية

**الإصلاح المقترح**:
1. إنشاء Tax Calculation Service
2. إضافة Tax Logic لكل Invoice

**الحالة**: ⏳ بانتظار الإصلاح

---

### خطأ 28: No Discount Validation

**عنوان المشكلة**: لا يوجد validation لكود الخصم

**سبب المشكلة**:
- Discount Validation Logic غير موجود
- قد يستخدم المستخدم كود خصم غير صالح

**تأثير المشكلة**:
- فقدان الإيرادات
- استخدام غير صحيح للخصومات

**الإصلاح المقترح**:
1. إنشاء Discount Validation Logic
2. إضافة Discount Rules

**الحالة**: ⏳ بانتظار الإصلاح

---

## 10. أخطاء المخزون

### خطأ 29: Inventory Service غير موجود

**عنوان المشكلة**: Inventory Service غير موجود في Backend

**سبب المشكلة**:
- Inventory Service غير موجود
- Stock Management Logic غير موجود
- Low Stock Alerts غير مُطبق

**تأثير المشكلة**:
- لا يمكن إدارة المخزون
- لا يوجد تنبيهات نفاد المخزون

**الإصلاح المقترح**:
1. إنشاء Inventory Service
2. إضافة Stock Management Logic
3. إضافة Low Stock Alerts

**الحالة**: ⏳ بانتظار الإصلاح

---

## 11. أخطاء السيناريوهات

### خطأ 30: No Handover Mechanism

**عنوان المشكلة**: لا يوجد mechanism لتغيير الميكانيكي أثناء العمل

**سبب المشكلة**:
- MechanicHandover غير مُطبق بالكامل
- لا يمكن تغيير الميكانيكي في حالة الغياب المفاجئ

**تأثير المشكلة**:
- لا يمكن تغيير الميكانيكي
- العمل قد يتوقف

**الإصلاح المقترح**:
1. إضافة Handover Mechanism
2. إضافة Handover Approval Workflow

**الحالة**: ⏳ بانتظار الإصلاح

---

### خطأ 31: No Approval Deadline Enforcement

**عنوان المشكلة**: لا يوجد enforcement لانتهاء مهلة الموافقة

**سبب المشكلة**:
- ApprovalDeadline غير مُطبق
- قد تظل الموافقة معلقة للأبد

**تأثير المشكلة**:
- الموافقات قد تظل معلقة
- تأخر في العمل

**الإصلاح المقترح**:
1. إضافة Cron Job لرفض الموافقات المنتهية
2. إضافة Approval Deadline Enforcement

**الحالة**: ⏳ بانتظار الإصلاح

---

## ملخص

**إجمالي الأخطاء المكتشفة**: 31 خطأ

**الأخطاء الحرجة**: 5
- خطأ 1: تضارب قاعدة البيانات
- خطأ 2: Migration غير موجود
- خطأ 5: Modules الأساسية مفقودة
- خطأ 6: Guards و Middlewares مفقودة
- خطأ 7: Services مفقودة

**الأخطاء العالية الأهمية**: 13
- خطأ 8: Auth Screens مفقودة
- خطأ 9: Dashboard Screens مفقودة
- خطأ 10: Feature Screens مفقودة
- خطأ 11: UI Components مفقودة
- خطأ 12: Layout Components مفقودة
- خطأ 13: Services و Hooks مفقودة
- خطأ 14: Main Process مفقود
- خطأ 15: Renderer Process مفقود
- خطأ 16: Preload Script مفقود
- خطأ 18: Core Files مفقودة
- خطأ 19: Services مفقودة
- خطأ 20: Screens مفقودة
- خطأ 21: Models مفقودة

**الأخطاء المتوسطة الأهمية**: 10
- خطأ 22: Notification Service غير موجود
- خطأ 23: WhatsApp Integration غير موجود
- خطأ 24: No Row-Level Security
- خطأ 25: No Permission System
- خطأ 26: No Rate Limiting
- خطأ 27: No Tax Calculation Logic
- خطأ 28: No Discount Validation
- خطأ 29: Inventory Service غير موجود
- خطأ 30: No Handover Mechanism
- خطأ 31: No Approval Deadline Enforcement

**الأخطاء المنخفضة الأهمية**: 3
- خطأ 3: Missing Foreign Key Constraints
- خطأ 4: Missing Unique Constraints
- خطأ 17: Resources مفقودة

---

## الإجراءات المطلوبة

### المرحلة 1 - حرجة (3-5 أيام)
1. إصلاح خطأ 1: تضارب قاعدة البيانات
2. إصلاح خطأ 2: Migration غير موجود
3. إصلاح خطأ 3: Missing Foreign Key Constraints
4. إصلاح خطأ 4: Missing Unique Constraints

### المرحلة 2 - عالية (12-17 يوم)
5. إصلاح خطأ 5: Modules الأساسية مفقودة
6. إصلاح خطأ 6: Guards و Middlewares مفقودة
7. إصلاح خطأ 7: Services مفقودة
8. إصلاح خطأ 8: Auth Screens مفقودة
9. إصلاح خطأ 9: Dashboard Screens مفقودة
10. إصلاح خطأ 10: Feature Screens مفقودة
11. إصلاح خطأ 11: UI Components مفقودة
12. إصلاح خطأ 12: Layout Components مفقودة
13. إصلاح خطأ 13: Services و Hooks مفقودة

### المرحلة 3 - متوسطة (12-17 يوم)
14. إصلاح خطأ 14: Main Process مفقود
15. إصلاح خطأ 15: Renderer Process مفقود
16. إصلاح خطأ 16: Preload Script مفقود
17. إصلاح خطأ 17: Resources مفقودة
18. إصلاح خطأ 18: Core Files مفقودة
19. إصلاح خطأ 19: Services مفقودة
20. إصلاح خطأ 20: Screens مفقودة
21. إصلاح خطأ 21: Models مفقودة
22. إصلاح خطأ 22: Notification Service غير موجود
23. إصلاح خطأ 23: WhatsApp Integration غير موجود

### المرحلة 4 - منخفضة (8-10 يوم)
24. إصلاح خطأ 24: No Row-Level Security
25. إصلاح خطأ 25: No Permission System
26. إصلاح خطأ 26: No Rate Limiting
27. إصلاح خطأ 27: No Tax Calculation Logic
28. إصلاح خطأ 28: No Discount Validation
29. إصلاح خطأ 29: Inventory Service غير موجود
30. إصلاح خطأ 30: No Handover Mechanism
31. إصلاح خطأ 31: No Approval Deadline Enforcement

---

**المجموع الكلي**: 35-49 يوم عمل
