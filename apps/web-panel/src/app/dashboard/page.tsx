'use client';

import { useEffect, useState } from 'react';
import { 
  Calendar, 
  Car, 
  DollarSign, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  Package,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    todayBookings: 0,
    inProgressBookings: 0,
    completedBookings: 0,
    pendingApprovals: 0,
    overdueInvoices: 0,
    lowStockItems: 0,
    dailyRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch dashboard stats from backend
      // const response = await apiClient.get('/dashboard/stats');
      // setStats(response.data);
      
      // Mock data for now
      setStats({
        totalBookings: 156,
        todayBookings: 12,
        inProgressBookings: 8,
        completedBookings: 136,
        pendingApprovals: 3,
        overdueInvoices: 5,
        lowStockItems: 4,
        dailyRevenue: 4500,
        weeklyRevenue: 28500,
        monthlyRevenue: 125000,
      });

      setRecentBookings([
        { id: 1, customer: 'أحمد محمد', vehicle: 'Toyota Camry 2022', status: 'IN_PROGRESS', time: '10:30' },
        { id: 2, customer: 'خالد علي', vehicle: 'Honda Accord 2021', status: 'PENDING', time: '11:00' },
        { id: 3, customer: 'سعيد أحمد', vehicle: 'BMW X5 2023', status: 'COMPLETED', time: '09:15' },
      ]);

      setAlerts([
        { id: 1, type: 'low_stock', message: 'نفاد زيت المحرك Toyota', severity: 'high' },
        { id: 2, type: 'overdue', message: 'فاتورة متأخرة للزبون محمد علي', severity: 'medium' },
        { id: 3, type: 'approval', message: 'موافقة مطلوبة على خدمة إضافية', severity: 'low' },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
      COMPLETED: 'bg-green-100 text-green-800 border-green-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      PENDING: 'قيد الانتظار',
      IN_PROGRESS: 'جاري العمل',
      COMPLETED: 'مكتمل',
      CANCELLED: 'ملغي',
    };
    return texts[status] || status;
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-orange-100 text-orange-800 border-orange-200',
      low: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
          <p className="text-gray-600">نظرة عامة على أداء الكراج</p>
        </div>
        <Button onClick={fetchData} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          تحديث
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today's Bookings */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">حجوزات اليوم</p>
              <p className="text-3xl font-bold">{stats.todayBookings}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-blue-100">
            <TrendingUp className="w-4 h-4" />
            <span>+12% عن الأمس</span>
          </div>
        </Card>

        {/* In Progress */}
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">جاري العمل</p>
              <p className="text-3xl font-bold">{stats.inProgressBookings}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-purple-100">
            <Car className="w-4 h-4" />
            <span>سيارات في الكراج</span>
          </div>
        </Card>

        {/* Daily Revenue */}
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">إيراد اليوم</p>
              <p className="text-3xl font-bold">{stats.dailyRevenue.toLocaleString('ar-SA')}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-green-100">
            <TrendingUp className="w-4 h-4" />
            <span>+8% عن أمس</span>
          </div>
        </Card>

        {/* Total Customers */}
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">إجمالي الحجوزات</p>
              <p className="text-3xl font-bold">{stats.totalBookings}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-orange-100">
            <CheckCircle className="w-4 h-4" />
            <span>{stats.completedBookings} مكتملة</span>
          </div>
        </Card>
      </div>

      {/* Alerts Section */}
      {(stats.pendingApprovals > 0 || stats.overdueInvoices > 0 || stats.lowStockItems > 0) && (
        <Card title="تنبيهات هامة" className="border-red-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.pendingApprovals > 0 && (
              <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{stats.pendingApprovals} موافقة معلقة</p>
                  <p className="text-sm text-gray-600">بانتظار الموافقة</p>
                </div>
              </div>
            )}
            {stats.overdueInvoices > 0 && (
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{stats.overdueInvoices} فاتورة متأخرة</p>
                  <p className="text-sm text-gray-600">تحتاج متابعة</p>
                </div>
              </div>
            )}
            {stats.lowStockItems > 0 && (
              <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl border border-orange-200">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{stats.lowStockItems} قطع ناقصة</p>
                  <p className="text-sm text-gray-600">نفاد المخزون</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Recent Bookings & Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card title="آخر الحجوزات">
          <div className="space-y-3">
            {recentBookings.map((booking: any) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Car className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{booking.customer}</p>
                    <p className="text-sm text-gray-600">{booking.vehicle}</p>
                  </div>
                </div>
                <div className="text-left">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                    {getStatusText(booking.status)}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{booking.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Revenue Overview */}
        <Card title="نظرة عامة على الإيرادات">
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">إيراد اليوم</span>
                <span className="font-bold text-xl text-green-600">
                  {stats.dailyRevenue.toLocaleString('ar-SA')} SAR
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">إيراد الأسبوع</span>
                <span className="font-bold text-xl text-blue-600">
                  {stats.weeklyRevenue.toLocaleString('ar-SA')} SAR
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">إيراد الشهر</span>
                <span className="font-bold text-xl text-purple-600">
                  {stats.monthlyRevenue.toLocaleString('ar-SA')} SAR
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Alerts List */}
      {alerts.length > 0 && (
        <Card title="التنبيهات الحديثة">
          <div className="space-y-3">
            {alerts.map((alert: any) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-4 rounded-xl border ${
                  alert.severity === 'high' ? 'bg-red-50 border-red-200' :
                  alert.severity === 'medium' ? 'bg-orange-50 border-orange-200' :
                  'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  alert.severity === 'high' ? 'bg-red-100' :
                  alert.severity === 'medium' ? 'bg-orange-100' :
                  'bg-yellow-100'
                }`}>
                  <AlertTriangle className={`w-4 h-4 ${
                    alert.severity === 'high' ? 'text-red-600' :
                    alert.severity === 'medium' ? 'text-orange-600' :
                    'text-yellow-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{alert.message}</p>
                  <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                    {alert.severity === 'high' ? 'عالي' : alert.severity === 'medium' ? 'متوسط' : 'منخفض'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
