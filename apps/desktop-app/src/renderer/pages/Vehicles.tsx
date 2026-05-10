import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import apiClient from '../lib/api-client';

const Vehicles: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    make: '',
    model: '',
    year: '',
    licensePlate: '',
    color: '',
    vin: '',
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/vehicles');
      const data = res.data?.data || res.data || [];
      setVehicles(Array.isArray(data) ? data.map((v: any) => ({
        id: v.id,
        plate: v.plate || v.licensePlate || '',
        brand: v.make || '',
        model: v.model || '',
        year: v.year || '',
        customer: v.customer?.fullName || v.customerId || '',
      })) : []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      console.log('[API] Creating vehicle:', formData);
      const response = await apiClient.post('/vehicles', {
        customerId: formData.customerId,
        make: formData.make,
        model: formData.model,
        year: formData.year,
        licensePlate: formData.licensePlate,
        color: formData.color,
        vin: formData.vin,
      });
      console.log('[API] Vehicle created successfully:', response.data);
      setIsModalOpen(false);
      setFormData({ customerId: '', make: '', model: '', year: '', licensePlate: '', color: '', vin: '' });
      fetchVehicles();
      alert('تم إنشاء السيارة بنجاح');
    } catch (error: any) {
      console.error('[API] Error creating vehicle:', error);
      console.error('[API] Response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'فشل إنشاء السيارة';
      alert(`خطأ: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه السيارة؟')) return;
    try {
      console.log('[API] Deleting vehicle:', id);
      await apiClient.delete(`/vehicles/${id}`);
      console.log('[API] Vehicle deleted successfully');
      // Update local state immediately
      setVehicles(prev => prev.filter(v => v.id !== id));
      // Then refresh from server
      await fetchVehicles();
    } catch (error: any) {
      console.error('[API] Error deleting vehicle:', error);
      console.error('[API] Response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'فشل حذف السيارة';
      alert(`خطأ: ${errorMessage}`);
    }
  };

  return (
    <AppLayout currentPage="vehicles">
      <Card title="إدارة السيارات">
        <div className="space-y-6">
          <div className="flex gap-4">
            <Input placeholder="بحث باللوحة أو الموديل..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
            <Select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              options={[
                { value: '', label: 'كل الماركات' },
                { value: 'Toyota', label: 'Toyota' },
                { value: 'Honda', label: 'Honda' },
                { value: 'BMW', label: 'BMW' },
              ]}
            />
            <Button onClick={() => setIsModalOpen(true)}>سيارة جديدة</Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">جاري التحميل...</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.length === 0 ? (
              <p className="text-center text-gray-500 py-8 col-span-full">لا توجد سيارات</p>
            ) : (
            vehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">🚗</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{vehicle.plate}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{vehicle.brand} {vehicle.model}</h3>
                <p className="text-sm text-gray-600 mt-1">{vehicle.year}</p>
                <p className="text-sm text-gray-600 mt-2">👤 {vehicle.customer}</p>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => alert('عرض التفاصيل')}>عرض</Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteVehicle(vehicle.id)} className="flex-1">حذف</Button>
                </div>
              </div>
            ))
            )}
          </div>
          )}
        </div>
      </Card>

      {/* Create Vehicle Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="سيارة جديدة" size="md">
        <form onSubmit={handleCreateVehicle} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">العميل</label>
            <Input
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              placeholder="أدخل معرف العميل"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الماركة</label>
              <Input
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                placeholder="Toyota"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الموديل</label>
              <Input
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="Camry"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">السنة</label>
              <Input
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="2020"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اللون</label>
              <Input
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="أبيض"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم اللوحة</label>
            <Input
              value={formData.licensePlate}
              onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
              placeholder="ABC 1234"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهيكل (VIN)</label>
            <Input
              value={formData.vin}
              onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
              placeholder="VIN"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'جاري إنشاء...' : 'إنشاء السيارة'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
              إلغاء
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
};

export default Vehicles;
