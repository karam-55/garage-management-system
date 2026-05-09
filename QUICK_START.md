# 🚀 Garage Go - Quick Start Guide

## 📋 خلاصة سريعة للتثبيت

### 🔧 Backend (Node.js + PostgreSQL)
```bash
# 1. تثبيت Node.js
# Windows: https://nodejs.org/en/download/
# macOS: brew install node
# Linux: sudo apt install nodejs npm

# 2. تثبيت PostgreSQL
# Windows: https://www.postgresql.org/download/windows/
# macOS: brew install postgresql
# Linux: sudo apt install postgresql

# 3. إعداد Backend
cd garage-go-backend
npm install
cp .env.example .env
# تعديل ملف .env
npx prisma migrate dev
npm run dev
```

### 📱 Mobile App (Flutter)
```bash
# 1. تثبيت Flutter
# https://docs.flutter.dev/get-started/install/

# 2. إعداد Mobile App
cd garage-go-mobile
flutter pub get
flutter doctor
flutter run
```

---

## 🎯 التثبيت التلقائي (سكربتات جاهزة)

### Windows
```bash
# تشغيل كـ Administrator
setup_windows.bat
```

### macOS
```bash
chmod +x setup_macos.sh
./setup_macos.sh
```

### Linux
```bash
chmod +x setup_linux.sh
./setup_linux.sh
```

---

## 📱 المتطلبات الأساسية

### Backend
- ✅ Node.js v18+
- ✅ npm v8+
- ✅ PostgreSQL v14+
- ✅ Git

### Mobile App
- ✅ Flutter SDK v3.16+
- ✅ Dart SDK
- ✅ Android Studio
- ✅ Android SDK API 33+

---

## 🚀 تشغيل المشروع

### 1. تشغيل Backend
```bash
cd garage-go-backend
npm run dev
# يعمل على http://localhost:3000
```

### 2. تشغيل Mobile App
```bash
cd garage-go-mobile
flutter run
# يعمل على الجهاز/Emulator
```

---

## 🔧 التحقق من التثبيت

### Backend Check
```bash
node --version      # يجب يكون v18+
npm --version       # يجب يكون v8+
psql --version     # يجب يكون v14+
```

### Mobile App Check
```bash
flutter --version  # يجب يكون v3.16+
dart --version     # يجب يكون v3.0+
flutter doctor     # يجب يكون كل شيء ✅
```

---

## 🛠️ حل المشاكل السريعة

### Flutter Doctor Issues
```bash
flutter doctor --android-licenses
flutter clean
flutter pub get
```

### Database Issues
```bash
npx prisma migrate reset
npx prisma generate
```

### Node.js Issues
```bash
npm cache clean --force
npm install
```

---

## 📱 تشغيل على مختلف المنصات

### Android
```bash
flutter devices
flutter run -d <device_id>
```

### iOS (macOS فقط)
```bash
flutter run -d ios
```

### Web
```bash
flutter run -d chrome
```

---

## 🎯 الخطوات التالية

1. ✅ تشغيل السكربت المناسب لنظامك
2. ✅ إعادة تشغيل الجهاز
3. ✅ فتح Android Studio وتثبيت Flutter plugin
4. ✅ تشغيل `flutter doctor`
5. ✅ إعداد قاعدة البيانات في `backend/.env`
6. ✅ تشغيل Backend `npm run dev`
7. ✅ تشغيل Mobile App `flutter run`

🎉 **المشروع جاهز!**
