'use client';

import { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Percent, 
  FileText, 
  Tag, 
  Building2, 
  Save,
  Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import AppLayout from '@/components/layouts/AppLayout';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('tax');
  const [loading, setLoading] = useState(false);
  const [taxRates, setTaxRates] = useState([
    { id: '1', name: 'ضريبة القيمة المضافة', rate: 15, description: 'ضريبة القيمة المضافة القياسية' },
  ]);
  const [cancellationPolicies, setCancellationPolicies] = useState([
    { id: '1', name: 'سياسة الإلغاء القياسية', hoursBefore: 24, penaltyPercent: 10 },
  ]);
  const [discounts, setDiscounts] = useState([
    { id: '1', name: 'خصم العميل الجديد', type: 'PERCENTAGE', value: 10, description: 'خصم للعملاء الجدد' },
  ]);
  const [garageSettings, setGarageSettings] = useState({
    name: 'كراج المدينة',
    address: 'الرياض، حي الملز',
    phone: '0112345678',
    email: 'info@garage.com',
    workingHours: '8:00 ص - 10:00 م',
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save settings to backend
      // await apiClient.put('/settings', { taxRates, cancellationPolicies, discounts, garageSettings });
      alert('تم حفظ الإعدادات بنجاح');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'tax', label: 'الضرائب', icon: Percent },
    { id: 'cancellation', label: 'سياسات الإلغاء', icon: FileText },
    { id: 'discounts', label: 'الخصومات', icon: Tag },
    { id: 'garage', label: 'إعدادات الكراج', icon: Building2 },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>
            <p className="text-gray-600">إدارة إعدادات النظام</p>
          </div>
          <Button onClick={handleSave} disabled={loading} className="flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            حفظ التغييرات
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'tax' && (
          <Card title="إعدادات الضرائب">
            <div className="space-y-4">
              {taxRates.map((tax) => (
                <div key={tax.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">اسم الضريبة</label>
                      <input
                        type="text"
                        value={tax.name}
                        onChange={(e) => {
                          const updated = taxRates.map(t => t.id === tax.id ? { ...t, name: e.target.value } : t);
                          setTaxRates(updated);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">النسبة (%)</label>
                      <input
                        type="number"
                        value={tax.rate}
                        onChange={(e) => {
                          const updated = taxRates.map(t => t.id === tax.id ? { ...t, rate: Number(e.target.value) } : t);
                          setTaxRates(updated);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                      <input
                        type="text"
                        value={tax.description}
                        onChange={(e) => {
                          const updated = taxRates.map(t => t.id === tax.id ? { ...t, description: e.target.value } : t);
                          setTaxRates(updated);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                + إضافة ضريبة جديدة
              </Button>
            </div>
          </Card>
        )}

        {activeTab === 'cancellation' && (
          <Card title="سياسات الإلغاء">
            <div className="space-y-4">
              {cancellationPolicies.map((policy) => (
                <div key={policy.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">اسم السياسة</label>
                      <input
                        type="text"
                        value={policy.name}
                        onChange={(e) => {
                          const updated = cancellationPolicies.map(p => p.id === policy.id ? { ...p, name: e.target.value } : p);
                          setCancellationPolicies(updated);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الساعات قبل الإلغاء</label>
                      <input
                        type="number"
                        value={policy.hoursBefore}
                        onChange={(e) => {
                          const updated = cancellationPolicies.map(p => p.id === policy.id ? { ...p, hoursBefore: Number(e.target.value) } : p);
                          setCancellationPolicies(updated);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">نسبة العقوبة (%)</label>
                      <input
                        type="number"
                        value={policy.penaltyPercent}
                        onChange={(e) => {
                          const updated = cancellationPolicies.map(p => p.id === policy.id ? { ...p, penaltyPercent: Number(e.target.value) } : p);
                          setCancellationPolicies(updated);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                + إضافة سياسة جديدة
              </Button>
            </div>
          </Card>
        )}

        {activeTab === 'discounts' && (
          <Card title="الخصومات">
            <div className="space-y-4">
              {discounts.map((discount) => (
                <div key={discount.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">اسم الخصم</label>
                      <input
                        type="text"
                        value={discount.name}
                        onChange={(e) => {
                          const updated = discounts.map(d => d.id === discount.id ? { ...d, name: e.target.value } : d);
                          setDiscounts(updated);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">النوع</label>
                      <select
                        value={discount.type}
                        onChange={(e) => {
                          const updated = discounts.map(d => d.id === discount.id ? { ...d, type: e.target.value } : d);
                          setDiscounts(updated);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="PERCENTAGE">نسبة مئوية</option>
                        <option value="FIXED">مبلغ ثابت</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">القيمة</label>
                      <input
                        type="number"
                        value={discount.value}
                        onChange={(e) => {
                          const updated = discounts.map(d => d.id === discount.id ? { ...d, value: Number(e.target.value) } : d);
                          setDiscounts(updated);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                      <input
                        type="text"
                        value={discount.description}
                        onChange={(e) => {
                          const updated = discounts.map(d => d.id === discount.id ? { ...d, description: e.target.value } : d);
                          setDiscounts(updated);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                + إضافة خصم جديد
              </Button>
            </div>
          </Card>
        )}

        {activeTab === 'garage' && (
          <Card title="إعدادات الكراج">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الكراج</label>
                <input
                  type="text"
                  value={garageSettings.name}
                  onChange={(e) => setGarageSettings({ ...garageSettings, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                <input
                  type="text"
                  value={garageSettings.address}
                  onChange={(e) => setGarageSettings({ ...garageSettings, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الهاتف</label>
                <input
                  type="text"
                  value={garageSettings.phone}
                  onChange={(e) => setGarageSettings({ ...garageSettings, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={garageSettings.email}
                  onChange={(e) => setGarageSettings({ ...garageSettings, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ساعات العمل</label>
                <input
                  type="text"
                  value={garageSettings.workingHours}
                  onChange={(e) => setGarageSettings({ ...garageSettings, workingHours: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
