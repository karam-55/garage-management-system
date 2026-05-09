import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayBookings: 0,
    activeVehicles: 0,
    totalRevenue: 0,
    completedBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Mock data for now
      setStats({
        todayBookings: 12,
        activeVehicles: 8,
        totalRevenue: 15400,
        completedBookings: 45,
      });
      setRecentBookings([
        { id: '1', customer: 'أحمد محمد', vehicle: 'Toyota Camry', status: 'IN_PROGRESS', time: '10:30' },
        { id: '2', customer: 'خالد علي', vehicle: 'Honda Accord', status: 'PENDING', time: '09:15' },
        { id: '3', customer: 'سعيد أحمد', vehicle: 'BMW X5', status: 'COMPLETED', time: '08:45' },
      ]);
      setAlerts([
        { id: '1', type: 'warning', message: 'قطعة "فرامل Toyota" منخفضة المخزون (5 قطع)' },
        { id: '2', type: 'error', message: 'فاتورة INV-2024-003 متأخرة الدفع' },
        { id: '3', type: 'info', message: 'فني جديد "محمد علي" انضم للفريق' },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      IN_PROGRESS: 'قيد التنفيذ',
      PENDING: 'قيد الانتظار',
      COMPLETED: 'مكتمل',
      CANCELLED: 'ملغي',
    };
    return texts[status] || status;
  };

  const getAlertIcon = (type: string) => {
    const icons: Record<string, string> = {
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️',
      success: '✅',
    };
    return icons[type] || 'ℹ️';
  };

  const getAlertColor = (type: string) => {
    const colors: Record<string, string> = {
      warning: 'border-yellow-400 bg-yellow-50',
      error: 'border-red-400 bg-red-50',
      info: 'border-blue-400 bg-blue-50',
      success: 'border-green-400 bg-green-50',
    };
    return colors[type] || 'border-gray-400 bg-gray-50';
  };

  return (
    <AppLayout currentPage="dashboard">
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">حجوزات اليوم</p>
                  <p className="text-4xl font-bold mt-2">{stats.todayBookings}</p>
                </div>
                <span className="text-5xl">📅</span>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">السيارات الموجودة</p>
                  <p className="text-4xl font-bold mt-2">{stats.activeVehicles}</p>
                </div>
                <span className="text-5xl">🚗</span>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">إجمالي الإيرادات</p>
                  <p className="text-4xl font-bold mt-2">{stats.totalRevenue.toLocaleString('ar-SA')} ر.س</p>
                </div>
                <span className="text-5xl">💰</span>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">الحجوزات المكتملة</p>
                  <p className="text-4xl font-bold mt-2">{stats.completedBookings}</p>
                </div>
                <span className="text-5xl">✅</span>
              </div>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="الحجوزات حسب الحالة">
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl">
                <p className="text-gray-500">Chart Placeholder - Bookings by Status</p>
              </div>
            </Card>

            <Card title="الإيرادات الشهرية">
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl">
                <p className="text-gray-500">Chart Placeholder - Monthly Revenue</p>
              </div>
            </Card>
          </div>

          {/* Recent Bookings & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="الحجوزات الأخيرة" actions={<Button variant="outline" size="sm">عرض الكل</Button>}>
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                        🚗
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{booking.customer}</p>
                        <p className="text-sm text-gray-600">{booking.vehicle}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{booking.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="التنبيهات" actions={<Button variant="outline" size="sm">عرض الكل</Button>}>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`flex items-start gap-3 p-4 rounded-xl border-l-4 ${getAlertColor(alert.type)}`}>
                    <span className="text-2xl">{getAlertIcon(alert.type)}</span>
                    <p className="text-sm text-gray-700">{alert.message}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Dashboard;
