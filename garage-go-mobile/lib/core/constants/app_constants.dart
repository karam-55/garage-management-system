class AppConstants {
  // App Info
  static const String appName = 'Garage Go';
  static const String appVersion = '1.0.0';
  
  // API Configuration
  // API Configuration - للتطوير المحلي استخدم IP الجهاز
  // للإنتاج غيّر هذا إلى عنوان السيرفر الخاص بك
  static const String baseUrl = 'http://172.20.10.3:5000/api/v1';
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  static const Duration sendTimeout = Duration(seconds: 30);
  
  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userKey = 'user_data';
  static const String fcmTokenKey = 'fcm_token';
  static const String themeKey = 'theme_mode';
  static const String languageKey = 'language';
  
  // Pagination
  static const int defaultPageSize = 10;
  static const int maxPageSize = 100;
  
  // Validation
  static const int minPasswordLength = 6;
  static const int maxPasswordLength = 128;
  static const int maxNameLength = 100;
  static const int maxDescriptionLength = 500;
  static const int maxNoteLength = 1000;
  
  // File Upload
  static const int maxFileSize = 5 * 1024 * 1024; // 5MB
  static const List<String> supportedImageTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  
  // Date Formats
  static const String apiDateFormat = 'yyyy-MM-dd';
  static const String displayDateFormat = 'dd/MM/yyyy';
  static const String displayDateTimeFormat = 'dd/MM/yyyy HH:mm';
  static const String timeFormat = 'HH:mm';
  
  // Map Configuration
  static const double defaultLatitude = 24.7136; // Riyadh
  static const double defaultLongitude = 46.6753;
  static const double defaultZoom = 12.0;
  
  // Animation Durations
  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 300);
  static const Duration longAnimation = Duration(milliseconds: 500);
  
  // Cache Duration
  static const Duration cacheDuration = Duration(hours: 1);
  static const Duration longCacheDuration = Duration(days: 7);
  
  // Rate Limiting
  static const int maxLoginAttempts = 5;
  static const Duration lockoutDuration = Duration(minutes: 15);
  
  // Notification Settings
  static const String notificationChannelId = 'garage_go_notifications';
  static const String notificationChannelName = 'Garage Go Notifications';
  static const String notificationChannelDescription = 'Notifications for bookings and updates';
}

class ApiEndpoints {
  // Auth
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String refreshToken = '/auth/refresh';
  static const String logout = '/auth/logout';
  static const String profile = '/auth/me';
  static const String changePassword = '/auth/change-password';
  
  // Users
  static const String users = '/users';
  static const String userVehicles = '/vehicles';
  static const String userBookings = '/bookings/my-bookings';
  static const String userInvoices = '/invoices';
  static const String userNotifications = '/notifications';
  
  // Garages
  static const String garages = '/garages';
  static const String garageServices = '/services';
  static const String garageMechanics = '/mechanics';
  static const String garageBookings = '/bookings';
  static const String garageInventory = '/inventory';
  static const String garageInvoices = '/invoices';
  static const String garageReports = '/reports';
  
  // Vehicles
  static const String vehicles = '/vehicles';
  static const String vehicleBookings = '/bookings';
  static const String vehicleMaintenance = '/maintenance';
  static const String vehicleServiceHistory = '/service-history';
  
  // Services
  static const String services = '/services';
  
  // Bookings
  static const String bookings = '/bookings';
  
  // Inventory
  static const String inventory = '/inventory';
  
  // Maintenance
  static const String maintenance = '/maintenance';
  
  // Notifications
  static const String notifications = '/notifications';
  
  // Reports
  static const String reports = '/reports';
  
  // Health
  static const String health = '/health';
}

class AppStrings {
  // General
  static const String ok = 'موافق';
  static const String cancel = 'إلغاء';
  static const String confirm = 'تأكيد';
  static const String save = 'حفظ';
  static const String delete = 'حذف';
  static const String edit = 'تعديل';
  static const String add = 'إضافة';
  static const String search = 'بحث';
  static const String loading = 'جاري التحميل...';
  static const String error = 'خطأ';
  static const String success = 'نجاح';
  static const String warning = 'تنبيه';
  static const String info = 'معلومات';
  static const String retry = 'إعادة المحاولة';
  static const String close = 'إغلاق';
  
  // Auth
  static const String login = 'تسجيل الدخول';
  static const String register = 'تسجيل حساب جديد';
  static const String logout = 'تسجيل الخروج';
  static const String email = 'البريد الإلكتروني';
  static const String password = 'كلمة المرور';
  static const String confirmPassword = 'تأكيد كلمة المرور';
  static const String fullName = 'الاسم الكامل';
  static const String phone = 'رقم الهاتف';
  static const String forgotPassword = 'هل نسيت كلمة المرور؟';
  static const String dontHaveAccount = 'ليس لديك حساب؟';
  static const String alreadyHaveAccount = 'لديك حساب مسبقاً؟';
  static const String signUp = 'إنشاء حساب';
  static const String signIn = 'دخول';
  
  // Home
  static const String home = 'الرئيسية';
  static const String garages = 'الورش';
  static const String bookings = 'الحجوزات';
  static const String vehicles = 'السيارات';
  static const String profile = 'الملف الشخصي';
  static const String settings = 'الإعدادات';
  
  // Garages
  static const String nearbyGarages = 'الورش القريبة';
  static const String allGarages = 'كل الورش';
  static const String garageName = 'اسم الورشة';
  static const String address = 'العنوان';
  static const String rating = 'التقييم';
  static const String openNow = 'مفتوح الآن';
  static const String closed = 'مغلق';
  
  // Bookings
  static const String myBookings = 'حجوزاتي';
  static const String newBooking = 'حجز جديد';
  static const String bookingDetails = 'تفاصيل الحجز';
  static const String scheduledAt = 'موعد الحجز';
  static const String status = 'الحالة';
  static const String price = 'السعر';
  static const String notes = 'ملاحظات';
  
  // Vehicles
  static const String myVehicles = 'سياراتي';
  static const String addVehicle = 'إضافة سيارة';
  static const String vehicleDetails = 'تفاصيل السيارة';
  static const String make = 'الشركة';
  static const String model = 'الموديل';
  static const String year = 'سنة الصنع';
  static const String plate = 'رقم اللوحة';
  static const String vin = 'رقم الهيكل';
  static const String color = 'اللون';
  static const String mileage = 'الممشى';
  
  // Notifications
  static const String notifications = 'الإشعارات';
  static const String markAsRead = 'تعليم كمقروء';
  static const String markAllAsRead = 'تعليم الكل كمقروء';
  static const String noNotifications = 'لا توجد إشعارات';
  
  // Validation Messages
  static const String emailRequired = 'البريد الإلكتروني مطلوب';
  static const String invalidEmail = 'يرجى إدخال بريد إلكتروني صحيح';
  static const String passwordRequired = 'كلمة المرور مطلوبة';
  static const String passwordTooShort = 'كلمة المرور يجب أن تكون ${AppConstants.minPasswordLength} أحرف على الأقل';
  static const String passwordsDoNotMatch = 'كلمتا المرور غير متطابقتين';
  static const String nameRequired = 'الاسم مطلوب';
  static const String phoneRequired = 'رقم الهاتف مطلوب';
  static const String invalidPhone = 'يرجى إدخال رقم هاتف صحيح';
  
  // Error Messages
  static const String somethingWentWrong = 'حدث خطأ غير متوقع';
  static const String networkError = 'خطأ في الشبكة. يرجى التحقق من الاتصال.';
  static const String serverError = 'خطأ في الخادم. يرجى المحاولة لاحقاً.';
  static const String unauthorized = 'انتهت الجلسة. يرجى تسجيل الدخول مجدداً.';
  static const String notFound = 'غير موجود';
  static const String forbidden = 'ليس لديك صلاحية للوصول';
}
