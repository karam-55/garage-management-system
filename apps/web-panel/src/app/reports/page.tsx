'use client';

import { useState } from 'react';
import { 
  BarChart3, 
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Car,
  Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import AppLayout from '@/components/layouts/AppLayout';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('revenue');
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const reportTypes = [
    { id: 'revenue', label: 'تقرير الإيرادات', icon: DollarSign },
    { id: 'performance', label: 'تقرير الأداء', icon: TrendingUp },
    { id: 'inventory', label: 'تقرير المخزون', icon: Car },
    { id: 'customers', label: 'تقرير العملاء', icon: Users },
  ];

  const periods = [
    { id: 'week', label: 'هذا الأسبوع' },
    { id: 'month', label: 'هذا الشهر' },
    { id: 'quarter', label: 'هذا الربع' },
    { id: 'year', label: 'هذا العام' },
    { id: 'custom', label: 'فترة مخصصة' },
  ];

  const generateReport = async () => {
    setLoading(true);
    try {
      const { default: apiClient } = await import('@/lib/api-client');
      const response = await apiClient.get(`/reports/${reportType}`, { params: { period } });
      setReportData(response.data);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!reportData) return;
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${reportType}-${period}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">التقارير</h1>
            <p className="text-gray-600">إنشاء وعرض التقارير المختلفة</p>
          </div>
          <Button onClick={handleDownload} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            تحميل التقرير
          </Button>
        </div>

        {/* Report Type Selection */}
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">نوع التقرير</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {reportTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setReportType(type.id)}
                    className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                      reportType === type.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mb-2 ${reportType === type.id ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${reportType === type.id ? 'text-blue-600' : 'text-gray-600'}`}>
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">الفترة الزمنية</h3>
            <div className="flex flex-wrap gap-2">
              {periods.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`px-4 py-2 rounded-xl border-2 transition-all ${
                    period === p.id
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={generateReport} disabled={loading} className="w-full flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
              إنشاء التقرير
            </Button>
          </div>
        </Card>

        {/* Report Results */}
        {reportData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">إجمالي الإيرادات</p>
                    <p className="text-3xl font-bold">{reportData.totalRevenue.toLocaleString('ar-SA')} ر.س</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-white/20" />
                </div>
              </Card>
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">إجمالي الحجوزات</p>
                    <p className="text-3xl font-bold">{reportData.totalBookings}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-white/20" />
                </div>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">الحجوزات المكتملة</p>
                    <p className="text-3xl font-bold">{reportData.completedBookings}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-white/20" />
                </div>
              </Card>
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">متوسط التقييم</p>
                    <p className="text-3xl font-bold">{reportData.averageRating} ⭐</p>
                  </div>
                  <Users className="w-8 h-8 text-white/20" />
                </div>
              </Card>
            </div>

            <Card title="أكثر الخدمات طلباً">
              <div className="space-y-4">
                {reportData.topServices.map((service: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{service.name}</p>
                        <p className="text-sm text-gray-600">{service.count} حجز</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg text-green-600">{service.revenue.toLocaleString('ar-SA')} ر.س</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}
