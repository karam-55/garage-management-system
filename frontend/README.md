# Garage Management System - Flutter App

تطبيق نظام إدارة ورشة السيارات - مُبني بـ Flutter مع Riverpod و Dio.

## التقنيات المستخدمة

- **Framework**: Flutter
- **State Management**: Riverpod
- **HTTP Client**: Dio
- **QR Code**: qr_flutter
- **Language**: Dart

## هيكل المشروع

```
frontend/
├── lib/
│   ├── main.dart              # Application entry point
│   ├── core/
│   │   └── app.dart           # App widget
│   ├── models/
│   │   ├── customer.dart      # Customer model
│   │   └── vehicle.dart       # Vehicle model
│   ├── services/
│   │   ├── api_service.dart   # Base API service
│   │   ├── customer_service.dart
│   │   └── vehicle_service.dart
│   ├── state/
│   │   ├── customer_provider.dart
│   │   └── vehicle_provider.dart
│   ├── screens/
│   │   ├── dashboard/
│   │   │   └── dashboard_screen.dart
│   │   ├── customers/
│   │   │   └── customers_screen.dart
│   │   └── vehicles/
│   │       └── vehicles_screen.dart
│   ├── widgets/
│   └── utils/
│       └── api_config.dart    # API configuration
├── pubspec.yaml
└── README.md
```

## إعداد البيئة

### المتطلبات الأساسية

- Flutter SDK (3.0 أو أحدث)
- Dart SDK (3.0 أو أحدث)
- Backend API قيد التشغيل

### خطوات التثبيت

1. استنساخ المشروع:
```bash
cd frontend
```

2. تثبيت التبعيات:
```bash
flutter pub get
```

3. إعداد رابط API:
عدّل ملف `lib/utils/api_config.dart` أو استخدم متغير البيئة:
```bash
flutter run --dart-define=API_BASE_URL=http://localhost:3000
```

## تشغيل المشروع

### وضع التطوير (Windows)
```bash
flutter run -d windows
```

### وضع Web
```bash
flutter run -d chrome
```

### وضع الإنتاج
```bash
flutter build windows
flutter build web
```

## المميزات المنفذة

### ✅ Dashboard
- واجهة رئيسية مع قائمة بالأقسام
- سهولة التنقل بين الشاشات

### ✅ إدارة العملاء
- عرض قائمة العملاء
- إضافة عميل جديد
- تعديل بيانات العميل
- حذف العميل

### ✅ إدارة السيارات
- عرض قائمة السيارات
- إضافة سيارة جديدة
- تعديل بيانات السيارة
- حذف السيارة
- توليد QR Code لكل سيارة

## المميزات المخططة

- ⏳ إدارة الفنيين
- ⏳ إدارة الحجوزات
- ⏳ إدارة الفواتير
- ⏳ إدارة المخزون
- ⏳ الإشعارات
- ⏳ صفحة تتبع السيارة (بدون تسجيل دخول)

## State Management

يستخدم المشروع Riverpod لإدارة الحالة:
- `CustomerProvider` لإدارة بيانات العملاء
- `VehicleProvider` لإدارة بيانات السيارات

## API Service

يستخدم المشروع Dio للاتصال بالـ Backend API:
- `ApiService` - الخدمة الأساسية للاتصال
- `CustomerService` - خدمة إدارة العملاء
- `VehicleService` - خدمة إدارة السيارات

## QR Code

يتم توليد QR Code لكل سيارة باستخدام حزمة `qr_flutter`. يمكن استخدام الـ QR Code لتتبع السيارة.

## Environment Variables

يمكن تعيين رابط API باستخدام متغير البيئة `API_BASE_URL`:
```bash
flutter run --dart-define=API_BASE_URL=http://your-api-url.com
```

## الترخيص

ISC
