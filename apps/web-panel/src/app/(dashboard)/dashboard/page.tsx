'use client';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">لوحة التحكم</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">الحجوزات اليوم</h2>
            <p className="text-3xl font-bold text-blue-600">24</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">السيارات قيد الصيانة</h2>
            <p className="text-3xl font-bold text-green-600">8</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">الفواتير المعلقة</h2>
            <p className="text-3xl font-bold text-yellow-600">12</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">الإيرادات اليوم</h2>
            <p className="text-3xl font-bold text-purple-600">5,420 ر.س</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">الحجوزات الأخيرة</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">محمد أحمد - Toyota Camry</p>
                  <p className="text-sm text-gray-600">تغيير الزيت</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">قيد التنفيذ</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">عبدالله محمد - Honda Civic</p>
                  <p className="text-sm text-gray-600">فحص شامل</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">جديد</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">سعيد علي - Nissan Sunny</p>
                  <p className="text-sm text-gray-600">تغيير الفرامل</p>
                </div>
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">مكتمل</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">الميكانيكيون المتاحون</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">أحمد محمد</p>
                  <p className="text-sm text-gray-600">ميكانيكي سيارات</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">متاح</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">خالد عبدالله</p>
                  <p className="text-sm text-gray-600">فحص كهرباء</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">متاح</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">عمر سعيد</p>
                  <p className="text-sm text-gray-600">صيانة عامة</p>
                </div>
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">مشغول</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
