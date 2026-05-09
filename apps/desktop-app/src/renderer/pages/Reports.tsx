import React, { useState } from 'react';
import AppLayout from '../components/layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState('');
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    if (!reportType) return;
    setLoading(true);
    try {
      // Generate report logic
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout currentPage="reports">
      <Card title="التقارير">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="نوع التقرير"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              options={[
                { value: '', label: 'اختر نوع التقرير' },
                { value: 'revenue', label: 'تقرير الإيرادات' },
                { value: 'bookings', label: 'تقرير الحجوزات' },
                { value: 'inventory', label: 'تقرير المخزون' },
                { value: 'customers', label: 'تقرير العملاء' },
                { value: 'services', label: 'تقرير الخدمات' },
              ]}
            />
            <Select
              label="الفترة الزمنية"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              options={[
                { value: 'day', label: 'يوم' },
                { value: 'week', label: 'أسبوع' },
                { value: 'month', label: 'شهر' },
                { value: 'quarter', label: 'ربع سنة' },
                { value: 'year', label: 'سنة' },
              ]}
            />
          </div>

          <Button onClick={handleGenerateReport} loading={loading} disabled={!reportType} className="w-full">
            إنشاء التقرير
          </Button>

          {reportType && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <p className="text-blue-100 text-sm">إجمالي الإيرادات</p>
                  <p className="text-3xl font-bold mt-2">15,400 ر.س</p>
                </Card>
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <p className="text-green-100 text-sm">عدد الحجوزات</p>
                  <p className="text-3xl font-bold mt-2">45</p>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <p className="text-purple-100 text-sm">الخدمات الأكثر طلباً</p>
                  <p className="text-3xl font-bold mt-2">تغيير الزيت</p>
                </Card>
              </div>

              <Card title="الخدمات الأكثر طلباً">
                <div className="space-y-4">
                  {[
                    { name: 'تغيير الزيت', count: 25, revenue: 2500 },
                    { name: 'صيانة دورية', count: 18, revenue: 3600 },
                    { name: 'إصلاح فرامل', count: 12, revenue: 1800 },
                    { name: 'تغيير فلتر', count: 8, revenue: 400 },
                  ].map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-semibold text-gray-900">{service.name}</p>
                        <p className="text-sm text-gray-600">{service.count} خدمة</p>
                      </div>
                      <p className="font-bold text-gray-900">{service.revenue.toLocaleString('ar-SA')} ر.س</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Button variant="outline" className="w-full">
                📥 تحميل التقرير
              </Button>
            </div>
          )}
        </div>
      </Card>
    </AppLayout>
  );
};

export default Reports;
