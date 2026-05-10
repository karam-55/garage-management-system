import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import apiClient from '../lib/api-client';

const Customers: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    address: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/customers');
      const data = res.data?.data || res.data || [];
      setCustomers(Array.isArray(data) ? data.map((c: any) => ({
        id: c.id,
        name: c.fullName || 'عميل',
        phone: c.phone || '',
        email: c.email || '',
        vehicles: 0, // TODO: Fetch actual vehicle count
      })) : []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      console.log('[API] Creating customer:', formData);
      const response = await apiClient.post('/customers', {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        password: formData.password || 'ChangeMe@123',
        address: formData.address,
      });
      console.log('[API] Customer created successfully:', response.data);
      setIsModalOpen(false);
      setFormData({ fullName: '', phone: '', email: '', password: '', address: '' });
      fetchCustomers();
      alert('تم إنشاء العميل بنجاح');
    } catch (error: any) {
      console.error('[API] Error creating customer:', error);
      console.error('[API] Response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'فشل إنشاء العميل';
      alert(`خطأ: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العميل؟')) return;
    try {
      await apiClient.delete(`/customers/${id}`);
      // Update local state immediately
      setCustomers(prev => prev.filter(c => c.id !== id));
      // Then refresh from server
      await fetchCustomers();
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      alert(`فشل حذف العميل: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <AppLayout currentPage="customers">
      <Card title="إدارة العملاء">
        <div className="space-y-6">
          <div className="flex gap-4">
            <Input placeholder="بحث بالاسم أو الهاتف..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
            <Button onClick={() => setIsModalOpen(true)}>عميل جديد</Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">جاري التحميل...</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.length === 0 ? (
              <p className="text-center text-gray-500 py-8 col-span-full">لا يوجد عملاء</p>
            ) : (
            customers.map((customer) => (
              <div key={customer.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{customer.name}</h3>
                    <p className="text-sm text-gray-600">{customer.phone}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>📧 {customer.email}</p>
                  <p>🚗 {customer.vehicles} سيارات</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">عرض</Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteCustomer(customer.id)} className="flex-1">حذف</Button>
                </div>
              </div>
            ))
            )}
          </div>
          )}
        </div>
      </Card>

      {/* Create Customer Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="عميل جديد" size="md">
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
            <Input
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="اسم العميل"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="أدخل كلمة المرور (اختياري)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="العنوان"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'جاري إنشاء...' : 'إنشاء العميل'}
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

export default Customers;
