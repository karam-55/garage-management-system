# تصميم قاعدة البيانات الكامل لنظام إدارة الكراج
# Garage Management System - Complete Database Design

## 1. اختيار قاعدة البيانات

### الاختيار: PostgreSQL 15+

### التبرير التقني

#### لماذا PostgreSQL؟

**1. دعم ACID كامل**
- ضمان سلامة المعاملات (Atomicity, Consistency, Isolation, Durability)
- ضروري للفواتير والمدفوعات والعمليات المالية
- يدعم MVCC (Multi-Version Concurrency Control) لتزامن عالي

**2. دعم علاقات معقدة**
- Foreign Keys مع Referential Integrity
- Cascading Rules (CASCADE, SET NULL, RESTRICT)
- Unique Constraints و Check Constraints
- دعم علاقات Many-to-Many عبر Junction Tables

**3. أداء قوي وقابل للتوسع**
- Query Optimization متقدم
- Parallel Query Execution
- Partitioning (Range, List, Hash)
- Indexing متقدم (B-Tree, GIN, GiST, BRIN)

**4. دعم أنواع بيانات متقدمة**
- JSONB للبيانات المرنة (تفضيلات الإشعارات، بيانات إضافية)
- Arrays لتخزين القوائم (تخصصات الميكانيكيين)
- HSTORE للبيانات key-value
- UUID للمعرفات الفريدة
- Full-Text Search للبحث النصي

**5. دعم الميزات المتقدمة المطلوبة**
- **Audit Trail**: باستخدام Triggers و Temporal Tables
- **Soft Delete**: باستخدام deleted_at timestamp
- **Versioning**: باستخدام JSONB history أو separate tables
- **Notification Queue**: يمكن استخدام LISTEN/NOTIFY أو pg_notify
- **Retry Mechanism**: يمكن استخدام transactions مع savepoints

**6. دعم الفواتير والماليات**
- Precision Data Types (DECIMAL, NUMERIC) للعملات
- Window Functions للإحصائيات والتقارير
- Common Table Expressions (CTEs) للاستعلامات المعقدة
- Materialized Views للتقارير المتكررة

**7. دعم المخزون**
- Row-Level Security (RLS) للتحكم في الصلاحيات
- Constraints للتحقق من صحة البيانات (stock levels, dates)
- Triggers للتنبيهات التلقائية (stock low, expiry dates)

**8. دعم السجلات (Audit Logs)**
- Built-in Logging (WAL - Write-Ahead Logging)
- Trigger-based Audit Trail
- Temporal Tables لتتبع التغييرات

**9. دعم الصلاحيات والأمان**
- GRANT/REVOKE permissions
- Row-Level Security (RLS)
- Encryption at rest (pgcrypto extension)
- Authentication methods متنوعة

**10. دعم التزامن العالي**
- Connection Pooling (PgBouncer)
- Read Replicas
- Streaming Replication
- Logical Replication

#### مقارنة مع الخيارات الأخرى

| الميزة | PostgreSQL | SQL Server | MySQL | MongoDB |
|--------|-----------|------------|-------|---------|
| ACID | ✅ كامل | ✅ كامل | ✅ كامل | ⚠️ محدود |
| JSON Support | ✅ JSONB | ❌ | ✅ JSON | ✅ Native |
| Arrays | ✅ Native | ❌ | ❌ | ✅ Native |
| Full-Text Search | ✅ ممتاز | ✅ جيد | ⚠️ محدود | ⚠️ محدود |
| Partitioning | ✅ متقدم | ✅ متقدم | ✅ جيد | ❌ |
| Replication | ✅ متقدم | ✅ متقدم | ✅ جيد | ✅ |
| Open Source | ✅ | ❌ | ✅ | ✅ |
| Cost | مجاني | مكلف | مجاني | مجاني |
| Community | كبير | كبير | كبير | كبير |

**الخلاصة**: PostgreSQL هو الخيار الأفضل لأنه يجمع بين:
- ميزات قوية ومتقدمة
- أداء عالي وقابل للتوسع
- مجاني ومفتوح المصدر
- مجتمع قوي ودعم ممتاز
- مناسب لجميع متطلبات النظام

---

## 2. ERD كامل للنظام

### الكيانات الرئيسية (Entities)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            ERD - نظام إدارة الكراج                          │
└─────────────────────────────────────────────────────────────────────────────┘

Users (المستخدمون)
├── id (PK)
├── email (Unique)
├── password_hash
├── full_name
├── phone
├── role_id (FK → Roles)
├── garage_id (FK → Garages, nullable for ADMIN)
├── is_active
├── phone_verified
├── availability_status
├── failed_login_attempts
├── locked_until
├── created_at
├── updated_at
└── deleted_at (Soft Delete)

Roles (الأدوار)
├── id (PK)
├── name (Unique)
├── description
└── permissions (JSONB)

Permissions (الصلاحيات)
├── id (PK)
├── name (Unique)
├── resource
├── action
└── role_permissions (Junction Table)

Garages (الكراجات)
├── id (PK)
├── owner_id (FK → Users)
├── name
├── address
├── phone
├── email
├── latitude
├── longitude
├── working_hours (JSONB)
├── is_active
├── created_at
├── updated_at
└── deleted_at

Customers (العملاء)
├── id (PK)
├── user_id (FK → Users, One-to-One)
├── full_name
├── phone
├── email
├── address
├── city
├── preferred_language
├── loyalty_points
└── created_at

Vehicles (المركبات)
├── id (PK)
├── customer_id (FK → Customers)
├── plate (Unique per customer)
├── make
├── model
├── year
├── vin
├── color
├── mileage
├── fuel_type
├── transmission
└── created_at

Vehicle Status History (تاريخ حالة المركبة)
├── id (PK)
├── vehicle_id (FK → Vehicles)
├── status
├── changed_by (FK → Users)
├── changed_at
└── notes

Services (الخدمات)
├── id (PK)
├── garage_id (FK → Garages)
├── category_id (FK → Service Categories)
├── name
├── description
├── price
├── duration_minutes
├── is_active
├── created_at
└── updated_at

Service Items (بنود الخدمة)
├── id (PK)
├── service_id (FK → Services)
├── name
├── description
├── quantity_required
└── unit

Service Categories (فئات الخدمات)
├── id (PK)
├── name
├── description
└── parent_id (FK → Self, for hierarchy)

Bookings (الحجوزات)
├── id (PK)
├── customer_id (FK → Customers)
├── garage_id (FK → Garages)
├── vehicle_id (FK → Vehicles)
├── service_id (FK → Services)
├── assigned_mechanic_id (FK → Users, nullable)
├── scheduled_at
├── estimated_duration_minutes
├── actual_duration_minutes
├── status
├── qr_token (Unique)
├── qr_expires_at
├── estimated_completion_at
├── actual_completion_at
├── delay_reason
├── expected_parts_arrival_at
├── notes
├── created_at
├── updated_at
└── deleted_at

Booking Status History (تاريخ حالة الحجز)
├── id (PK)
├── booking_id (FK → Bookings)
├── status
├── changed_by (FK → Users)
├── changed_at
└── notes

Mechanics (الميكانيكيون - عبر Users table)
├── specialization (Many-to-Many with Services)
├── skill_level
└── availability_status

Mechanic Specializations (تخصصات الميكانيكيين)
├── id (PK)
├── mechanic_id (FK → Users)
├── service_id (FK → Services)
├── skill_level (BEGINNER, INTERMEDIATE, EXPERT)
├── certified_at
└── created_at

Mechanic Work Sessions (جلسات العمل)
├── id (PK)
├── mechanic_id (FK → Users)
├── booking_id (FK → Bookings)
├── start_time
├── end_time (nullable)
├── duration_minutes
├── description
├── created_at
└── updated_at

Mechanic Ratings (تقييمات الميكانيكيين)
├── id (PK)
├── mechanic_id (FK → Users)
├── customer_id (FK → Customers)
├── rating (1-5)
├── comment
├── rated_at
└── created_at

Mechanic Handovers (تسليم المهام)
├── id (PK)
├── from_mechanic_id (FK → Users)
├── to_mechanic_id (FK → Users)
├── booking_id (FK → Bookings)
├── handover_time
├── notes
└── created_at

Parts Inventory (مخزون القطع)
├── id (PK)
├── garage_id (FK → Garages)
├── part_number (Unique)
├── name
├── description
├── category
├── quantity
├── min_stock_level
├── max_stock_level
├── unit_price
├── supplier
├── location
├── image_url
├── is_active
├── created_at
└── updated_at

Parts Requests (طلبات القطع)
├── id (PK)
├── booking_id (FK → Bookings)
├── part_id (FK → Parts Inventory)
├── requested_by (FK → Users)
├── quantity
├── status (PENDING, APPROVED, REJECTED, ORDERED, RECEIVED)
├── approved_by (FK → Users, nullable)
├── approved_at (nullable)
├── ordered_at (nullable)
├── received_at (nullable)
├── notes
└── created_at

Stock Movement History (تاريخ حركة المخزون)
├── id (PK)
├── part_id (FK → Parts Inventory)
├── movement_type (IN, OUT, ADJUSTMENT, TRANSFER)
├── quantity
├── reference_type (BOOKING, REQUEST, MANUAL)
├── reference_id
├── performed_by (FK → Users)
├── notes
└── created_at

Additional Services (الخدمات الإضافية)
├── id (PK)
├── booking_id (FK → Bookings)
├── service_name
├── description
├── price
├── status (PENDING, APPROVED, REJECTED, EXPIRED)
├── approval_deadline
├── approved (boolean)
├── approved_by (FK → Users, nullable)
├── approved_at (nullable)
├── decision_reason
├── decision_made_at
├── images (JSONB array)
├── video_url
├── selected_option_id (FK → Service Options, nullable)
└── created_at

Service Options (خيارات الخدمة)
├── id (PK)
├── additional_service_id (FK → Additional Services)
├── name
├── description
├── price
├── is_recommended
├── stock_available
├── image_url
└── created_at

Customer Approvals (موافقات العملاء)
├── id (PK)
├── booking_id (FK → Bookings)
├── approval_type (SERVICE_ADDITION, PRICE_CHANGE, DELAY)
├── status (PENDING, APPROVED, REJECTED, EXPIRED)
├── details (JSONB)
├── expires_at
├── responded_at
├── response_notes
└── created_at

Notifications Queue (طابور الإشعارات)
├── id (PK)
├── recipient_id (FK → Users)
├── type
├── title
├── message
├── data (JSONB)
├── channel (WHATSAPP, SMS, EMAIL, IN_APP)
├── priority (LOW, MEDIUM, HIGH, URGENT)
├── status (PENDING, SENT, FAILED, RETRYING)
├── scheduled_at
├── sent_at
├── failed_at
├── retry_count
├── max_retries
├── next_retry_at
└── created_at

WhatsApp Logs (سجلات WhatsApp)
├── id (PK)
├── notification_id (FK → Notifications Queue)
├── phone_number
├── message
├── status (QUEUED, SENT, DELIVERED, READ, FAILED)
├── message_id (from WhatsApp API)
├── sent_at
├── delivered_at
├── read_at
├── error_message
└── created_at

In-App Notifications (إشعارات داخل التطبيق)
├── id (PK)
├── user_id (FK → Users)
├── title
├── message
├── type
├── data (JSONB)
├── is_read
├── read_at
└── created_at

Notification Templates (قوالب الإشعارات)
├── id (PK)
├── type
├── language
├── subject
├── template
├── variables (JSONB array)
├── is_active
└── created_at

Notification Preferences (تفضيلات الإشعارات)
├── id (PK)
├── user_id (FK → Users, Unique)
├── email_enabled
├── sms_enabled
├── whatsapp_enabled
├── in_app_enabled
├── preferred_time
├── notification_types (JSONB array)
└── created_at

Invoices (الفواتير)
├── id (PK)
├── invoice_number (Unique)
├── booking_id (FK → Bookings, nullable)
├── customer_id (FK → Customers)
├── garage_id (FK → Garages)
├── subtotal
├── tax_amount
├── discount_amount
├── total_amount
├── currency
├── status (DRAFT, SENT, PAID, OVERDUE, CANCELLED)
├── issued_date
├── due_date
├── paid_date
├── tax_calculation_method
├── discount_id (FK → Discounts, nullable)
├── last_notification_sent_at
├── created_at
└── updated_at

Invoice Items (بنود الفاتورة)
├── id (PK)
├── invoice_id (FK → Invoices)
├── description
├── quantity
├── unit_price
├── discount
├── tax_rate
├── tax_amount
├── total
├── tax_rate_id (FK → Tax Rates, nullable)
└── created_at

Payments (المدفوعات)
├── id (PK)
├── invoice_id (FK → Invoices)
├── customer_id (FK → Customers)
├── amount
├── payment_method (CASH, CARD, BANK_TRANSFER, APPLE_PAY, MADA)
├── payment_date
├── transaction_id (Unique)
├── status (PENDING, COMPLETED, FAILED, REFUNDED)
├── processed_by (FK → Users)
├── notes
├── created_at
└── updated_at

Payment History (تاريخ المدفوعات)
├── id (PK)
├── payment_id (FK → Payments)
├── status
├── changed_at
├── changed_by (FK → Users)
└── notes

Discounts (الخصومات)
├── id (PK)
├── code (Unique)
├── type (PERCENTAGE, FIXED)
├── value
├── start_date
├── end_date
├── max_uses
├── used_count
├── is_active
└── created_at

Tax Rates (أسعار الضرائب)
├── id (PK)
├── garage_id (FK → Garages, nullable)
├── name
├── rate
├── type (VAT, SALES, SERVICE)
├── region
├── effective_from
├── effective_to
└── is_active

Cancellation Policies (سياسات الإلغاء)
├── id (PK)
├── garage_id (FK → Garages)
├── hours_before_cancel
├── refund_percentage
└── is_active

Cancellations (عمليات الإلغاء)
├── id (PK)
├── booking_id (FK → Bookings)
├── cancelled_at
├── cancelled_by (FK → Users)
├── refund_amount
├── refund_status (PENDING, PROCESSED, FAILED)
├── refund_processed_at
└── notes

QR Sessions (جلسات QR)
├── id (PK)
├── booking_id (FK → Bookings)
├── qr_token (Unique)
├── scanned_at
├── ip_address
├── user_agent
├── location (JSONB)
└── created_at

Audit Trail (سجل التدقيق)
├── id (PK)
├── user_id (FK → Users, nullable)
├── table_name
├── record_id
├── action (INSERT, UPDATE, DELETE)
├── old_values (JSONB)
├── new_values (JSONB)
├── changed_at
├── ip_address
├── user_agent
└── created_at

System Settings (إعدادات النظام)
├── id (PK)
├── key (Unique)
├── value (JSONB)
├── description
├── is_public (can be accessed without admin)
└── updated_at

Payment Limits (حدود الدفع)
├── id (PK)
├── user_id (FK → Users, Unique)
├── daily_limit
├── monthly_limit
├── per_transaction_limit
├── daily_spent
├── monthly_spent
├── reset_date
└── created_at

Token Blacklist (القائمة السوداء للرموز)
├── id (PK)
├── token (Unique)
├── user_id (FK → Users)
├── revoked_at
├── expires_at
└── created_at

Rate Limiting (حدود الطلبات)
├── id (PK)
├── user_id (FK → Users)
├── endpoint
├── request_count
├── window_start
└── window_end

Maintenance Records (سجلات الصيانة)
├── id (PK)
├── vehicle_id (FK → Vehicles)
├── booking_id (FK → Bookings, nullable)
├── mechanic_id (FK → Users)
├── service_performed
├── notes
├── odometer_reading
├── next_service_date
└── created_at
```

### العلاقات الرئيسية

```
Users (1) ────── (N) Roles
Users (1) ────── (N) Garages (as owner/mechanic)
Users (1) ────── (N) Bookings (as customer)
Users (1) ────── (N) Bookings (as mechanic)
Users (1) ────── (N) Mechanic Specializations
Users (1) ────── (N) Mechanic Work Sessions
Users (1) ────── (N) Mechanic Ratings (as mechanic)
Users (1) ────── (N) Mechanic Handovers (from/to)
Users (1) ────── (N) Notifications Queue
Users (1) ────── (N) In-App Notifications
Users (1) ────── (N) Audit Trail
Users (1) ────── (N) Token Blacklist
Users (1) ────── (N) Rate Limiting
Users (1) ────── (N) Payment Limits

Garages (1) ────── (N) Services
Garages (1) ────── (N) Parts Inventory
Garages (1) ────── (N) Bookings
Garages (1) ────── (N) Cancellation Policies
Garages (1) ────── (N) Tax Rates

Customers (1) ────── (N) Vehicles
Customers (1) ────── (N) Bookings
Customers (1) ────── (N) Invoices
Customers (1) ────── (N) Payments
Customers (1) ────── (N) Mechanic Ratings (as rater)

Vehicles (1) ────── (N) Bookings
Vehicles (1) ────── (N) Vehicle Status History
Vehicles (1) ────── (N) Maintenance Records

Services (1) ────── (N) Bookings
Services (1) ────── (N) Service Items
Services (N) ────── (N) Mechanic Specializations (Many-to-Many)

Bookings (1) ────── (N) Booking Status History
Bookings (1) ────── (N) Additional Services
Bookings (1) ────── (N) Mechanic Work Sessions
Bookings (1) ────── (N) Parts Requests
Bookings (1) ────── (N) Customer Approvals
Bookings (1) ────── (N) QR Sessions
Bookings (1) ────── (N) Invoices
Bookings (1) ────── (N) Maintenance Records
Bookings (1) ────── (N) Cancellations

Additional Services (1) ────── (N) Service Options

Invoices (1) ────── (N) Invoice Items
Invoices (1) ────── (N) Payments
Invoices (N) ────── (1) Discounts (optional)

Parts Inventory (1) ────── (N) Parts Requests
Parts Inventory (1) ────── (N) Stock Movement History

Notifications Queue (1) ────── (N) WhatsApp Logs
```

---

## 3. مخطط SQL الكامل

تم إنشاء مخطط SQL كامل في ملف منفصل: `DATABASE_SCHEMA_SQL.sql`

يحتوي الملف على:
- جميع الجداول مع الحقول والقيود
- جميع الفهارس (Indexes)
- جميع العلاقات (Foreign Keys)
- جميع الـ Triggers
- جميع الـ Views
- جميع الـ Stored Procedures
- جميع الـ Enum Types

---

## 4. تحسين الأداء (Performance Optimization)

### 4.1 استراتيجيات الفهرسة (Indexing Strategies)

#### الفهارس الأساسية (Primary Indexes)
```sql
-- جميع الجداول تحتوي على Primary Keys من نوع UUID
-- UUIDs أفضل من Auto-increment IDs للأنظمة الموزعة
```

#### الفهارس الثانوية (Secondary Indexes)

**الفهارس على الحقول الخارجية (Foreign Key Indexes)**
```sql
-- تحسين JOIN operations
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_garage_id ON bookings(garage_id);
CREATE INDEX idx_bookings_vehicle_id ON bookings(vehicle_id);
```

**الفهارس المركبة (Composite Indexes)**
```sql
-- للبحث المركب المتكر
CREATE INDEX idx_bookings_search ON bookings(garage_id, status, scheduled_at);
CREATE INDEX idx_audit_trail_search ON audit_trail(table_name, record_id, changed_at DESC);
```

**الفهارس الجزئية (Partial Indexes)**
```sql
-- فقط للسجلات النشطة (Soft Delete)
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_deleted_at ON bookings(deleted_at) WHERE deleted_at IS NULL;

-- للإشعارات المعلقة
CREATE INDEX idx_notifications_queue_pending ON notifications_queue(status) 
WHERE status = 'PENDING';

-- لإعادة المحاولة
CREATE INDEX idx_notifications_queue_retry ON notifications_queue(next_retry_at) 
WHERE next_retry_at IS NOT NULL;
```

**الفهارس الوظيفية (Functional Indexes)**
```sql
-- للبحث النصي بدون accents
CREATE INDEX idx_users_name_search ON users USING GIN(to_tsvector('arabic', full_name));

-- للبحث في JSONB
CREATE INDEX idx_users_preferences ON users USING GIN(preferences);
CREATE INDEX idx_bookings_data ON bookings USING GIN(data);
```

### 4.2 تحسين الاستعلامات (Query Optimization)

#### استخدام EXPLAIN ANALYZE
```sql
-- تحليل أداء الاستعلامات
EXPLAIN ANALYZE SELECT * FROM bookings WHERE garage_id = 'xxx' AND status = 'IN_PROGRESS';
```

#### تجنب N+1 Problem
```sql
-- ❌ Bad: N+1 queries
SELECT * FROM bookings WHERE garage_id = 'xxx';
-- ثم لكل booking:
SELECT * FROM vehicles WHERE id = booking.vehicle_id;

-- ✅ Good: Single query with JOIN
SELECT b.*, v.* 
FROM bookings b
JOIN vehicles v ON b.vehicle_id = v.id
WHERE b.garage_id = 'xxx';
```

#### استخدام CTEs (Common Table Expressions)
```sql
-- للاستعلامات المعقدة
WITH booking_summary AS (
    SELECT 
        garage_id,
        COUNT(*) as total_bookings,
        COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed_bookings
    FROM bookings
    GROUP BY garage_id
)
SELECT * FROM booking_summary WHERE completed_bookings > 100;
```

#### استخدام Window Functions
```sql
-- للإحصائيات المتقدمة
SELECT 
    id,
    customer_id,
    amount,
    SUM(amount) OVER (PARTITION BY customer_id ORDER BY created_at) as running_total,
    AVG(amount) OVER (PARTITION BY customer_id) as avg_amount
FROM payments;
```

### 4.3 Partitioning (التقسيم)

#### Partitioning حسب التاريخ (Date-based Partitioning)
```sql
-- تقسيم الحجوزات حسب الشهر
CREATE TABLE bookings (
    -- نفس الحقول
) PARTITION BY RANGE (scheduled_at);

-- إنشاء الأقسام
CREATE TABLE bookings_2024_01 PARTITION OF bookings
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE bookings_2024_02 PARTITION OF bookings
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- إضافة قسم جديد تلقائياً
CREATE TABLE bookings_default PARTITION OF bookings DEFAULT;
```

#### Partitioning حسب الكراج (Garage-based Partitioning)
```sql
-- تقسيم الفواتير حسب الكراج
CREATE TABLE invoices (
    -- نفس الحقول
) PARTITION BY LIST (garage_id);

-- إنشاء الأقسام لكل كراج رئيسي
CREATE TABLE invoices_garage_1 PARTITION OF invoices
    FOR VALUES IN ('garage-1-uuid');

CREATE TABLE invoices_garage_2 PARTITION OF invoices
    FOR VALUES IN ('garage-2-uuid');
```

### 4.4 Materialized Views (المشاهدات المادية)

#### للتقارير المتكررة
```sql
-- إنشاء مشهد مادي للإيرادات اليومية
CREATE MATERIALIZED VIEW daily_revenue AS
SELECT 
    DATE(payment_date) as date,
    garage_id,
    SUM(amount) as total_revenue,
    COUNT(*) as payment_count
FROM payments
WHERE status = 'COMPLETED'
GROUP BY DATE(payment_date), garage_id;

-- تحديث المشهد المادي
REFRESH MATERIALIZED VIEW daily_revenue;

-- تحديث تلقائي كل ساعة
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('refresh-daily-revenue', '0 * * * *', 
    'REFRESH MATERIALIZED VIEW daily_revenue');
```

### 4.5 Connection Pooling (تجمع الاتصالات)

#### استخدام PgBouncer
```ini
# pgbouncer.ini
[databases]
garage_db = host=localhost port=5432 dbname=garage_db

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
reserve_pool_size = 5
reserve_pool_timeout = 3
```

### 4.6 Caching (التخزين المؤقت)

#### Redis Cache Layer
```javascript
// Cache استجابات API المتكررة
const cacheKey = `bookings:${garageId}:${date}`;
const cached = await redis.get(cacheKey);

if (cached) {
    return JSON.parse(cached);
}

const bookings = await db.query('SELECT * FROM bookings WHERE ...');
await redis.setex(cacheKey, 3600, JSON.stringify(bookings)); // Cache for 1 hour
```

#### Query Result Caching
```sql
-- استخدام PostgreSQL本身的 Query Cache
SET shared_buffers = '256MB';
SET work_mem = '16MB';
```

---

## 5. توصيات الأمان (Security Recommendations)

### 5.1 تشفير البيانات (Data Encryption)

#### Encryption at Rest
```sql
-- تمكين pgcrypto للتشفير
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- تشفير البيانات الحساسة
INSERT INTO users (email, phone) VALUES (
    pgp_sym_encrypt('user@example.com', 'encryption_key'),
    pgp_sym_encrypt('+966500000000', 'encryption_key')
);

-- فك التشفير
SELECT 
    pgp_sym_decrypt(email::bytea, 'encryption_key') as email,
    pgp_sym_decrypt(phone::bytea, 'encryption_key') as phone
FROM users;
```

#### Hashing كلمات المرور
```sql
-- استخدام bcrypt أو Argon2
-- في التطبيق، استخدم:
import bcrypt from 'bcrypt';
const salt = await bcrypt.genSalt(12);
const hash = await bcrypt.hash(password, salt);
```

### 5.2 Row-Level Security (RLS)

#### تفعيل RLS
```sql
-- تفعيل RLS على جدول الحجوزات
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- يمكن للعملاء رؤية حجوزاتهم فقط
CREATE POLICY customer_own_bookings ON bookings
    FOR SELECT
    USING (customer_id = current_setting('app.current_user_id')::UUID);

-- يمكن للميكانيكيين رؤية حجوزات كراجهم
CREATE POLICY mechanic_garage_bookings ON bookings
    FOR ALL
    USING (
        garage_id = (SELECT garage_id FROM users WHERE id = current_setting('app.current_user_id')::UUID)
    );
```

### 5.3 Audit Trail (سجل التدقيق)

#### التسجيل الكامل
```sql
-- تم إنشاء جدول audit_trail بالفعل
-- يستخدم Triggers لتسجيل جميع التغييرات
```

#### Log Rotation
```sql
-- إعداد rotation للسجلات
ALTER TABLE audit_trail
    PARTITION BY RANGE (created_at);

-- إنشاء أقسام شهرية
CREATE TABLE audit_trail_2024_01 PARTITION OF audit_trail
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

### 5.4 Rate Limiting

#### Database-level Rate Limiting
```sql
-- تم إنشاء جدول rate_limiting بالفعل
-- الاستخدام:
INSERT INTO rate_limiting (user_id, endpoint, request_count, window_start, window_end)
VALUES (
    current_user_id,
    '/api/v1/bookings',
    1,
    CURRENT_TIMESTAMP - INTERVAL '1 minute',
    CURRENT_TIMESTAMP
)
ON CONFLICT (user_id, endpoint, window_start)
DO UPDATE SET request_count = rate_limiting.request_count + 1;

-- التحقق من الحد
SELECT COUNT(*) FROM rate_limiting
WHERE user_id = current_user_id
  AND endpoint = '/api/v1/bookings'
  AND window_end > CURRENT_TIMESTAMP;
```

### 5.5 Backup و Recovery

#### استراتيجيات النسخ الاحتياطي
```bash
# Daily Full Backup
pg_dump -Fc garage_db > backup_$(date +%Y%m%d).dump

# Hourly Incremental Backup
pg_dump --format=directory --file=/backups/incremental_$(date +%Y%m%d_%H) garage_db

# WAL Archiving
# في postgresql.conf:
wal_level = replica
archive_mode = on
archive_command = 'cp %p /var/lib/postgresql/wal/%f'
```

#### Point-in-Time Recovery (PITR)
```bash
# استعادة إلى وقت محدد
pg_restore --verbose --clean --if-exists -d garage_db backup.dump
```

---

## 6. توصيات التوسع (Scaling Recommendations)

### 6.1 Vertical Scaling (التوسع الرأسي)

#### Upgrade Hardware
- **CPU**: 8+ cores لمعالجة الاستعلامات المتزامنة
- **RAM**: 32GB+ لتخزين البيانات والـ Cache
- **Storage**: SSD NVMe للأداء السريع
- **Network**: 10Gbps للاتصال السريع

### 6.2 Horizontal Scaling (التوسع الأفقي)

#### Read Replicas
```sql
-- إعداد Master-Slave Replication
# في postgresql.conf على Master:
wal_level = replica
max_wal_senders = 5
wal_keep_size = 1024

# على Slave:
hot_standby = on
primary_conninfo = 'host=master port=5432 user=replicator'
```

#### Connection Routing
```javascript
// توجيه القراءات إلى Replicas
const pool = new Pool({
    host: process.env.DB_READ_REPLICA_HOST || process.env.DB_HOST,
    // ... config
});

// الكتابات تذهب للـ Master
const writePool = new Pool({
    host: process.env.DB_HOST,
    // ... config
});
```

### 6.3 Sharding (التجزئة)

#### استراتيجية Sharding حسب الكراج
```javascript
// Sharding key: garage_id
const shard1 = new Pool({ host: 'shard1.example.com' });
const shard2 = new Pool({ host: 'shard2.example.com' });

function getShard(garageId) {
    const hash = crypto.createHash('md5').update(garageId).digest('hex');
    const shardIndex = parseInt(hash.substring(0, 8), 16) % 2;
    return shardIndex === 0 ? shard1 : shard2;
}
```

### 6.4 Database Clustering

#### PostgreSQL HA (High Availability)
- **Patroni**: لإدارة PostgreSQL HA
- **Etcd**: لتخزين configuration state
- **HAProxy**: لـ Load Balancing

```yaml
# patroni.yml
scope: garage-cluster
name: postgres-1
restapi:
  listen: 0.0.0.0:8008
postgresql:
  listen: 0.0.0.0:5432
  data_dir: /var/lib/postgresql/data
```

### 6.5 Microservices Architecture

#### فصل قاعدة البيانات حسب الخدمة
```
garage-db (الخدمات الأساسية)
├── bookings (الحجوزات)
├── services (الخدمات)
└── vehicles (المركبات)

notifications-db (الإشعارات)
├── notifications_queue
├── whatsapp_logs
└── in_app_notifications

payments-db (المدفوعات)
├── invoices
├── payments
└── payment_history
```

---

## 7. مراقبة الأداء (Performance Monitoring)

### 7.1 PostgreSQL Monitoring Tools

#### pg_stat_statements
```sql
-- تفعيل extension
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- عرض الاستعلامات الأبطأ
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    stddev_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

#### pg_stat_activity
```sql
-- عرض الاتصالات النشطة
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    state_change,
    query
FROM pg_stat_activity
WHERE state != 'idle';
```

### 7.2 Monitoring Queries

#### Slow Query Log
```sql
-- تفعيل slow query log
-- في postgresql.conf:
log_min_duration_statement = 1000  # Log queries taking > 1 second
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_checkpoints = on
log_connections = on
log_disconnections = on
log_duration = on
log_lock_waits = on
```

#### Table Size Monitoring
```sql
-- حجم الجداول
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### Index Usage
```sql
-- استخدام الفهارس
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### 7.3 External Monitoring Tools

#### Prometheus + Grafana
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:9187']
```

#### pgAdmin
- مراقبة PostgreSQL GUI
- عرض الاستعلامات البطيئة
- مراقبة الاتصالات
- مراقبة التخزين

---

## 8. صيانة قاعدة البيانات (Database Maintenance)

### 8.1 VACUUM
```sql
-- VACUUM تلقائي
-- في postgresql.conf:
autovacuum = on
autovacuum_vacuum_scale_factor = 0.2
autovacuum_analyze_scale_factor = 0.1

-- VACUUM يدوي
VACUUM ANALYZE bookings;
VACUUM FULL payments;
```

### 8.2 REINDEX
```sql
-- إعادة بناء الفهارس
REINDEX TABLE bookings;
REINDEX INDEX idx_bookings_status;
```

### 8.3 ANALYZE
```sql
-- تحديث إحصائيات المخطط
ANALYZE bookings;
ANALYZE invoices;
ANALYZE users;
```

---

## 9. إرشادات التطوير (Development Guidelines)

### 9.1 Naming Conventions

#### أسماء الجداول
- استخدم snake_case: `user_profiles`, `booking_status_history`
- استخدم أسماء جمع: `users`, `bookings`, `payments`
- تجنب الكلمات المحجوزة SQL

#### أسماء الأعمدة
- استخدم snake_case: `created_at`, `updated_at`, `is_active`
- استخدم بادئات واضحة: `user_id`, `garage_id`, `customer_id`
- للـ Boolean: استخدم `is_` أو `has_`: `is_active`, `has_discount`

#### أسماء الفهارس
- استخدم: `idx_table_name_column_name`
- للفهارس المركبة: `idx_table_name_search`
- للفهارس الجزئية: `idx_table_name_partial_condition`

### 9.2 Best Practices

#### استخدام Transactions
```sql
BEGIN;
-- عمليات متعددة
INSERT INTO bookings (...) VALUES (...);
INSERT INTO booking_status_history (...) VALUES (...);
COMMIT;
-- أو ROLLBACK في حالة الخطأ
```

#### استخدام Prepared Statements
```javascript
// دعم SQL Injection
const query = 'SELECT * FROM users WHERE email = $1';
await db.query(query, [email]);
```

#### استخدام Connection Pooling
```javascript
const pool = new Pool({
    max: 20, // الحد الأقصى للاتصالات
    min: 5,  // الحد الأدنى للاتصالات
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
```

---

## 10. ملخص النهائي

### قاعدة البيانات المختارة: PostgreSQL 15+

### الأسباب الرئيسية:
1. دعم ACID كامل
2. أداء قوي وقابل للتوسع
3. دعم علاقات معقدة
4. دعم JSONB و Arrays
5. دعم Full-Text Search
6. مجاني ومفتوح المصدر
7. مجتمع قوي ودعم ممتاز

### عدد الجداول: 35+ جدول

### الميزات المتقدمة المضمنة:
- ✅ Audit Trail كامل
- ✅ Soft Delete على الجداول المهمة
- ✅ Notification Queue
- ✅ Retry Mechanism
- ✅ Token Revocation Table
- ✅ Payment History
- ✅ Stock Movement History
- ✅ Mechanic Performance Tracking
- ✅ Rate Limiting per user
- ✅ Versioning (من خلال Audit Trail)

### الفهارس:
- ✅ Primary Keys (UUID)
- ✅ Foreign Key Indexes
- ✅ Composite Indexes
- ✅ Partial Indexes
- ✅ Functional Indexes (GIN, GiST)

### Views:
- ✅ active_bookings_summary
- ✅ overdue_invoices_summary
- ✅ mechanic_performance_view
- ✅ low_stock_alerts
- ✅ daily_revenue_summary
- ✅ pending_additional_services

### Stored Procedures:
- ✅ create_booking
- ✅ update_booking_status
- ✅ add_invoice_payment
- ✅ update_stock

### Triggers:
- ✅ update_updated_at_column (تلقائي)
- ✅ set_invoice_number (تلقائي)
- ✅ set_qr_token (تلقائي)
- ✅ audit_trail_func (للجداول المهمة)

### توصيات الأداء:
- ✅ Partitioning (Date-based, Garage-based)
- ✅ Materialized Views
- ✅ Connection Pooling (PgBouncer)
- ✅ Caching (Redis)
- ✅ Read Replicas

### توصيات الأمان:
- ✅ Encryption at Rest (pgcrypto)
- ✅ Row-Level Security (RLS)
- ✅ Audit Trail
- ✅ Rate Limiting
- ✅ Backup و Recovery

### توصيات التوسع:
- ✅ Vertical Scaling
- ✅ Horizontal Scaling (Read Replicas)
- ✅ Sharding
- ✅ Database Clustering (Patroni)
- ✅ Microservices Architecture

---

## ملفات الإخراج النهائية

1. **DATABASE_DESIGN_COMPLETE.md**: هذا الملف (الوصف الكامل)
2. **DATABASE_SCHEMA_SQL.sql**: مخطط SQL الكامل مع جميع الجداول والفهارس والـ Triggers والـ Views والـ Stored Procedures

قاعدة البيانات جاهزة للاستخدام في التطوير أو الإنتاج.
