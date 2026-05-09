# 🚀 Garage Go - Complete Setup Guide

## 📋 المتطلبات الأساسية

### 🔧 Backend Requirements
- **Node.js** (v18.0.0 أو أحدث)
- **npm** (v8.0.0 أو أحدث)
- **PostgreSQL** (v14 أو أحدث)
- **Docker** (اختياري، للتطوير المحلي)
- **Git**

### 📱 Mobile App Requirements
- **Flutter SDK** (v3.16.0 أو أحدث)
- **Dart SDK** (مثبت مع Flutter)
- **Android Studio** أو **VS Code**
- **Android SDK** (API Level 33 أو أحدث)
- **Git**

---

## 🖥️ Backend Setup

### 1. تثبيت Node.js و npm
```bash
# تحميل وتثبيت Node.js من الموقع الرسمي
# Windows: https://nodejs.org/en/download/
# macOS: brew install node
# Linux: sudo apt install nodejs npm

# التحقق من التثبيت
node --version
npm --version
```

### 2. تثبيت PostgreSQL
```bash
# Windows: تحميل من https://www.postgresql.org/download/windows/
# macOS: brew install postgresql
# Linux: sudo apt install postgresql postgresql-contrib

# بدء الخدمة
# Windows: يبدأ تلقائياً بعد التثبيت
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql

# إنشاء قاعدة بيانات
sudo -u postgres createdb garage_go_db
```

### 3. تثبيت Docker (اختياري)
```bash
# Windows: https://docs.docker.com/desktop/install/windows-install/
# macOS: https://docs.docker.com/desktop/install/mac-install/
# Linux: https://docs.docker.com/engine/install/

# التحقق من التثبيت
docker --version
docker-compose --version
```

### 4. إعداد Backend Project
```bash
# الانتقال إلى مجلد المشروع
cd garage-go-backend

# تثبيت الاعتماديات
npm install

# نسخ متغيرات البيئة
cp .env.example .env

# تحرير ملف .env وإعداده
nano .env
```

### 5. إعداد قاعدة البيانات
```bash
# إنشاء migrations
npx prisma migrate dev --name init

# توليد Prisma Client
npx prisma generate

# ملء قاعدة البيانات بالبيانات الأولية
npm run seed
```

### 6. تشغيل Backend
```bash
# وضع التطوير
npm run dev

# وضع الإنتاج
npm start
```

---

## 📱 Mobile App Setup

### 1. تثبيت Flutter SDK
```bash
# تحميل Flutter SDK
# Windows: https://docs.flutter.dev/get-started/install/windows
# macOS: https://docs.flutter.dev/get-started/install/macos
# Linux: https://docs.flutter.dev/get-started/install/linux

# إضافة Flutter إلى PATH
# Windows: إضافة مسار flutter/bin إلى Environment Variables
# macOS/Linux: echo 'export PATH="$PATH:[flutter_path]/bin"' >> ~/.zshrc

# التحقق من التثبيت
flutter --version
dart --version
```

### 2. تثبيت Android Studio
```bash
# تحميل Android Studio
# https://developer.android.com/studio

# تثبيت Flutter و Dart plugins في Android Studio
# File > Settings > Plugins > Search "Flutter" > Install
```

### 3. إعداد Android SDK
```bash
# فتح Android Studio
# Tools > SDK Manager > Install SDK Platform 33 (Android 13.0)
# Tools > SDK Manager > SDK Tools > Install Android SDK Build-Tools 33.0.0
# Tools > SDK Manager > SDK Tools > Install Android SDK Command-line Tools
```

### 4. تثبيت VS Code (اختياري)
```bash
# تحميل VS Code
# https://code.visualstudio.com/

# تثبيت Extensions
# Flutter
# Dart
# Flutter Tree
# GitLens
```

### 5. تشغيل Doctor Check
```bash
# التحقق من جميع المتطلبات
flutter doctor -v

# يجب أن تكون جميع النتائج ✅
```

### 6. إعداد Mobile Project
```bash
# الانتقال إلى مجلد المشروع
cd garage-go-mobile

# تثبيت الاعتماديات
flutter pub get

# التحقق من الاعتماديات
flutter pub deps
```

### 7. تشغيل Mobile App
```bash
# التحقق من الأجهزة المتصلة
flutter devices

# تشغيل على جهاز Android
flutter run

# تشغيل على Chrome (Web)
flutter run -d chrome

# تشغيل على iOS (macOS فقط)
flutter run -d ios
```

---

## 🔧 إعدادات إضافية

### 1. إعداد Environment Variables
```bash
# Backend .env
DATABASE_URL="postgresql://username:password@localhost:5432/garage_go_db"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
PORT=3000
NODE_ENV="development"

# Mobile lib/core/constants/app_constants.dart
static const String baseUrl = 'http://localhost:3000/api/v1';
```

### 2. إعداد Git
```bash
# تهيئة Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# تهيئة المشروع
git init
git add .
git commit -m "Initial commit"
```

### 3. إعداد Android Emulator
```bash
# فتح Android Studio
# Tools > AVD Manager > Create Virtual Device
# اختيار Pixel 6 > API 33 > Finish

# تشغيل Emulator
flutter emulators
flutter emulators --launch <emulator_id>
```

---

## 🚀 تشغيل المشروع الكامل

### 1. تشغيل Backend
```bash
# Terminal 1
cd garage-go-backend
npm run dev
```

### 2. تشغيل Mobile App
```bash
# Terminal 2
cd garage-go-mobile
flutter run
```

### 3. التحقق من الاتصال
- Backend: http://localhost:3000
- Mobile App: يعمل على الجهاز/Emulator
- API Documentation: http://localhost:3000/api-docs

---

## 🛠️ حل المشاكل الشائعة

### Node.js/npm Issues
```bash
# تحديث npm
npm install -g npm@latest

# مسح cache
npm cache clean --force
```

### Flutter Issues
```bash
# تحديث Flutter
flutter upgrade

# مسح cache
flutter clean
flutter pub get

# إعادة تشغيل
flutter doctor
```

### Database Issues
```bash
# إعادة تعيين قاعدة البيانات
npx prisma migrate reset

# إعادة توليد Client
npx prisma generate
```

### Android Issues
```bash
# إعادة تعيين Android SDK
flutter doctor --android-licenses

# مسح gradle cache
cd android
./gradlew clean
cd ..
```

---

## 📱 Testing

### Backend Tests
```bash
# تشغيل الاختبارات
npm test

# تشغيل اختبارات التغطية
npm run test:coverage
```

### Mobile Tests
```bash
# تشغيل اختبارات الوحدة
flutter test

# تشغيل اختبارات الـ Widget
flutter test integration_test/
```

---

## 🚀 Deployment

### Backend Deployment
```bash
# بناء المشروع
npm run build

# تشغيل في وضع الإنتاج
npm start
```

### Mobile Deployment
```bash
# بناء APK للـ Android
flutter build apk --release

# بناء App Bundle للـ Google Play
flutter build appbundle --release

# بناء iOS (macOS فقط)
flutter build ios --release
```

---

## 📞 Support

### روابط مفيدة
- [Flutter Documentation](https://docs.flutter.dev/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)

### المشاكل الشائعة
1. **Flutter doctor يظهر أخطاء**: قم بتثبيت المكونات المفقودة
2. **Database connection failed**: تحقق من إعدادات PostgreSQL
3. **Android build failed**: تحقق من Android SDK و Gradle
4. **API requests failing**: تحقق من تشغيل Backend والـ firewall

---

## ✅ Checklist النهائي

- [ ] Node.js و npm مثبتان
- [ ] PostgreSQL يعمل
- [ ] Backend يعمل على port 3000
- [ ] Flutter SDK مثبت
- [ ] Android Studio مثبت
- [ ] Android SDK مثبت
- [ ] Mobile App تعمل
- [ ] الاتصال بين Mobile و Backend يعمل
- [ ] جميع الاختبارات تعمل

🎉 **مبروك! المشروع جاهز للتطوير!**
