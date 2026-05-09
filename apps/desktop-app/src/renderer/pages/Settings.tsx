import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    garageName: 'كراج المدينة',
    garageAddress: 'الرياض، المملكة العربية السعودية',
    garagePhone: '0500000000',
    garageEmail: 'info@garage.com',
    taxRate: 15,
    cancellationPolicy: '24 ساعة قبل الموعد',
    discountEnabled: true,
    discountPercentage: 10,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save settings logic
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout currentPage="settings">
      <Card title="الإعدادات">
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            {[
              { id: 'general', label: 'عام' },
              { id: 'tax', label: 'الضرائب' },
              { id: 'cancellation', label: 'سياسات الإلغاء' },
              { id: 'discounts', label: 'الخصومات' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <Input label="اسم الكراج" value={settings.garageName} onChange={(e) => setSettings({ ...settings, garageName: e.target.value })} />
              <Input label="العنوان" value={settings.garageAddress} onChange={(e) => setSettings({ ...settings, garageAddress: e.target.value })} />
              <Input label="رقم الهاتف" value={settings.garagePhone} onChange={(e) => setSettings({ ...settings, garagePhone: e.target.value })} />
              <Input label="البريد الإلكتروني" value={settings.garageEmail} onChange={(e) => setSettings({ ...settings, garageEmail: e.target.value })} />
            </div>
          )}

          {activeTab === 'tax' && (
            <div className="space-y-4">
              <Input label="نسبة الضريبة (%)" type="number" value={settings.taxRate} onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })} />
            </div>
          )}

          {activeTab === 'cancellation' && (
            <div className="space-y-4">
              <Input label="سياسة الإلغاء" value={settings.cancellationPolicy} onChange={(e) => setSettings({ ...settings, cancellationPolicy: e.target.value })} />
            </div>
          )}

          {activeTab === 'discounts' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={settings.discountEnabled}
                  onChange={(e) => setSettings({ ...settings, discountEnabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600"
                />
                <label className="font-medium">تفعيل الخصومات</label>
              </div>
              <Input label="نسبة الخمصم الافتراضية (%)" type="number" value={settings.discountPercentage} onChange={(e) => setSettings({ ...settings, discountPercentage: Number(e.target.value) })} disabled={!settings.discountEnabled} />
            </div>
          )}

          <Button onClick={handleSave} loading={loading} className="w-full">
            حفظ الإعدادات
          </Button>
        </div>
      </Card>
    </AppLayout>
  );
};

export default Settings;
