import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import apiClient from '../lib/api-client';

const Bookings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    vehicleId: '',
    serviceId: '',
    scheduledAt: '',
    notes: '',
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/bookings');
      const data = res.data?.data || res.data || [];
      setBookings(Array.isArray(data) ? data.map((b: any) => ({
        id: b.id,
        customer: b.customer?.fullName || 'عميل',
        vehicle: b.vehicle ? `${b.vehicle.make} ${b.vehicle.model}` : 'سيارة',
        service: b.service?.name || '',
        status: b.status,
        date: b.scheduledAt ? new Date(b.scheduledAt).toLocaleDateString('ar-SA') : '',
      })) : []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      console.log('[API] Creating booking:', formData);
      const response = await apiClient.post('/bookings', {
        customerId: formData.customerId,
        vehicleId: formData.vehicleId,
        serviceId: formData.serviceId,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
        notes: formData.notes,
      });
      console.log('[API] Booking created successfully:', response.data);
      setIsModalOpen(false);
      setFormData({ customerId: '', vehicleId: '', serviceId: '', scheduledAt: '', notes: '' });
      fetchBookings();
      alert('تم إنشاء الحجز بنجاح');
    } catch (error: any) {
      console.error('[API] Error creating booking:', error);
      console.error('[API] Response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'فشل إنشاء الحجز';
      alert(`خطأ: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الحجز؟')) return;
    try {
      console.log('[API] Deleting booking:', id);
      await apiClient.delete(`/bookings/${id}`);
      console.log('[API] Booking deleted successfully');
      fetchBookings();
      alert('تم حذف الحجز بنجاح');
    } catch (error: any) {
      console.error('[API] Error deleting booking:', error);
      console.error('[API] Response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'فشل حذف الحجز';
      alert(`خطأ: ${errorMessage}`);
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

  const columns = [
    { key: 'customer', title: 'العميل' },
    { key: 'vehicle', title: 'السيارة' },
    { key: 'service', title: 'الخدمة' },
    {
      key: 'status',
      title: 'الحالة',
      render: (value: string) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {getStatusText(value)}
        </span>
      ),
    },
    { key: 'date', title: 'التاريخ' },
    {
      key: 'actions',
      title: 'إجراءات',
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleDeleteBooking(row.id)}>
            حذف
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AppLayout currentPage="bookings">
      <Card title="إدارة الحجوزات">
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex gap-4">
            <Input
              placeholder="بحث بالعميل أو السيارة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'كل الحالات' },
                { value: 'IN_PROGRESS', label: 'قيد التنفيذ' },
                { value: 'PENDING', label: 'قيد الانتظار' },
                { value: 'COMPLETED', label: 'مكتمل' },
                { value: 'CANCELLED', label: 'ملغي' },
              ]}
            />
            <Button onClick={() => setIsModalOpen(true)}>حجز جديد</Button>
          </div>

          {/* Table */}
          <Table data={bookings} columns={columns} loading={loading} />
        </div>
      </Card>

      {/* Create Booking Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="حجز جديد" size="lg">
        <form onSubmit={handleCreateBooking} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">العميل</label>
            <Input
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              placeholder="أدخل معرف العميل"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">السيارة</label>
            <Input
              value={formData.vehicleId}
              onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
              placeholder="أدخل معرف السيارة"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الخدمة</label>
            <Input
              value={formData.serviceId}
              onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
              placeholder="أدخل معرف الخدمة"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ والوقت</label>
            <Input
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
            <Input
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="ملاحظات إضافية"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'جاري إنشاء...' : 'إنشاء الحجز'}
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

export default Bookings;
