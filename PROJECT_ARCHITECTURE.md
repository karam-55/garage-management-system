# هيكلية المشروع الكاملة لنظام إدارة الكراج
# Garage Management System - Complete Project Architecture

**إعداد بواسطة**: Senior Full-Stack Engineer + DevOps + Architect
**الإصدار**: 1.0
**التاريخ**: 2024

---

## جدول المحتويات

1. [اختيار الهيكلية التقنية](#1-اختيار-الهيكلية-التقنية)
2. [هيكلية Monorepo](#2-هيكلية-monorepo)
3. [بنية المجلدات](#3-بنية-المجلدات)
4. [Backend (NestJS)](#4-backend-nestjs)
5. [Web Panel (Next.js)](#5-web-panel-nextjs)
6. [Desktop App (Electron)](#6-desktop-app-electron)
7. [Android App (Flutter)](#7-android-app-flutter)
8. [أوامر التشغيل والبناء](#8-أوامر-التشغيل-والبناء)
9. [دليل التشغيل الكامل](#9-دليل-التشغيل-الكامل)

---

## 1. اختيار الهيكلية التقنية

### 1.1 Backend: NestJS vs Express

**الاختيار: NestJS**

**التبرير:**

| المعيار | Express | NestJS | الفائز |
|--------|---------|--------|--------|
| Architecture | Unstructured | Modular (MVC) | NestJS |
| TypeScript Support | Manual | Built-in | NestJS |
| Dependency Injection | Manual | Built-in | NestJS |
| Testing | Manual | Built-in | NestJS |
| Scalability | Manual | Built-in | NestJS |
| Learning Curve | Low | Medium | Express |
| Documentation | Good | Excellent | NestJS |
| Community | Large | Large | Equal |
| Best for Large Projects | No | Yes | NestJS |

**لماذا NestJS لهذا النظام؟**
1. **Modular Architecture**: سهولة تنظيم الكود في modules
2. **TypeScript Support**: مدمج بالكامل
3. **Dependency Injection**: سهولة إدارة التبعيات
4. **Testing**: إطار اختبار مدمج
5. **Scalability**: مصمم للمشاريع الكبيرة
6. **Documentation**: توثيق ممتاز
7. **Guardian Pattern**: سهولة تنفيذ الصلاحيات

### 1.2 Web Panel: Next.js vs React

**الاختيار: Next.js 14+ (App Router)**

**التبرير:**

| المعيار | React | Next.js | الفائز |
|--------|-------|---------|--------|
| SSR | Manual | Built-in | Next.js |
| Routing | Manual | Built-in | Next.js |
| API Routes | Manual | Built-in | Next.js |
| SEO | Manual | Built-in | Next.js |
| Performance | Manual | Optimized | Next.js |
| Image Optimization | Manual | Built-in | Next.js |
| File-based Routing | No | Yes | Next.js |
| Best for Dashboards | Good | Excellent | Next.js |

**لماذا Next.js لهذا النظام؟**
1. **App Router**: نظام توجيه حديث وسهل
2. **Server Components**: أداء أفضل
3. **API Routes**: يمكن إنشاء API endpoints بجانب Frontend
4. **SEO**: مهم إذا أردنا صفحات عامة
5. **Performance**: تحسينات تلقائية
6. **File-based Routing**: سهولة التنظيم

### 1.3 Desktop App: Electron

**الاختيار: Electron**

**التبرير:**
- يمكن تغليف Web Panel الحالي
- يعمل على Windows, Mac, Linux
- يمكن الوصول لـ Native APIs
- مجتمع قوي
- أدوات بناء جاهزة (electron-builder)

### 1.4 Mobile App: Flutter vs React Native

**الاختيار: Flutter**

**التبرير:**

| المعيار | React Native | Flutter | الفائز |
|---------|-------------|---------|--------|
| Performance | Good | Excellent | Flutter |
| UI Consistency | Platform-specific | Consistent | Flutter |
| Hot Reload | Yes | Yes | Equal |
| Learning Curve | Medium | Medium | Equal |
| Documentation | Good | Excellent | Flutter |
| Widgets | Native | Custom | Flutter |
| Performance | Bridge | Native | Flutter |

**لماذا Flutter لهذا النظام؟**
1. **Native Performance**: أداء ممتاز
2. **Single Codebase**: Android + iOS
3. **Hot Reload**: تطوير سريع
4. **Rich Widgets**: واجهات جميلة
5. **Excellent Documentation**

### 1.5 Database: PostgreSQL

**الاختيار: PostgreSQL 15+**

**التبرير:**
- تم تحليله بالتفصيل في DATABASE_DESIGN_COMPLETE.md
- دعم ACID كامل
- أداء قوي
- دعم JSONB
- مناسب للمشاريع الكبيرة

### 1.6 ORM: Prisma

**الاختيار: Prisma**

**التبرير:**
- Type-safe
- Migration system ممتاز
- Client generation تلقائي
- IDE support ممتاز
- مناسب لـ PostgreSQL

### 1.7 API: REST vs GraphQL

**الاختيار: RESTful API**

**التبرير:**

| المعيار | REST | GraphQL | الفائز |
|--------|------|---------|--------|
| Simplicity | Simple | Complex | REST |
| Caching | Built-in | Manual | REST |
| Standard | W3C | Facebook | REST |
| Learning Curve | Low | High | REST |
| Over-fetching | Yes | No | GraphQL |
| Under-fetching | Yes | No | GraphQL |
| Best for CRUD | Excellent | Good | REST |

**لماذا REST لهذا النظام؟**
1. **Simplicity**: أسهل للفهم والتنفيذ
2. **Caching**: caching مدمج
3. **Standard**: معيار W3C
4. **CRUD**: ممتاز للعمليات CRUD
5. **Learning Curve**: أسهل للمطورين الجدد

### 1.8 Monorepo vs Multi-Repo

**الاختيار: Monorepo مع Turborepo**

**التبرير:**

| المعيار | Multi-Repo | Monorepo | الفائز |
|---------|------------|-----------|--------|
| Code Sharing | Difficult | Easy | Monorepo |
| Consistency | Manual | Enforced | Monorepo |
| CI/CD | Multiple | Single | Monorepo |
| Dependencies | Separate | Shared | Monorepo |
| Build Speed | Fast | Slower | Multi-Repo |
| Team Autonomy | High | Medium | Multi-Repo |
| Best for this System | No | Yes | Monorepo |

**لماذا Monorepo لهذا النظام؟**
1. **Code Sharing**: مشاركة types, utils, models
2. **Consistency**: نسخة واحدة من dependencies
3. **Single CI/CD**: pipeline واحد
4. **Shared Config**: TypeScript, ESLint, Prettier
5. **Easier Onboarding**: مشروع واحد فقط

---

## 2. هيكلية Monorepo

### 2.1 الأدوات المستخدمة

- **Turborepo**: إدارة Monorepo
- **pnpm**: Package manager (أسرع وأكثر كفاءة)
- **TypeScript**: Language
- **ESLint**: Linting
- **Prettier**: Formatting

### 2.2 بنية Monorepo

```
garage-management-system/
├── apps/
│   ├── backend/              # NestJS Backend
│   ├── web-panel/           # Next.js Web Panel
│   ├── desktop-app/         # Electron Desktop App
│   └── mobile-app/          # Flutter Mobile App
├── packages/
│   ├── shared-types/        # Shared TypeScript types
│   ├── shared-utils/        # Shared utilities
│   ├── shared-ui/           # Shared UI components
│   └── api-client/          # API client for consuming Backend
├── package.json             # Root package.json
├── pnpm-workspace.yaml      # pnpm workspace config
├── turbo.json              # Turborepo config
├── .gitignore
└── README.md
```

---

## 3. بنية المجلدات

### 3.1 Backend Structure

```
apps/backend/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── dto/
│   │   │   │   ├── login.dto.ts
│   │   │   │   └── register.dto.ts
│   │   │   └── guards/
│   │   │       ├── jwt-auth.guard.ts
│   │   │       └── roles.guard.ts
│   │   ├── users/
│   │   ├── customers/
│   │   ├── garages/
│   │   ├── vehicles/
│   │   ├── bookings/
│   │   ├── services/
│   │   ├── mechanics/
│   │   ├── invoices/
│   │   ├── payments/
│   │   ├── inventory/
│   │   ├── notifications/
│   │   └── audit/
│   ├── common/
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── interceptors/
│   │   ├── pipes/
│   │   └── guards/
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── whatsapp.config.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── main.ts
├── test/
├── package.json
├── tsconfig.json
├── nest-cli.json
└── .eslintrc.js
```

### 3.2 Web Panel Structure

```
apps/web-panel/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── receptionist/
│   │   │   ├── manager/
│   │   │   ├── owner/
│   │   │   └── cashier/
│   │   ├── bookings/
│   │   ├── vehicles/
│   │   ├── customers/
│   │   ├── invoices/
│   │   ├── inventory/
│   │   ├── mechanics/
│   │   └── settings/
│   ├── components/
│   │   ├── ui/
│   │   ├── layouts/
│   │   └── forms/
│   ├── lib/
│   │   ├── api-client.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   └── styles/
├── public/
├── package.json
├── tsconfig.json
├── next.config.js
└── tailwind.config.ts
```

### 3.3 Desktop App Structure

```
apps/desktop-app/
├── src/
│   ├── main/
│   │   └── index.ts
│   ├── renderer/
│   │   ├── pages/
│   │   ├── components/
│   │   └── lib/
│   ├── preload/
│   │   └── index.ts
│   └── shared/
├── resources/
├── package.json
├── electron-builder.yml
└── tsconfig.json
```

### 3.4 Mobile App Structure

```
apps/mobile-app/
├── lib/
│   ├── core/
│   │   ├── constants/
│   │   ├── theme/
│   │   └── utils/
│   ├── features/
│   │   ├── auth/
│   │   ├── bookings/
│   │   ├── qr/
│   │   ├── notifications/
│   │   └── profile/
│   ├── services/
│   │   ├── api.service.ts
│   │   ├── auth.service.ts
│   │   └── storage.service.ts
│   └── models/
├── android/
├── ios/
├── test/
├── pubspec.yaml
└── analysis_options.yaml
```

---

## 4. Backend (NestJS)

### 4.1 Dependencies

```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/swagger": "^7.0.0",
    "@prisma/client": "^5.0.0",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.0",
    "bcrypt": "^5.1.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.0",
    "uuid": "^9.0.0",
    "qrcode": "^1.5.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/express": "^4.17.17",
    "@types/node": "^20.0.0",
    "@types/passport-jwt": "^3.0.0",
    "@types/bcrypt": "^5.0.0",
    "@types/uuid": "^9.0.0",
    "prisma": "^5.0.0",
    "typescript": "^5.0.0"
  }
}
```

### 4.2 Main Entry Point

```typescript
// apps/backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  
  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Garage Management API')
    .setDescription('API documentation for Garage Management System')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(3000);
  console.log('🚀 Backend is running on http://localhost:3000');
}
bootstrap();
```

### 4.3 AppModule

```typescript
// apps/backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CustomersModule } from './modules/customers/customers.module';
import { GaragesModule } from './modules/garages/garages.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { ServicesModule } from './modules/services/services.module';
import { MechanicsModule } from './modules/mechanics/mechanics.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CustomersModule,
    GaragesModule,
    VehiclesModule,
    BookingsModule,
    ServicesModule,
    MechanicsModule,
    InvoicesModule,
    PaymentsModule,
    InventoryModule,
    NotificationsModule,
  ],
})
export class AppModule {}
```

---

## 5. Web Panel (Next.js)

### 5.1 Dependencies

```json
{
  "dependencies": {
    "next": "14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.6.0",
    "zustand": "^4.4.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "lucide-react": "^0.300.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-dropdown-menu": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.0",
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "14.0.0"
  }
}
```

### 5.2 API Client

```typescript
// apps/web-panel/src/lib/api-client.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 5.3 Auth Hook

```typescript
// apps/web-panel/src/lib/auth.ts
import { create } from 'zustand';
import api from './api-client';

interface AuthState {
  user: any;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { user, access_token } = response.data;
    
    localStorage.setItem('token', access_token);
    set({ user, token: access_token, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
```

---

## 6. Desktop App (Electron)

### 6.1 Dependencies

```json
{
  "dependencies": {
    "electron": "^28.0.0"
  },
  "devDependencies": {
    "electron-builder": "^24.6.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

### 6.2 Main Process

```typescript
// apps/desktop-app/src/main/index.ts
import { app, BrowserWindow } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/index.js'),
    },
  });

  // Load the web panel
  mainWindow.loadURL('http://localhost:3000');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

### 6.3 Electron Builder Config

```yaml
# apps/desktop-app/electron-builder.yml
appId: com.garage.management
productName: Garage Management
directories:
  output: dist
win:
  target:
    - nsis
    - portable
  icon: resources/icon.ico
nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
```

---

## 7. Android App (Flutter)

### 7.1 Dependencies

```yaml
# apps/mobile-app/pubspec.yaml
dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.2
  http: ^1.1.0
  provider: ^6.0.0
  get: ^4.6.5
  get_storage: ^2.1.1
  qr_code_scanner: ^1.0.1
  flutter_secure_storage: ^8.0.0
  flutter_local_notifications: ^16.0.0
  image_picker: ^1.0.4
  intl: ^0.18.0
  shared_preferences: ^2.2.0
```

### 7.2 API Service

```dart
// apps/mobile-app/lib/services/api.service.dart
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class ApiService {
  final String baseUrl = 'http://localhost:3000';
  String? _token;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');
  }

  Map<String, String> get headers => {
    'Content-Type': 'application/json',
    if (_token != null) 'Authorization': 'Bearer $_token',
  };

  Future<http.Response> get(String endpoint) async {
    return await http.get(Uri.parse('$baseUrl$endpoint'), headers: headers);
  }

  Future<http.Response> post(String endpoint, Map<String, dynamic> body) async {
    return await http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
      body: jsonEncode(body),
    );
  }
}
```

### 7.3 QR Scanner Screen

```dart
// apps/mobile-app/lib/features/qr/qr_scanner_screen.dart
import 'package:flutter/material.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';

class QRScannerScreen extends StatefulWidget {
  const QRScannerScreen({super.key});

  @override
  State<QRScannerScreen> createState() => _QRScannerScreenState();
}

class _QRScannerScreenState extends State<QRScannerScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('مسح QR')),
      body: QRView(
        key: GlobalKey(debugLabel: 'QR'),
        onQRViewCreated: _onQRViewCreated,
      ),
    );
  }

  void _onQRViewCreated(QRViewController controller) {
    controller.scannedDataStream.listen((scanData) {
      // Handle QR scan
      Navigator.pop(context, scanData.code);
    });
  }
}
```

---

## 8. أوامر التشغيل والبناء

### 8.1 متطلبات النظام

#### يجب تثبيت:
1. **Node.js** (v18+): https://nodejs.org/
2. **pnpm**: `npm install -g pnpm`
3. **PostgreSQL 15+**: https://www.postgresql.org/download/
4. **Flutter SDK**: https://flutter.dev/docs/get-started/install
5. **Git**: https://git-scm.com/

### 8.2 تثبيت المشروع

```bash
# استنساخ المشروع
git clone <repo-url>
cd garage-management-system

# تثبيت dependencies
pnpm install

# تثبيت dependencies لكل app
pnpm install --filter @garage/backend
pnpm install --filter @garage/web-panel
pnpm install --filter @garage/desktop-app
cd apps/mobile-app && flutter pub get
```

### 8.3 تشغيل Backend

```bash
# تشغيل migrations
cd apps/backend
npx prisma migrate dev

# تشغيل Prisma generate
npx prisma generate

# تشغيل Backend في وضع التطوير
pnpm dev --filter @garage/backend
# Backend يعمل على http://localhost:3000
# API Docs: http://localhost:3000/api
```

### 8.4 تشغيل Web Panel

```bash
# تشغيل Web Panel في وضع التطوير
pnpm dev --filter @garage/web-panel
# Web Panel يعمل على http://localhost:3001
```

### 8.5 تشغيل Desktop App (Development)

```bash
# تشغيل Desktop App في وضع التطوير
pnpm dev --filter @garage/desktop-app
# Desktop App يفتح تلقائياً
```

### 8.6 بناء EXE للويندوز

```bash
# بناء Desktop App
pnpm build --filter @garage/desktop-app
# ملف EXE يُنشأ في: apps/desktop-app/dist/
```

### 8.7 تشغيل Flutter App

```bash
# تشغيل على المحاكي
cd apps/mobile-app
flutter run

# تشغيل على جهاز Android
flutter devices
flutter run -d <device-id>
```

### 8.8 بناء APK للأندرويد

```bash
cd apps/mobile-app

# بناء APK Debug
flutter build apk --debug
# APK يُنشأ في: build/app/outputs/flutter-apk/app-debug.apk

# بناء APK Release
flutter build apk --release
# APK يُنشأ في: build/app/outputs/flutter-apk/app-release.apk
```

---

## 9. دليل التشغيل الكامل

### 9.1 الخطوات المرتبة

#### الخطوة 1: تثبيت البرامج المطلوبة

```bash
# 1. تثبيت Node.js v18+
# تحميل من: https://nodejs.org/

# 2. تثبيت pnpm
npm install -g pnpm

# 3. تثبيت PostgreSQL 15+
# تحميل من: https://www.postgresql.org/download/windows/

# 4. تثبيت Flutter SDK
# تحميل من: https://flutter.dev/docs/get-started/install/windows

# 5. تثبيت Git
# تحميل من: https://git-scm.com/download/win
```

#### الخطوة 2: إعداد قاعدة البيانات

```bash
# 1. فتح pgAdmin
# 2. إنشاء قاعدة بيانات جديدة: garage_db
# 3. إنشاء مستخدم جديد: garage_user
# 4. منح الصلاحيات للمستخدم على القاعدة
```

#### الخطوة 3: إعداد ملف .env

```bash
# إنشاء ملف .env في apps/backend/
# apps/backend/.env

DATABASE_URL="postgresql://garage_user:password@localhost:5432/garage_db"
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3000
```

#### الخطوة 4: تشغيل قاعدة البيانات

```bash
# التأكد من أن PostgreSQL يعمل
# افتح Services.msc وتأكد من أن PostgreSQL service يعمل

# أو عبر command line:
pg_ctl status
```

#### الخطوة 5: تشغيل Backend

```bash
# في التيرمينال:
cd garage-management-system
pnpm install
pnpm dev --filter @garage/backend

# Backend يعمل على http://localhost:3000
# API Docs: http://localhost:3000/api
```

#### الخطوة 6: تشغيل Web Panel

```bash
# في تيرمينال جديد:
cd garage-management-system
pnpm dev --filter @garage/web-panel

# Web Panel يعمل على http://localhost:3001
```

#### الخطوة 7: تشغيل Desktop App (Development)

```bash
# في تيرمينال جديد:
cd garage-management-system
pnpm dev --filter @garage/desktop-app

# Desktop App يفتح تلقائياً
```

#### الخطوة 8: تشغيل Flutter App على المحاكي

```bash
# في تيرمينال جديد:
cd apps/mobile-app
flutter devices
flutter run

# Flutter App يعمل على المحاكي
```

#### الخطوة 9: بناء EXE

```bash
cd garage-management-system
pnpm build --filter @garage/desktop-app

# ملف EXE يُنشأ في: apps/desktop-app/dist/
```

#### الخطوة 10: بناء APK

```bash
cd apps/mobile-app
flutter build apk --release

# APK يُنشأ في: build/app/outputs/flutter-apk/app-release.apk
```

### 9.2 تجربة سيناريو كامل

#### السيناريو: إدخال سيارة → تعيين ميكانيكي → تحديث الحالة → إرسال إشعار → إصدار فاتورة

**الخطوات:**

1. **فتح Web Panel**: http://localhost:3001
2. **تسجيل الدخول**: استخدم admin/admin123
3. **إدخال عميل جديد**:
   - اذهب إلى Customers
   - اضغط "Add Customer"
   - أدخل: محمد أحمد، 0501234567
   - اضغط Save

4. **إدخال سيارة جديدة**:
   - افتح ملف العميل
   - اضغط "Add Vehicle"
   - أدخل: Toyota Camry 2020, ABC1234
   - اضغط Save

5. **إنشاء حجز**:
   - اذهب إلى Bookings
   - اضغط "New Booking"
   - اختر العميل، السيارة، الخدمة، الموعد
   - اضغط Save
   - سيُطبع QR Code تلقائياً

6. **تعيين ميكانيكي**:
   - افتح الحجز
   - اضغط "Assign Mechanic"
   - اختر ميكانيكي متاح
   - اضغط Save

7. **تحديث الحالة**:
   - افتح Flutter App
   - سجل الدخول كـ Mechanic
   - اذهب إلى My Bookings
   - اضغط "Start Work"
   - أدخل وصف العمل
   - اضغط Save

8. **إرسال إشعار**:
   - النظام يُرسل إشعار واتساب تلقائياً
   - يمكنك التحقق من الإشعار في Notifications Queue

9. **إصدار فاتورة**:
   - اذهب إلى Invoices
   - اضغط "Create from Booking"
   - اختر الحجز
   - اضغط Create
   - الفاتورة تُنشأ تلقائياً

10. **دفع**:
    - افتح الفاتورة
    - اضغط "Add Payment"
    - أدخل المبلغ وطريقة الدفع
    - اضغط Save

### 9.3 روابط الوصول

- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api
- **Web Panel**: http://localhost:3001
- **Desktop App**: يفتح تلقائياً عند التشغيل
- **Flutter App**: يعمل على المحاكي أو الجهاز

---

## الخلاصة

هذه الهيكلية توفر:
- ✅ Backend قوي ومقاس (NestJS)
- ✅ Web Panel حديث وسريع (Next.js)
- ✅ Desktop App للويندوز (Electron)
- ✅ Mobile App للأندرويد (Flutter)
- ✅ Monorepo سهل الإدارة (Turborepo)
- ✅ Database احترافي (PostgreSQL)
- ✅ ORM type-safe (Prisma)
- ✅ API RESTful بسيط وفعال
- ✅ أوامر تشغيل وبناء واضحة
- ✅ دليل تشغيل كامل

النظام جاهز للبناء والتشغيل على جهازك (ويندوز) وتجربته بنفسك قبل تقديمه للعميل.
