import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import apiClient from '../lib/api-client';

const Mechanics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    specializations: '',
    isActive: true,
  });

  useEffect(() => {
    fetchMechanics();
  }, []);

  const fetchMechanics = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/mechanics');
      const data = res.data?.data || res.data || [];
      setMechanics(Array.isArray(data) ? data.map((m: any) => ({
        id: m.id,
        name: m.user?.fullName || m.fullName || 'فني',
        phone: m.user?.phone || m.phone || '',
        status: m.isActive ? 'ACTIVE' : 'INACTIVE',
        rating: m.rating || 0,
        specializations: m.specializations || [],
      })) : []);
    } catch (error) {
      console.error('Error fetching mechanics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMechanic = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      console.log('[API] Creating mechanic:', formData);
      const response = await apiClient.post('/mechanics', {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        specializations: formData.specializations.split(',').map(s => s.trim()),
        isActive: formData.isActive,
      });
      console.log('[API] Mechanic created successfully:', response.data);
      setIsModalOpen(false);
      setFormData({ fullName: '', phone: '', email: '', password: '', specializations: '', isActive: true });
      fetchMechanics();
      alert('تم إنشاء الفني بنجاح');
    } catch (error: any) {
      console.error('[API] Error creating mechanic:', error);
      console.error('[API] Response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'فشل إنشاء الفني';
      alert(`خطأ: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMechanic = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الفني؟')) return;
    try {
      console.log('[API] Deleting mechanic:', id);
      await apiClient.delete(`/mechanics/${id}`);
      console.log('[API] Mechanic deleted successfully');
      fetchMechanics();
      alert('تم حذف الفني بنجاح');
    } catch (error: any) {
      console.error('[API] Error deleting mechanic:', error);
      console.error('[API] Response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'فشل حذف الفني';
      alert(`خطأ: ${errorMessage}`);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      ACTIVE: 'نشط',
      INACTIVE: 'غير نشط',
    };
    return texts[status] || status;
  };

  return (
    <AppLayout currentPage="mechanics">
      <Card title="إدارة الفنيين">
        <div className="space-y-6">
          <div className="flex gap-4">
            <Input placeholder="بحث بالاسم أو الهاتف..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'كل الحالات' },
                { value: 'ACTIVE', label: 'نشط' },
                { value: 'INACTIVE', label: 'غير نشط' },
              ]}
            />
            <Button onClick={() => setIsModalOpen(true)}>فني جديد</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mechanics.map((mechanic) => (
              <div key={mechanic.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {mechanic.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{mechanic.name}</h3>
                    <p className="text-sm text-gray-600">{mechanic.phone}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(mechanic.status)}`}>
                      {getStatusText(mechanic.status)}
                    </span>
                    <span className="text-yellow-500">⭐ {mechanic.rating}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {mechanic.specializations.map((spec: string, index: number) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => alert('عرض التفاصيل')}>عرض</Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteMechanic(mechanic.id)} className="flex-1">حذف</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Create Mechanic Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="فني جديد" size="md">
        <form onSubmit={handleCreateMechanic} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
            <Input
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="اسم الفني"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="0501234567"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">التخصصات (مفصولة بفاصلة)</label>
            <Input
              value={formData.specializations}
              onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
              placeholder="محرك, فرامل, كهرباء"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'جاري إنشاء...' : 'إنشاء الفني'}
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

export default Mechanics;
