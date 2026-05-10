'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';

interface DashboardStats {
  totalBookings: number;
  inProgressBookings: number;
  pendingInvoices: number;
  todayRevenue: number;
}

interface RecentBooking {
  id: string;
  customer?: { fullName: string };
  vehicle?: { make: string; model: string };
  service?: { name: string };
  status: string;
}

const statusLabels: Record<string, { label: string; className: string }> = {
  IN_PROGRESS: { label: 'قيد التنفيذ', className: 'bg-green-100 text-green-800' },
  PENDING: { label: 'جديد', className: 'bg-blue-100 text-blue-800' },
  CONFIRMED: { label: 'مؤكد', className: 'bg-blue-100 text-blue-800' },
  COMPLETED: { label: 'مكتمل', className: 'bg-gray-100 text-gray-800' },
  CANCELLED: { label: 'ملغي', className: 'bg-red-100 text-red-800' },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    inProgressBookings: 0,
    pendingInvoices: 0,
    todayRevenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [bookingsRes, invoicesRes, reportsRes] = await Promise.allSettled([
          apiClient.get('/bookings?limit=5'),
          apiClient.get('/invoices?status=DRAFT,SENT'),
          apiClient.get('/reports/daily-revenue'),
        ]);

        if (bookingsRes.status === 'fulfilled') {
          const bookings: RecentBooking[] = bookingsRes.value.data?.data || bookingsRes.value.data || [];
          setRecentBookings(Array.isArray(bookings) ? bookings.slice(0, 5) : []);
          const inProgress = Array.isArray(bookings)
            ? bookings.filter((b) => b.status === 'IN_PROGRESS').length
            : 0;
          setStats((prev) => ({
            ...prev,
            totalBookings: Array.isArray(bookings) ? bookings.length : 0,
            inProgressBookings: inProgress,
          }));
        }

        if (invoicesRes.status === 'fulfilled') {
          const invoices = invoicesRes.value.data?.data || invoicesRes.value.data || [];
          setStats((prev) => ({
            ...prev,
            pendingInvoices: Array.isArray(invoices) ? invoices.length : 0,
          }));
        }

        if (reportsRes.status === 'fulfilled') {
          const revenue = reportsRes.value.data?.totalRevenue || 0;
          setStats((prev) => ({ ...prev, todayRevenue: revenue }));
        }
      } catch {
        // Stats remain at defaults on error
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">لوحة التحكم</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">الحجوزات</h2>
            <p className="text-3xl font-bold text-blue-600">
              {loading ? '...' : stats.totalBookings}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">السيارات قيد الصيانة</h2>
            <p className="text-3xl font-bold text-green-600">
              {loading ? '...' : stats.inProgressBookings}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">الفواتير المعلقة</h2>
            <p className="text-3xl font-bold text-yellow-600">
              {loading ? '...' : stats.pendingInvoices}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">إيرادات اليوم</h2>
            <p className="text-3xl font-bold text-purple-600">
              {loading ? '...' : `${stats.todayRevenue.toLocaleString('ar-SA')} ر.س`}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">الحجوزات الأخيرة</h2>
          {loading ? (
            <p className="text-gray-500">جاري التحميل...</p>
          ) : recentBookings.length === 0 ? (
            <p className="text-gray-500">لا توجد حجوزات</p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => {
                const statusInfo = statusLabels[booking.status] || {
                  label: booking.status,
                  className: 'bg-gray-100 text-gray-800',
                };
                return (
                  <div key={booking.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">
                        {booking.customer?.fullName || 'عميل'} -{' '}
                        {booking.vehicle ? `${booking.vehicle.make} ${booking.vehicle.model}` : 'سيارة'}
                      </p>
                      <p className="text-sm text-gray-600">{booking.service?.name || ''}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${statusInfo.className}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
