import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import apiClient from '../lib/api-client';

const Invoices: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    vehicleId: '',
    totalAmount: '',
    dueDate: '',
    notes: '',
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/invoices');
      const data = res.data?.data || res.data || [];
      setInvoices(Array.isArray(data) ? data.map((inv: any) => ({
        id: inv.invoiceNumber || inv.id,
        customer: inv.customer?.fullName || 'عميل',
        amount: Number(inv.totalAmount || 0).toFixed(2),
        status: inv.status,
        date: inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('ar-SA') : '',
      })) : []);
    } catch (error) {
      console.error('[API] Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      console.log('[API] Creating invoice:', formData);
      const response = await apiClient.post('/invoices', {
        customerId: formData.customerId,
        vehicleId: formData.vehicleId,
        totalAmount: Number(formData.totalAmount),
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        notes: formData.notes,
      });
      console.log('[API] Invoice created successfully:', response.data);
      setIsModalOpen(false);
      setFormData({ customerId: '', vehicleId: '', totalAmount: '', dueDate: '', notes: '' });
      fetchInvoices();
      alert('تم إنشاء الفاتورة بنجاح');
    } catch (error: any) {
      console.error('[API] Error creating invoice:', error);
      console.error('[API] Response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'فشل إنشاء الفاتورة';
      alert(`خطأ: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) return;
    try {
      console.log('[API] Deleting invoice:', id);
      await apiClient.delete(`/invoices/${id}`);
      console.log('[API] Invoice deleted successfully');
      fetchInvoices();
      alert('تم حذف الفاتورة بنجاح');
    } catch (error: any) {
      console.error('[API] Error deleting invoice:', error);
      console.error('[API] Response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'فشل حذف الفاتورة';
      alert(`خطأ: ${errorMessage}`);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PAID: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      OVERDUE: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      PAID: 'مدفوعة',
      PENDING: 'قيد الانتظار',
      OVERDUE: 'متأخرة',
    };
    return texts[status] || status;
  };

  const columns = [
    { key: 'id', title: 'رقم الفاتورة' },
    { key: 'customer', title: 'العميل' },
    { key: 'amount', title: 'المبلغ (ر.س)' },
    { key: 'date', title: 'التاريخ' },
    {
      key: 'status',
      title: 'الحالة',
      render: (value: string) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {getStatusText(value)}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'إجراءات',
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleDeleteInvoice(row.id)}>
            حذف
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AppLayout currentPage="invoices">
      <Card title="إدارة الفواتير">
        <div className="space-y-6">
          <div className="flex gap-4">
            <Input placeholder="بحث برقم الفاتورة أو العميل..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
            <Button onClick={() => setIsModalOpen(true)}>فاتورة جديدة</Button>
          </div>

          <Table data={invoices} columns={columns} loading={loading} />
        </div>
      </Card>

      {/* Create Invoice Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="فاتورة جديدة" size="lg">
        <form onSubmit={handleCreateInvoice} className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ الإجمالي</label>
            <Input
              type="number"
              value={formData.totalAmount}
              onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الاستحقاق</label>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
              {isSubmitting ? 'جاري إنشاء...' : 'إنشاء الفاتورة'}
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

export default Invoices;
