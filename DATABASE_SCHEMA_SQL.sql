-- ============================================================================
-- نظام إدارة الكراج - مخطط قاعدة البيانات الكامل (PostgreSQL 15+)
-- Garage Management System - Complete Database Schema
-- ============================================================================

-- ============================================================================
-- إعدادات قاعدة البيانات
-- Database Settings
-- ============================================================================

-- تمكين UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- تمكين pgcrypto للتشفير
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- تمكين unaccent للبحث النصي بدون accents
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ============================================================================
-- Enum Types
-- ============================================================================

-- أدوار المستخدمين
CREATE TYPE user_role AS ENUM (
    'ADMIN',
    'GARAGE_OWNER',
    'GARAGE_MANAGER',
    'MECHANIC',
    'RECEPTIONIST',
    'CASHIER',
    'CUSTOMER',
    'INVENTORY_MANAGER'
);

-- حالة الحجز
CREATE TYPE booking_status AS ENUM (
    'PENDING',
    'CONFIRMED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW',
    'DELAYED',
    'WAITING_PARTS'
);

-- حالة الفاتورة
CREATE TYPE invoice_status AS ENUM (
    'DRAFT',
    'SENT',
    'PAID',
    'OVERDUE',
    'CANCELLED'
);

-- نوع الإشعار
CREATE TYPE notification_type AS ENUM (
    'BOOKING_CREATED',
    'BOOKING_UPDATED',
    'BOOKING_CANCELLED',
    'BOOKING_CONFIRMED',
    'WORK_STARTED',
    'WORK_COMPLETED',
    'PAYMENT_RECEIVED',
    'INVOICE_ISSUED',
    'INVOICE_OVERDUE',
    'MAINTENANCE_DUE',
    'GARAGE_UPDATE',
    'SYSTEM_NOTIFICATION',
    'VEHICLE_ENTRY',
    'VEHICLE_EXIT',
    'PARTS_REQUESTED',
    'PARTS_RECEIVED'
);

-- قناة الإشعار
CREATE TYPE notification_channel AS ENUM (
    'WHATSAPP',
    'SMS',
    'EMAIL',
    'IN_APP',
    'PUSH'
);

-- أولوية الإشعار
CREATE TYPE notification_priority AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);

-- حالة الإشعار
CREATE TYPE notification_status AS ENUM (
    'PENDING',
    'SENT',
    'DELIVERED',
    'READ',
    'FAILED',
    'RETRYING'
);

-- حالة الخدمة الإضافية
CREATE TYPE additional_service_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'EXPIRED'
);

-- نوع الخصم
CREATE TYPE discount_type AS ENUM (
    'PERCENTAGE',
    'FIXED'
);

-- نوع الضرائب
CREATE TYPE tax_type AS ENUM (
    'VAT',
    'SALES',
    'SERVICE'
);

-- طريقة الدفع
CREATE TYPE payment_method AS ENUM (
    'CASH',
    'CARD',
    'BANK_TRANSFER',
    'APPLE_PAY',
    'MADA',
    'STC_PAY'
);

-- حالة الدفعة
CREATE TYPE payment_status AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'REFUNDED',
    'PARTIALLY_REFUNDED'
);

-- حالة طلب القطع
CREATE TYPE parts_request_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'ORDERED',
    'RECEIVED',
    'CANCELLED'
);

-- نوع حركة المخزون
CREATE TYPE stock_movement_type AS ENUM (
    'IN',
    'OUT',
    'ADJUSTMENT',
    'TRANSFER',
    'RETURN'
);

-- مستوى المهارة
CREATE TYPE skill_level AS ENUM (
    'BEGINNER',
    'INTERMEDIATE',
    'EXPERT',
    'MASTER'
);

-- حالة المخزون
CREATE TYPE availability_status AS ENUM (
    'AVAILABLE',
    'BUSY',
    'ON_LEAVE',
    'UNAVAILABLE'
);

-- نوع الإجراء في سجل التدقيق
CREATE TYPE audit_action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'SELECT',
    'LOGIN',
    'LOGOUT',
    'FAILED_LOGIN'
);

-- ============================================================================
-- الجداول الأساسية
-- Core Tables
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Users (المستخدمون)
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'CUSTOMER',
    garage_id UUID REFERENCES garages(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    phone_verified BOOLEAN NOT NULL DEFAULT false,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    availability_status availability_status DEFAULT 'AVAILABLE',
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    avatar_url TEXT,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- فهرس على البريد الإلكتروني
CREATE INDEX idx_users_email ON users(email);
-- فهرس على الدور
CREATE INDEX idx_users_role ON users(role);
-- فهرس على الكراج
CREATE INDEX idx_users_garage_id ON users(garage_id);
-- فهرس على حالة النشاط
CREATE INDEX idx_users_is_active ON users(is_active);
-- فهرس على Soft Delete
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;

-- ----------------------------------------------------------------------------
-- Roles (الأدوار)
-- ----------------------------------------------------------------------------
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- Garages (الكراجات)
-- ----------------------------------------------------------------------------
CREATE TABLE garages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Saudi Arabia',
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    website TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    working_hours JSONB NOT NULL DEFAULT '{"sunday": {"open": "08:00", "close": "20:00"}, "monday": {"open": "08:00", "close": "20:00"}, "tuesday": {"open": "08:00", "close": "20:00"}, "wednesday": {"open": "08:00", "close": "20:00"}, "thursday": {"open": "08:00", "close": "20:00"}, "friday": {"open": "14:00", "close": "20:00"}, "saturday": {"open": "08:00", "close": "20:00"}}',
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    logo_url TEXT,
    cover_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- فهرس على المالك
CREATE INDEX idx_garages_owner_id ON garages(owner_id);
-- فهرس على المدينة
CREATE INDEX idx_garages_city ON garages(city);
-- فهرس على التقييم
CREATE INDEX idx_garages_rating ON garages(rating DESC);
-- فهرس على حالة النشاط
CREATE INDEX idx_garages_is_active ON garages(is_active);
-- فهرس على Soft Delete
CREATE INDEX idx_garages_deleted_at ON garages(deleted_at) WHERE deleted_at IS NULL;
-- فهرس جغرافي
CREATE INDEX idx_garages_location ON garages USING GIST(ll_to_earth(latitude, longitude));

-- ----------------------------------------------------------------------------
-- Customers (العملاء)
-- ----------------------------------------------------------------------------
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    national_id VARCHAR(20),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    preferred_language VARCHAR(10) DEFAULT 'ar',
    loyalty_points INTEGER NOT NULL DEFAULT 0,
    total_spent DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    total_bookings INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- فهرس على المستخدم
CREATE INDEX idx_customers_user_id ON customers(user_id);
-- فهرس على الهاتف
CREATE INDEX idx_customers_phone ON customers(phone);
-- فهرس على البريد الإلكتروني
CREATE INDEX idx_customers_email ON customers(email);
-- فهرس على نقاط الولاء
CREATE INDEX idx_customers_loyalty_points ON customers(loyalty_points DESC);

-- ----------------------------------------------------------------------------
-- Vehicles (المركبات)
-- ----------------------------------------------------------------------------
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    plate VARCHAR(20) NOT NULL,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER,
    vin VARCHAR(17),
    color VARCHAR(50),
    mileage INTEGER,
    fuel_type VARCHAR(50),
    transmission VARCHAR(50),
    engine_size VARCHAR(20),
    body_type VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(customer_id, plate)
);

-- فهرس على العميل
CREATE INDEX idx_vehicles_customer_id ON vehicles(customer_id);
-- فهرس على اللوحة
CREATE INDEX idx_vehicles_plate ON vehicles(plate);
-- فهرس على الماركة
CREATE INDEX idx_vehicles_make ON vehicles(make);
-- فهرس على الموديل
CREATE INDEX idx_vehicles_model ON vehicles(model);
-- فهرس على Soft Delete
CREATE INDEX idx_vehicles_deleted_at ON vehicles(deleted_at) WHERE deleted_at IS NULL;

-- ----------------------------------------------------------------------------
-- Vehicle Status History (تاريخ حالة المركبة)
-- ----------------------------------------------------------------------------
CREATE TABLE vehicle_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- فهرس على المركبة
CREATE INDEX idx_vehicle_status_history_vehicle_id ON vehicle_status_history(vehicle_id);
-- فهرس على التاريخ
CREATE INDEX idx_vehicle_status_history_changed_at ON vehicle_status_history(changed_at DESC);

-- ----------------------------------------------------------------------------
-- Service Categories (فئات الخدمات)
-- ----------------------------------------------------------------------------
CREATE TABLE service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100),
    description TEXT,
    parent_id UUID REFERENCES service_categories(id) ON DELETE CASCADE,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- فهرس على الأب
CREATE INDEX idx_service_categories_parent_id ON service_categories(parent_id);
-- فهرس على حالة النشاط
CREATE INDEX idx_service_categories_is_active ON service_categories(is_active);

-- ----------------------------------------------------------------------------
-- Services (الخدمات)
-- ----------------------------------------------------------------------------
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garage_id UUID REFERENCES garages(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    description_ar TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_popular BOOLEAN NOT NULL DEFAULT false,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- فهرس على الكراج
CREATE INDEX idx_services_garage_id ON services(garage_id);
-- فهرس على الفئة
CREATE INDEX idx_services_category_id ON services(category_id);
-- فهرس على السعر
CREATE INDEX idx_services_price ON services(price);
-- فهرس على حالة النشاط
CREATE INDEX idx_services_is_active ON services(is_active);
-- فهرس على Soft Delete
CREATE INDEX idx_services_deleted_at ON services(deleted_at) WHERE deleted_at IS NULL;

-- ----------------------------------------------------------------------------
-- Service Items (بنود الخدمة)
-- ----------------------------------------------------------------------------
CREATE TABLE service_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity_required DECIMAL(10, 2) NOT NULL DEFAULT 1.00,
    unit VARCHAR(50) DEFAULT 'piece',
    is_optional BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- فهرس على الخدمة
CREATE INDEX idx_service_items_service_id ON service_items(service_id);

-- ----------------------------------------------------------------------------
-- Bookings (الحجوزات)
-- ----------------------------------------------------------------------------
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    garage_id UUID REFERENCES garages(id) ON DELETE CASCADE NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    assigned_mechanic_id UUID REFERENCES users(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    estimated_duration_minutes INTEGER NOT NULL,
    actual_duration_minutes INTEGER,
    status booking_status NOT NULL DEFAULT 'PENDING',
    qr_token VARCHAR(255) UNIQUE NOT NULL,
    qr_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    estimated_completion_at TIMESTAMP WITH TIME ZONE,
    actual_completion_at TIMESTAMP WITH TIME ZONE,
    delay_reason TEXT,
    expected_parts_arrival_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    pickup_address TEXT,
    pickup_coordinates JSONB,
    dropoff_address TEXT,
    dropoff_coordinates JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- فهرس على العميل
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
-- فهرس على الكراج
CREATE INDEX idx_bookings_garage_id ON bookings(garage_id);
-- فهرس على المركبة
CREATE INDEX idx_bookings_vehicle_id ON bookings(vehicle_id);
-- فهرس على الخدمة
CREATE INDEX idx_bookings_service_id ON bookings(service_id);
-- فهرس على الميكانيكي
CREATE INDEX idx_bookings_assigned_mechanic_id ON bookings(assigned_mechanic_id);
-- فهرس على الحالة
CREATE INDEX idx_bookings_status ON bookings(status);
-- فهرس على الموعد
CREATE INDEX idx_bookings_scheduled_at ON bookings(scheduled_at);
-- فهرس على QR Token
CREATE INDEX idx_bookings_qr_token ON bookings(qr_token);
-- فهرس على انتهاء صلاحية QR
CREATE INDEX idx_bookings_qr_expires_at ON bookings(qr_expires_at);
-- فهرس على Soft Delete
CREATE INDEX idx_bookings_deleted_at ON bookings(deleted_at) WHERE deleted_at IS NULL;
-- فهرس مركب للبحث
CREATE INDEX idx_bookings_search ON bookings(garage_id, status, scheduled_at);

-- ----------------------------------------------------------------------------
-- Booking Status History (تاريخ حالة الحجز)
-- ----------------------------------------------------------------------------
CREATE TABLE booking_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    status booking_status NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    old_status booking_status,
    new_status booking_status
);

-- فهرس على الحجز
CREATE INDEX idx_booking_status_history_booking_id ON booking_status_history(booking_id);
-- فهرس على التاريخ
CREATE INDEX idx_booking_status_history_changed_at ON booking_status_history(changed_at DESC);
-- فهرس على من قام بالتغيير
CREATE INDEX idx_booking_status_history_changed_by ON booking_status_history(changed_by);

-- ----------------------------------------------------------------------------
-- Mechanic Specializations (تخصصات الميكانيكيين)
-- ----------------------------------------------------------------------------
CREATE TABLE mechanic_specializations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mechanic_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE NOT NULL,
    skill_level skill_level NOT NULL DEFAULT 'INTERMEDIATE',
    certified_at TIMESTAMP WITH TIME ZONE,
    certificate_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(mechanic_id, service_id)
);

-- فهرس على الميكانيكي
CREATE INDEX idx_mechanic_specializations_mechanic_id ON mechanic_specializations(mechanic_id);
-- فهرس على الخدمة
CREATE INDEX idx_mechanic_specializations_service_id ON mechanic_specializations(service_id);
-- فهرس على مستوى المهارة
CREATE INDEX idx_mechanic_specializations_skill_level ON mechanic_specializations(skill_level);

-- ----------------------------------------------------------------------------
-- Mechanic Work Sessions (جلسات العمل)
-- ----------------------------------------------------------------------------
CREATE TABLE mechanic_work_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mechanic_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    description TEXT,
    work_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- فهرس على الميكانيكي
CREATE INDEX idx_mechanic_work_sessions_mechanic_id ON mechanic_work_sessions(mechanic_id);
-- فهرس على الحجز
CREATE INDEX idx_mechanic_work_sessions_booking_id ON mechanic_work_sessions(booking_id);
-- فهرس على وقت البدء
CREATE INDEX idx_mechanic_work_sessions_start_time ON mechanic_work_sessions(start_time DESC);

-- ----------------------------------------------------------------------------
-- Mechanic Ratings (تقييمات الميكانيكيين)
-- ----------------------------------------------------------------------------
CREATE TABLE mechanic_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mechanic_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    rated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_id, booking_id)
);

-- فهرس على الميكانيكي
CREATE INDEX idx_mechanic_ratings_mechanic_id ON mechanic_ratings(mechanic_id);
-- فهرس على العميل
CREATE INDEX idx_mechanic_ratings_customer_id ON mechanic_ratings(customer_id);
-- فهرس على التقييم
CREATE INDEX idx_mechanic_ratings_rating ON mechanic_ratings(rating);

-- ----------------------------------------------------------------------------
-- Mechanic Handovers (تسليم المهام)
-- ----------------------------------------------------------------------------
CREATE TABLE mechanic_handovers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_mechanic_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    to_mechanic_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    handover_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- فهرس على من
CREATE INDEX idx_mechanic_handovers_from_mechanic_id ON mechanic_handovers(from_mechanic_id);
-- فهرس على إلى
CREATE INDEX idx_mechanic_handovers_to_mechanic_id ON mechanic_handovers(to_mechanic_id);
-- فهرس على الحجز
CREATE INDEX idx_mechanic_handovers_booking_id ON mechanic_handovers(booking_id);

-- ----------------------------------------------------------------------------
-- Parts Inventory (مخزون القطع)
-- ----------------------------------------------------------------------------
CREATE TABLE parts_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garage_id UUID REFERENCES garages(id) ON DELETE CASCADE NOT NULL,
    part_number VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100) UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    brand VARCHAR(100),
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    min_stock_level DECIMAL(10, 2) NOT NULL DEFAULT 5.00,
    max_stock_level DECIMAL(10, 2) NOT NULL DEFAULT 100.00,
    unit_price DECIMAL(10, 2) NOT NULL,
    selling_price DECIMAL(10, 2),
    supplier VARCHAR(255),
    supplier_phone VARCHAR(20),
    location VARCHAR(100),
    shelf VARCHAR(50),
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    reorder_point INTEGER DEFAULT 10,
    lead_time_days INTEGER DEFAULT 7,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- فهرس على الكراج
CREATE INDEX idx_parts_inventory_garage_id ON parts_inventory(garage_id);
-- فهرس على رقم القطعة
CREATE INDEX idx_parts_inventory_part_number ON parts_inventory(part_number);
-- فهرس على الباركود
CREATE INDEX idx_parts_inventory_barcode ON parts_inventory(barcode);
-- فهرس على الفئة
CREATE INDEX idx_parts_inventory_category ON parts_inventory(category);
-- فهرس على الكمية
CREATE INDEX idx_parts_inventory_quantity ON parts_inventory(quantity);
-- فهرس على حالة النشاط
CREATE INDEX idx_parts_inventory_is_active ON parts_inventory(is_active);
-- فهرس على Soft Delete
CREATE INDEX idx_parts_inventory_deleted_at ON parts_inventory(deleted_at) WHERE deleted_at IS NULL;

-- ----------------------------------------------------------------------------
-- Parts Requests (طلبات القطع)
-- ----------------------------------------------------------------------------
CREATE TABLE parts_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    part_id UUID REFERENCES parts_inventory(id) ON DELETE SET NULL,
    part_name VARCHAR(255) NOT NULL,
    part_number VARCHAR(100),
    requested_by UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    status parts_request_status NOT NULL DEFAULT 'PENDING',
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    ordered_at TIMESTAMP WITH TIME ZONE,
    received_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    urgency VARCHAR(50) DEFAULT 'NORMAL',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- فهرس على الحجز
CREATE INDEX idx_parts_requests_booking_id ON parts_requests(booking_id);
-- فهرس على القطعة
CREATE INDEX idx_parts_requests_part_id ON parts_requests(part_id);
-- فهرس على من طلب
CREATE INDEX idx_parts_requests_requested_by ON parts_requests(requested_by);
-- فهرس على الحالة
CREATE INDEX idx_parts_requests_status ON parts_requests(status);
-- فهرس على الاستعجال
CREATE INDEX idx_parts_requests_urgency ON parts_requests(urgency);

-- ----------------------------------------------------------------------------
-- Stock Movement History (تاريخ حركة المخزون)
-- ----------------------------------------------------------------------------
CREATE TABLE stock_movement_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    part_id UUID REFERENCES parts_inventory(id) ON DELETE CASCADE NOT NULL,
    movement_type stock_movement_type NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    quantity_before DECIMAL(10, 2),
    quantity_after DECIMAL(10, 2),
    reference_type VARCHAR(50),
    reference_id UUID,
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- فهرس على القطعة
CREATE INDEX idx_stock_movement_history_part_id ON stock_movement_history(part_id);
-- فهرس على نوع الحركة
CREATE INDEX idx_stock_movement_history_movement_type ON stock_movement_history(movement_type);
-- فهرس على التاريخ
CREATE INDEX idx_stock_movement_history_created_at ON stock_movement_history(created_at DESC);

-- ----------------------------------------------------------------------------
-- Additional Services (الخدمات الإضافية)
-- ----------------------------------------------------------------------------
CREATE TABLE additional_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    status additional_service_status NOT NULL DEFAULT 'PENDING',
    approval_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    approved BOOLEAN NOT NULL DEFAULT false,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    decision_reason TEXT,
    decision_made_at TIMESTAMP WITH TIME ZONE,
    images JSONB NOT NULL DEFAULT '[]',
    video_url TEXT,
    selected_option_id UUID REFERENCES service_options(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- فهرس على الحجز
CREATE INDEX idx_additional_services_booking_id ON additional_services(booking_id);
-- فهرس على الحالة
CREATE INDEX idx_additional_services_status ON additional_services(status);
-- فهرس على الموعد النهائي
CREATE INDEX idx_additional_services_approval_deadline ON additional_services(approval_deadline);

-- ----------------------------------------------------------------------------
-- Service Options (خيارات الخدمة)
-- ----------------------------------------------------------------------------
CREATE TABLE service_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    additional_service_id UUID REFERENCES additional_services(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    is_recommended BOOLEAN NOT NULL DEFAULT false,
    stock_available BOOLEAN NOT NULL DEFAULT true,
    image_url TEXT,
    estimated_days INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- فهرس على الخدمة الإضافية
CREATE INDEX idx_service_options_additional_service_id ON service_options(additional_service_id);
-- فهرس على التوصية
CREATE INDEX idx_service_options_is_recommended ON service_options(is_recommended);

-- ----------------------------------------------------------------------------
-- Customer Approvals (موافقات العملاء)
-- ----------------------------------------------------------------------------
CREATE TABLE customer_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    approval_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    details JSONB NOT NULL DEFAULT '{}',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    responded_at TIMESTAMP WITH TIME ZONE,
    response_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- فهرس على الحجز
CREATE INDEX idx_customer_approvals_booking_id ON customer_approvals(booking_id);
-- فهرس على الحالة
CREATE INDEX idx_customer_approvals_status ON customer_approvals(status);
-- فهرس على انتهاء الصلاحية
CREATE INDEX idx_customer_approvals_expires_at ON customer_approvals(expires_at);

-- ----------------------------------------------------------------------------
-- Notifications Queue (طابور الإشعارات)
-- ----------------------------------------------------------------------------
CREATE TABLE notifications_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}',
    channel notification_channel NOT NULL,
    priority notification_priority NOT NULL DEFAULT 'MEDIUM',
    status notification_status NOT NULL DEFAULT 'PENDING',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- فهرس على المستلم
CREATE INDEX idx_notifications_queue_recipient_id ON notifications_queue(recipient_id);
-- فهرس على الحالة
CREATE INDEX idx_notifications_queue_status ON notifications_queue(status);
-- فهرس على الأولوية
CREATE INDEX idx_notifications_queue_priority ON notifications_queue(priority);
-- فهرس على الموعد المجدول
CREATE INDEX idx_notifications_queue_scheduled_at ON notifications_queue(scheduled_at);
-- فهرس على وقت إعادة المحاولة
CREATE INDEX idx_notifications_queue_next_retry_at ON notifications_queue(next_retry_at) WHERE next_retry_at IS NOT NULL;

-- ----------------------------------------------------------------------------
-- WhatsApp Logs (سجلات WhatsApp)
-- ----------------------------------------------------------------------------
CREATE TABLE whatsapp_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID REFERENCES notifications_queue(id) ON DELETE SET NULL,
    phone_number VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'QUEUED',
    message_id VARCHAR(255),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    error_code VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- فهرس على الإشعار
CREATE INDEX idx_whatsapp_logs_notification_id ON whatsapp_logs(notification_id);
-- فهرس على رقم الهاتف
CREATE INDEX idx_whatsapp_logs_phone_number ON whatsapp_logs(phone_number);
-- فهرس على الحالة
CREATE INDEX idx_whatsapp_logs_status ON whatsapp_logs(status);
-- فهرس على message_id
CREATE INDEX idx_whatsapp_logs_message_id ON whatsapp_logs(message_id);

-- ----------------------------------------------------------------------------
-- In-App Notifications (إشعارات داخل التطبيق)
-- ----------------------------------------------------------------------------
CREATE TABLE in_app_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    data JSONB NOT NULL DEFAULT '{}',
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- فهرس على المستخدم
CREATE INDEX idx_in_app_notifications_user_id ON in_app_notifications(user_id);
-- فهرس على حالة القراءة
CREATE INDEX idx_in_app_notifications_is_read ON in_app_notifications(is_read);
-- فهرس على التاريخ
CREATE INDEX idx_in_app_notifications_created_at ON in_app_notifications(created_at DESC);

-- ----------------------------------------------------------------------------
-- Notification Templates (قوالب الإشعارات)
-- ----------------------------------------------------------------------------
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type notification_type NOT NULL,
    language VARCHAR(10) NOT NULL DEFAULT 'ar',
    subject VARCHAR(255),
    template TEXT NOT NULL,
    variables JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- فهرس على النوع
CREATE INDEX idx_notification_templates_type ON notification_templates(type);
-- فهرس على اللغة
CREATE INDEX idx_notification_templates_language ON notification_templates(language);
-- فهرس على حالة النشاط
CREATE INDEX idx_notification_templates_is_active ON notification_templates(is_active);

-- ----------------------------------------------------------------------------
-- Notification Preferences (تفضيلات الإشعارات)
-- ----------------------------------------------------------------------------
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    email_enabled BOOLEAN NOT NULL DEFAULT true,
    sms_enabled BOOLEAN NOT NULL DEFAULT true,
    whatsapp_enabled BOOLEAN NOT NULL DEFAULT true,
    in_app_enabled BOOLEAN NOT NULL DEFAULT true,
    push_enabled BOOLEAN NOT NULL DEFAULT true,
    preferred_time VARCHAR(50),
    notification_types JSONB NOT NULL DEFAULT '["BOOKING_CREATED", "BOOKING_UPDATED", "BOOKING_CANCELLED", "PAYMENT_RECEIVED", "INVOICE_ISSUED", "MAINTENANCE_DUE"]',
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- فهرس على المستخدم
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);

-- ----------------------------------------------------------------------------
-- Invoices (الفواتير)
-- ----------------------------------------------------------------------------
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    garage_id UUID REFERENCES garages(id) ON DELETE CASCADE NOT NULL,
    subtotal DECIMAL(15, 2) NOT NULL,
    tax_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'SAR',
    status invoice_status NOT NULL DEFAULT 'DRAFT',
    issued_date TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    paid_date TIMESTAMP WITH TIME ZONE,
    tax_calculation_method VARCHAR(50) NOT NULL DEFAULT 'PER_ITEM',
    discount_id UUID REFERENCES discounts(id) ON DELETE SET NULL,
    notes TEXT,
    last_notification_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- فهرس على رقم الفاتورة
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
-- فهرس على الحجز
CREATE INDEX idx_invoices_booking_id ON invoices(booking_id);
-- فهرس على العميل
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
-- فهرس على الكراج
CREATE INDEX idx_invoices_garage_id ON invoices(garage_id);
-- فهرس على الحالة
CREATE INDEX idx_invoices_status ON invoices(status);
-- فهرس على تاريخ الاستحقاق
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
-- فهرس على Soft Delete
CREATE INDEX idx_invoices_deleted_at ON invoices(deleted_at) WHERE deleted_at IS NULL;

-- ----------------------------------------------------------------------------
-- Invoice Items (بنود الفاتورة)
-- ----------------------------------------------------------------------------
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
    description VARCHAR(500) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1.00,
    unit_price DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.15,
    tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL,
    tax_rate_id UUID REFERENCES tax_rates(id) ON DELETE SET NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    part_id UUID REFERENCES parts_inventory(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- فهرس على الفاتورة
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
-- فهرس على الخدمة
CREATE INDEX idx_invoice_items_service_id ON invoice_items(service_id);
-- فهرس على القطعة
CREATE INDEX idx_invoice_items_part_id ON invoice_items(part_id);

-- ----------------------------------------------------------------------------
-- Payments (المدفوعات)
-- ----------------------------------------------------------------------------
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    payment_method payment_method NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    transaction_id VARCHAR(255) UNIQUE,
    status payment_status NOT NULL DEFAULT 'PENDING',
    processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- فهرس على الفاتورة
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
-- فهرس على العميل
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
-- فهرس على transaction_id
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
-- فهرس على الحالة
CREATE INDEX idx_payments_status ON payments(status);
-- فهرس على تاريخ الدفع
CREATE INDEX idx_payments_payment_date ON payments(payment_date);

-- ----------------------------------------------------------------------------
-- Payment History (تاريخ المدفوعات)
-- ----------------------------------------------------------------------------
CREATE TABLE payment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE NOT NULL,
    status payment_status NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT
);

-- فهرس على الدفعة
CREATE INDEX idx_payment_history_payment_id ON payment_history(payment_id);
-- فهرس على التاريخ
CREATE INDEX idx_payment_history_changed_at ON payment_history(changed_at DESC);

-- ----------------------------------------------------------------------------
-- Discounts (الخصومات)
-- ----------------------------------------------------------------------------
CREATE TABLE discounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    type discount_type NOT NULL,
    value DECIMAL(10, 2) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    max_uses INTEGER,
    used_count INTEGER NOT NULL DEFAULT 0,
    min_purchase_amount DECIMAL(15, 2),
    applicable_services JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- فهرس على الكود
CREATE INDEX idx_discounts_code ON discounts(code);
-- فهرس على حالة النشاط
CREATE INDEX idx_discounts_is_active ON discounts(is_active);
-- فهرس على التواريخ
CREATE INDEX idx_discounts_dates ON discounts(start_date, end_date);

-- ----------------------------------------------------------------------------
-- Tax Rates (أسعار الضرائب)
-- ----------------------------------------------------------------------------
CREATE TABLE tax_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garage_id UUID REFERENCES garages(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    rate DECIMAL(5, 2) NOT NULL,
    type tax_type NOT NULL,
    region VARCHAR(100),
    effective_from TIMESTAMP WITH TIME ZONE NOT NULL,
    effective_to TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- فهرس على الكراج
CREATE INDEX idx_tax_rates_garage_id ON tax_rates(garage_id);
-- فهرس على حالة النشاط
CREATE INDEX idx_tax_rates_is_active ON tax_rates(is_active);
-- فهرس على التواريخ
CREATE INDEX idx_tax_rates_dates ON tax_rates(effective_from, effective_to);

-- ----------------------------------------------------------------------------
-- Cancellation Policies (سياسات الإلغاء)
-- ----------------------------------------------------------------------------
CREATE TABLE cancellation_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garage_id UUID REFERENCES garages(id) ON DELETE CASCADE NOT NULL,
    hours_before_cancel INTEGER NOT NULL,
    refund_percentage DECIMAL(5, 2) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- فهرس على الكراج
CREATE INDEX idx_cancellation_policies_garage_id ON cancellation_policies(garage_id);
-- فهرس على حالة النشاط
CREATE INDEX idx_cancellation_policies_is_active ON cancellation_policies(is_active);

-- ----------------------------------------------------------------------------
-- Cancellations (عمليات الإلغاء)
-- ----------------------------------------------------------------------------
CREATE TABLE cancellations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    cancelled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cancelled_by UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    refund_amount DECIMAL(15, 2),
    refund_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    refund_processed_at TIMESTAMP WITH TIME ZONE,
    reason TEXT,
    notes TEXT
);

-- فهرس على الحجز
CREATE INDEX idx_cancellations_booking_id ON cancellations(booking_id);
-- فهرس على من ألغى
CREATE INDEX idx_cancellations_cancelled_by ON cancellations(cancelled_by);
-- فهرس على حالة الاسترداد
CREATE INDEX idx_cancellations_refund_status ON cancellations(refund_status);

-- ----------------------------------------------------------------------------
-- QR Sessions (جلسات QR)
-- ----------------------------------------------------------------------------
CREATE TABLE qr_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    qr_token VARCHAR(255) UNIQUE NOT NULL,
    scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    location JSONB,
    device_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- فهرس على الحجز
CREATE INDEX idx_qr_sessions_booking_id ON qr_sessions(booking_id);
-- فهرس على QR Token
CREATE INDEX idx_qr_sessions_qr_token ON qr_sessions(qr_token);
-- فهرس على التاريخ
CREATE INDEX idx_qr_sessions_scanned_at ON qr_sessions(scanned_at DESC);

-- ----------------------------------------------------------------------------
-- Audit Trail (سجل التدقيق)
-- ----------------------------------------------------------------------------
CREATE TABLE audit_trail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action audit_action NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- فهرس على المستخدم
CREATE INDEX idx_audit_trail_user_id ON audit_trail(user_id);
-- فهرس على الجدول
CREATE INDEX idx_audit_trail_table_name ON audit_trail(table_name);
-- فهرس على السجل
CREATE INDEX idx_audit_trail_record_id ON audit_trail(record_id);
-- فهرس على الإجراء
CREATE INDEX idx_audit_trail_action ON audit_trail(action);
-- فهرس على التاريخ
CREATE INDEX idx_audit_trail_changed_at ON audit_trail(changed_at DESC);
-- فهرس مركب للبحث
CREATE INDEX idx_audit_trail_search ON audit_trail(table_name, record_id, changed_at DESC);

-- ----------------------------------------------------------------------------
-- System Settings (إعدادات النظام)
-- ----------------------------------------------------------------------------
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- Payment Limits (حدود الدفع)
-- ----------------------------------------------------------------------------
CREATE TABLE payment_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    daily_limit DECIMAL(15, 2) NOT NULL DEFAULT 10000.00,
    monthly_limit DECIMAL(15, 2) NOT NULL DEFAULT 50000.00,
    per_transaction_limit DECIMAL(15, 2) NOT NULL DEFAULT 5000.00,
    daily_spent DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    monthly_spent DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    reset_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- فهرس على المستخدم
CREATE INDEX idx_payment_limits_user_id ON payment_limits(user_id);
-- فهرس على تاريخ إعادة التعيين
CREATE INDEX idx_payment_limits_reset_date ON payment_limits(reset_date);

-- ----------------------------------------------------------------------------
-- Token Blacklist (القائمة السوداء للرموز)
-- ----------------------------------------------------------------------------
CREATE TABLE token_blacklist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token VARCHAR(500) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- فهرس على المستخدم
CREATE INDEX idx_token_blacklist_user_id ON token_blacklist(user_id);
-- فهرس على الرمز
CREATE INDEX idx_token_blacklist_token ON token_blacklist(token);
-- فهرس على انتهاء الصلاحية
CREATE INDEX idx_token_blacklist_expires_at ON token_blacklist(expires_at);

-- ----------------------------------------------------------------------------
-- Rate Limiting (حدود الطلبات)
-- ----------------------------------------------------------------------------
CREATE TABLE rate_limiting (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(45),
    endpoint VARCHAR(255) NOT NULL,
    request_count INTEGER NOT NULL DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    window_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- فهرس على المستخدم
CREATE INDEX idx_rate_limiting_user_id ON rate_limiting(user_id);
-- فهرس على IP
CREATE INDEX idx_rate_limiting_ip_address ON rate_limiting(ip_address);
-- فهرس على Endpoint
CREATE INDEX idx_rate_limiting_endpoint ON rate_limiting(endpoint);
-- فهرس على النافذة
CREATE INDEX idx_rate_limiting_window ON rate_limiting(window_start, window_end);

-- ----------------------------------------------------------------------------
-- Maintenance Records (سجلات الصيانة)
-- ----------------------------------------------------------------------------
CREATE TABLE maintenance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    mechanic_id UUID REFERENCES users(id) ON DELETE SET NULL,
    service_performed TEXT NOT NULL,
    notes TEXT,
    odometer_reading INTEGER,
    next_service_date TIMESTAMP WITH TIME ZONE,
    next_service_mileage INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- فهرس على المركبة
CREATE INDEX idx_maintenance_records_vehicle_id ON maintenance_records(vehicle_id);
-- فهرس على الحجز
CREATE INDEX idx_maintenance_records_booking_id ON maintenance_records(booking_id);
-- فهرس على الميكانيكي
CREATE INDEX idx_maintenance_records_mechanic_id ON maintenance_records(mechanic_id);
-- فهرس على تاريخ الصيانة القادم
CREATE INDEX idx_maintenance_records_next_service_date ON maintenance_records(next_service_date);

-- ============================================================================
-- Functions and Triggers
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Function: تحديث updated_at تلقائياً
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تطبيق الـ trigger على جميع الجداول التي تحتوي على updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_garages_updated_at BEFORE UPDATE ON garages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON service_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mechanic_specializations_updated_at BEFORE UPDATE ON mechanic_specializations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mechanic_work_sessions_updated_at BEFORE UPDATE ON mechanic_work_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parts_inventory_updated_at BEFORE UPDATE ON parts_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parts_requests_updated_at BEFORE UPDATE ON parts_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_additional_services_updated_at BEFORE UPDATE ON additional_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_options_updated_at BEFORE UPDATE ON service_options
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_queue_updated_at BEFORE UPDATE ON notifications_queue
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON notification_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discounts_updated_at BEFORE UPDATE ON discounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tax_rates_updated_at BEFORE UPDATE ON tax_rates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cancellation_policies_updated_at BEFORE UPDATE ON cancellation_policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_limits_updated_at BEFORE UPDATE ON payment_limits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- Function: إنشاء رقم فاتورة فريد
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS VARCHAR AS $$
DECLARE
    year_part VARCHAR(4);
    sequence_num VARCHAR(6);
    invoice_number VARCHAR(50);
BEGIN
    year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    -- الحصول على الرقم التسلسلي التالي
    SELECT LPAD((COUNT(*) + 1)::TEXT, 6, '0') INTO sequence_num
    FROM invoices
    WHERE invoice_number LIKE 'INV-' || year_part || '%';
    
    invoice_number := 'INV-' || year_part || '-' || sequence_num;
    RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- Function: إنشاء QR Token فريد
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_qr_token()
RETURNS VARCHAR AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- Trigger: إنشاء رقم الفاتورة تلقائياً
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
        NEW.invoice_number := generate_invoice_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoice_number_trigger
    BEFORE INSERT ON invoices
    FOR EACH ROW EXECUTE FUNCTION set_invoice_number();

-- ----------------------------------------------------------------------------
-- Trigger: إنشاء QR Token تلقائياً
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_qr_token()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.qr_token IS NULL OR NEW.qr_token = '' THEN
        NEW.qr_token := generate_qr_token();
    END IF
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_qr_token_trigger
    BEFORE INSERT ON bookings
    FOR EACH ROW EXECUTE FUNCTION set_qr_token();

-- ----------------------------------------------------------------------------
-- Function: تسجيل Audit Trail تلقائياً
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION audit_trail_func()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_trail (
            user_id, table_name, record_id, action, new_values, changed_at
        ) VALUES (
            COALESCE(NEW.created_by, CURRENT_USER),
            TG_TABLE_NAME,
            NEW.id,
            'INSERT',
            to_jsonb(NEW),
            CURRENT_TIMESTAMP
        );
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_trail (
            user_id, table_name, record_id, action, old_values, new_values, changed_at
        ) VALUES (
            COALESCE(NEW.updated_by, CURRENT_USER),
            TG_TABLE_NAME,
            NEW.id,
            'UPDATE',
            to_jsonb(OLD),
            to_jsonb(NEW),
            CURRENT_TIMESTAMP
        );
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_trail (
            user_id, table_name, record_id, action, old_values, changed_at
        ) VALUES (
            COALESCE(OLD.deleted_by, CURRENT_USER),
            TG_TABLE_NAME,
            OLD.id,
            'DELETE',
            to_jsonb(OLD),
            CURRENT_TIMESTAMP
        );
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- تطبيق Audit Trigger على الجداول المهمة
CREATE TRIGGER audit_bookings
    AFTER INSERT OR UPDATE OR DELETE ON bookings
    FOR EACH ROW EXECUTE FUNCTION audit_trail_func();

CREATE TRIGGER audit_invoices
    AFTER INSERT OR UPDATE OR DELETE ON invoices
    FOR EACH ROW EXECUTE FUNCTION audit_trail_func();

CREATE TRIGGER audit_payments
    AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW EXECUTE FUNCTION audit_trail_func();

CREATE TRIGGER audit_parts_inventory
    AFTER INSERT OR UPDATE OR DELETE ON parts_inventory
    FOR EACH ROW EXECUTE FUNCTION audit_trail_func();

-- ----------------------------------------------------------------------------
-- Function: تحديث إحصائيات الكراج
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_garage_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE garages
        SET total_bookings = total_bookings + 1
        WHERE id = NEW.garage_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE garages
        SET total_bookings = GREATEST(total_bookings - 1, 0)
        WHERE id = OLD.garage_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Views (المشاهدات)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- View: ملخص الحجوزات النشطة
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW active_bookings_summary AS
SELECT 
    b.id,
    b.customer_id,
    c.full_name AS customer_name,
    b.garage_id,
    g.name AS garage_name,
    b.vehicle_id,
    v.plate AS vehicle_plate,
    v.make AS vehicle_make,
    v.model AS vehicle_model,
    b.service_id,
    s.name AS service_name,
    b.assigned_mechanic_id,
    u.full_name AS mechanic_name,
    b.scheduled_at,
    b.status,
    b.estimated_completion_at,
    b.delay_reason,
    COUNT(bsh.id) AS status_changes
FROM bookings b
JOIN customers c ON b.customer_id = c.id
JOIN garages g ON b.garage_id = g.id
JOIN vehicles v ON b.vehicle_id = v.id
LEFT JOIN services s ON b.service_id = s.id
LEFT JOIN users u ON b.assigned_mechanic_id = u.id
LEFT JOIN booking_status_history bsh ON b.id = bsh.booking_id
WHERE b.deleted_at IS NULL
    AND b.status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'WAITING_PARTS')
GROUP BY b.id, c.full_name, g.name, v.plate, v.make, v.model, 
         s.name, u.full_name, b.scheduled_at, b.status, 
         b.estimated_completion_at, b.delay_reason;

-- ----------------------------------------------------------------------------
-- View: ملخص الفواتير المتأخرة
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW overdue_invoices_summary AS
SELECT 
    i.id,
    i.invoice_number,
    i.customer_id,
    c.full_name AS customer_name,
    c.phone AS customer_phone,
    i.garage_id,
    g.name AS garage_name,
    i.total_amount,
    i.due_date,
    i.last_notification_sent_at,
    EXTRACT(DAY FROM CURRENT_DATE - i.due_date) AS days_overdue,
    COALESCE(SUM(p.amount), 0) AS amount_paid,
    i.total_amount - COALESCE(SUM(p.amount), 0) AS amount_remaining
FROM invoices i
JOIN customers c ON i.customer_id = c.id
JOIN garages g ON i.garage_id = g.id
LEFT JOIN payments p ON i.id = p.invoice_id AND p.status = 'COMPLETED'
WHERE i.status = 'SENT'
    AND i.due_date < CURRENT_DATE
    AND i.deleted_at IS NULL
GROUP BY i.id, i.invoice_number, i.customer_id, c.full_name, c.phone, 
         i.garage_id, g.name, i.total_amount, i.due_date, i.last_notification_sent_at
ORDER BY days_overdue DESC;

-- ----------------------------------------------------------------------------
-- View: أداء الميكانيكيين
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW mechanic_performance_view AS
SELECT 
    u.id AS mechanic_id,
    u.full_name AS mechanic_name,
    g.id AS garage_id,
    g.name AS garage_name,
    COUNT(DISTINCT b.id) AS total_bookings,
    COUNT(DISTINCT CASE WHEN b.status = 'COMPLETED' THEN b.id END) AS completed_bookings,
    AVG(EXTRACT(EPOCH FROM (mws.end_time - mws.start_time))/60) AS avg_session_duration_minutes,
    AVG(mr.rating) AS avg_rating,
    COUNT(mr.id) AS total_ratings,
    SUM(CASE WHEN b.status = 'COMPLETED' THEN b.actual_duration_minutes ELSE 0 END) AS total_work_minutes,
    COUNT(DISTINCT CASE WHEN b.status = 'COMPLETED' AND b.actual_completion_at <= b.estimated_completion_at THEN b.id END) AS on_time_completions
FROM users u
JOIN garages g ON u.garage_id = g.id
LEFT JOIN bookings b ON b.assigned_mechanic_id = u.id
LEFT JOIN mechanic_work_sessions mws ON b.id = mws.booking_id
LEFT JOIN mechanic_ratings mr ON u.id = mr.mechanic_id
WHERE u.role = 'MECHANIC'
    AND u.deleted_at IS NULL
GROUP BY u.id, u.full_name, g.id, g.name;

-- ----------------------------------------------------------------------------
-- View: مخزون منخفض
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW low_stock_alerts AS
SELECT 
    pi.id,
    pi.garage_id,
    g.name AS garage_name,
    pi.part_number,
    pi.name AS part_name,
    pi.quantity AS current_quantity,
    pi.min_stock_level,
    pi.max_stock_level,
    pi.quantity - pi.min_stock_level AS quantity_below_min,
    pi.lead_time_days,
    pi.supplier,
    pi.supplier_phone,
    COUNT(pr.id) AS pending_requests
FROM parts_inventory pi
JOIN garages g ON pi.garage_id = g.id
LEFT JOIN parts_requests pr ON pi.id = pr.part_id AND pr.status IN ('PENDING', 'APPROVED', 'ORDERED')
WHERE pi.quantity <= pi.min_stock_level
    AND pi.is_active = true
    AND pi.deleted_at IS NULL
GROUP BY pi.id, pi.garage_id, g.name, pi.part_number, pi.name, 
         pi.quantity, pi.min_stock_level, pi.max_stock_level, 
         pi.lead_time_days, pi.supplier, pi.supplier_phone
ORDER BY (pi.quantity - pi.min_stock_level) ASC;

-- ----------------------------------------------------------------------------
-- View: إحصائيات الإيرادات اليومية
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW daily_revenue_summary AS
SELECT 
    DATE(p.payment_date) AS payment_date,
    p.garage_id,
    g.name AS garage_name,
    COUNT(DISTINCT p.id) AS payment_count,
    COUNT(DISTINCT p.customer_id) AS customer_count,
    SUM(p.amount) AS total_revenue,
    SUM(CASE WHEN p.payment_method = 'CASH' THEN p.amount ELSE 0 END) AS cash_revenue,
    SUM(CASE WHEN p.payment_method = 'CARD' THEN p.amount ELSE 0 END) AS card_revenue,
    SUM(CASE WHEN p.payment_method = 'BANK_TRANSFER' THEN p.amount ELSE 0 END) AS bank_transfer_revenue
FROM payments p
JOIN garages g ON p.garage_id = g.id
WHERE p.status = 'COMPLETED'
    AND p.payment_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(p.payment_date), p.garage_id, g.name
ORDER BY payment_date DESC, total_revenue DESC;

-- ----------------------------------------------------------------------------
-- View: الخدمات الإضافية المعلقة
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW pending_additional_services AS
SELECT 
    a_s.id,
    a_s.booking_id,
    b.scheduled_at,
    c.full_name AS customer_name,
    c.phone AS customer_phone,
    a_s.service_name,
    a_s.price,
    a_s.approval_deadline,
    EXTRACT(EPOCH FROM (a_s.approval_deadline - CURRENT_TIMESTAMP))/3600 AS hours_until_deadline,
    a_s.images,
    a_s.video_url,
    COUNT(so.id) AS available_options
FROM additional_services a_s
JOIN bookings b ON a_s.booking_id = b.id
JOIN customers c ON b.customer_id = c.id
LEFT JOIN service_options so ON a_s.id = so.additional_service_id
WHERE a_s.status = 'PENDING'
    AND a_s.approval_deadline > CURRENT_TIMESTAMP
GROUP BY a_s.id, a_s.booking_id, b.scheduled_at, c.full_name, c.phone, 
         a_s.service_name, a_s.price, a_s.approval_deadline, a_s.images, a_s.video_url
ORDER BY a_s.approval_deadline ASC;

-- ============================================================================
-- Stored Procedures
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Procedure: إنشاء حجز جديد
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE create_booking(
    p_customer_id UUID,
    p_garage_id UUID,
    p_vehicle_id UUID,
    p_service_id UUID,
    p_scheduled_at TIMESTAMP WITH TIME ZONE,
    p_notes TEXT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_booking_id UUID;
BEGIN
    -- إنشاء الحجز
    INSERT INTO bookings (
        customer_id, garage_id, vehicle_id, service_id, 
        scheduled_at, notes, qr_token, qr_expires_at
    ) VALUES (
        p_customer_id, p_garage_id, p_vehicle_id, p_service_id,
        p_scheduled_at, p_notes, generate_qr_token(), p_scheduled_at + INTERVAL '24 hours'
    )
    RETURNING id INTO v_booking_id;
    
    -- تسجيل الحالة الأولية
    INSERT INTO booking_status_history (
        booking_id, status, changed_by, notes
    ) VALUES (
        v_booking_id, 'PENDING', p_customer_id, 'Booking created'
    );
    
    COMMIT;
END;
$$;

-- ----------------------------------------------------------------------------
-- Procedure: تحديث حالة الحجز
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE update_booking_status(
    p_booking_id UUID,
    p_new_status booking_status,
    p_changed_by UUID,
    p_notes TEXT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_old_status booking_status;
BEGIN
    -- الحصول على الحالة الحالية
    SELECT status INTO v_old_status
    FROM bookings
    WHERE id = p_booking_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking not found';
    END IF;
    
    -- تحديث الحالة
    UPDATE bookings
    SET status = p_new_status
    WHERE id = p_booking_id;
    
    -- تسجيل التغيير في السجل
    INSERT INTO booking_status_history (
        booking_id, status, old_status, new_status, changed_by, notes
    ) VALUES (
        p_booking_id, p_new_status, v_old_status, p_new_status, p_changed_by, p_notes
    );
    
    COMMIT;
END;
$$;

-- ----------------------------------------------------------------------------
-- Procedure: إضافة دفعة للفاتورة
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE add_invoice_payment(
    p_invoice_id UUID,
    p_customer_id UUID,
    p_amount DECIMAL(15, 2),
    p_payment_method payment_method,
    p_processed_by UUID,
    p_notes TEXT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_invoice_total DECIMAL(15, 2);
    v_total_paid DECIMAL(15, 2);
    v_payment_id UUID;
BEGIN
    -- الحصول على إجمالي الفاتورة
    SELECT total_amount INTO v_invoice_total
    FROM invoices
    WHERE id = p_invoice_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invoice not found';
    END IF;
    
    -- الحصول على إجمالي المدفوعات
    SELECT COALESCE(SUM(amount), 0) INTO v_total_paid
    FROM payments
    WHERE invoice_id = p_invoice_id AND status = 'COMPLETED';
    
    -- التحقق من أن المبلغ لا يتجاوز المتبقي
    IF v_total_paid + p_amount > v_invoice_total THEN
        RAISE EXCEPTION 'Payment amount exceeds remaining balance';
    END IF;
    
    -- إنشاء الدفعة
    INSERT INTO payments (
        invoice_id, customer_id, amount, payment_method, 
        processed_by, notes, status
    ) VALUES (
        p_invoice_id, p_customer_id, p_amount, p_payment_method,
        p_processed_by, p_notes, 'COMPLETED'
    )
    RETURNING id INTO v_payment_id;
    
    -- تسجيل في سجل المدفوعات
    INSERT INTO payment_history (
        payment_id, status, changed_by, notes
    ) VALUES (
        v_payment_id, 'COMPLETED', p_processed_by, 'Payment created and completed'
    );
    
    -- تحديث حالة الفاتورة إذا تم الدفع بالكامل
    IF v_total_paid + p_amount >= v_invoice_total THEN
        UPDATE invoices
        SET status = 'PAID',
            paid_date = CURRENT_TIMESTAMP
        WHERE id = p_invoice_id;
    ELSIF v_total_paid + p_amount > 0 THEN
        UPDATE invoices
        SET status = 'SENT'
        WHERE id = p_invoice_id;
    END IF;
    
    COMMIT;
END;
$$;

-- ----------------------------------------------------------------------------
-- Procedure: تحديث مخزون القطع
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE update_stock(
    p_part_id UUID,
    p_movement_type stock_movement_type,
    p_quantity DECIMAL(10, 2),
    p_reference_type VARCHAR(50) DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL,
    p_performed_by UUID DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_quantity DECIMAL(10, 2);
    v_new_quantity DECIMAL(10, 2);
BEGIN
    -- الحصول على الكمية الحالية
    SELECT quantity INTO v_current_quantity
    FROM parts_inventory
    WHERE id = p_part_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Part not found';
    END IF;
    
    -- حساب الكمية الجديدة
    IF p_movement_type = 'IN' THEN
        v_new_quantity := v_current_quantity + p_quantity;
    ELSIF p_movement_type = 'OUT' THEN
        v_new_quantity := v_current_quantity - p_quantity;
    ELSE
        v_new_quantity := p_quantity;
    END IF;
    
    -- التحقق من الكمية السالبة
    IF v_new_quantity < 0 THEN
        RAISE EXCEPTION 'Insufficient stock';
    END IF;
    
    -- تحديث المخزون
    UPDATE parts_inventory
    SET quantity = v_new_quantity
    WHERE id = p_part_id;
    
    -- تسجيل الحركة
    INSERT INTO stock_movement_history (
        part_id, movement_type, quantity, quantity_before, quantity_after,
        reference_type, reference_id, performed_by, notes
    ) VALUES (
        p_part_id, p_movement_type, p_quantity, v_current_quantity, v_new_quantity,
        p_reference_type, p_reference_id, p_performed_by, p_notes
    );
    
    -- التحقق من المخزون المنخفض وإرسال إشعار
    IF v_new_quantity <= (SELECT min_stock_level FROM parts_inventory WHERE id = p_part_id) THEN
        -- إنشاء إشعار منخفض المخزون
        INSERT INTO notifications_queue (
            recipient_id, type, title, message, channel, priority
        ) VALUES (
            (SELECT owner_id FROM garages WHERE id = (SELECT garage_id FROM parts_inventory WHERE id = p_part_id)),
            'PARTS_REQUESTED',
            'Low Stock Alert',
            'Part ' || (SELECT name FROM parts_inventory WHERE id = p_part_id) || ' is below minimum stock level',
            'IN_APP',
            'HIGH'
        );
    END IF;
    
    COMMIT;
END;
$$;

-- ============================================================================
-- إكمال مخطط قاعدة البيانات
-- ============================================================================
