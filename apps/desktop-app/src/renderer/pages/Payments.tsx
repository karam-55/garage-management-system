import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import apiClient from '../lib/api-client';

const Payments: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/payments');
      const data = res.data?.data || res.data || [];
      setPayments(Array.isArray(data) ? data.map((p: any) => ({
        id: p.id,
        invoice: p.invoice?.invoiceNumber || p.invoiceId || '',
        customer: p.customer?.fullName || 'عميل',
        amount: Number(p.amount || 0).toFixed(2),
        method: p.paymentMethod || '',
        status: p.status,
        date: p.paymentDate || p.createdAt ? new Date(p.paymentDate || p.createdAt).toLocaleDateString('ar-SA') : '',
      })) : []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMethodText = (method: string) => {
    const texts: Record<string, string> = {
      CASH: 'نقداً',
      CARD: 'بطاقة',
      BANK_TRANSFER: 'تحويل بنكي',
    };
    return texts[method] || method;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      COMPLETED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      FAILED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      COMPLETED: 'مكتمل',
      PENDING: 'قيد الانتظار',
      FAILED: 'فشل',
    };
    return texts[status] || status;
  };

  const columns = [
    { key: 'invoice', title: 'رقم الفاتورة' },
    { key: 'customer', title: 'العميل' },
    { key: 'amount', title: 'المبلغ (ر.س)' },
    { key: 'method', title: 'طريقة الدفع', render: (value: string) => getMethodText(value) },
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
  ];

  return (
    <AppLayout currentPage="payments">
      <Card title="إدارة المدفوعات">
        <div className="space-y-6">
          <div className="flex gap-4">
            <Input placeholder="بحث بالفاتورة أو العميل..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
            <Select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              options={[
                { value: '', label: 'كل الطرق' },
                { value: 'CASH', label: 'نقداً' },
                { value: 'CARD', label: 'بطاقة' },
                { value: 'BANK_TRANSFER', label: 'تحويل بنكي' },
              ]}
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'كل الحالات' },
                { value: 'COMPLETED', label: 'مكتمل' },
                { value: 'PENDING', label: 'قيد الانتظار' },
                { value: 'FAILED', label: 'فشل' },
              ]}
            />
          </div>

          <Table data={payments} columns={columns} loading={loading} />
        </div>
      </Card>
    </AppLayout>
  );
};

export default Payments;
