import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Input from '../components/ui/Input';

const Invoices: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      setInvoices([
        { id: 'INV-2024-001', customer: 'أحمد محمد', amount: 450, status: 'PAID', date: '2024-01-15' },
        { id: 'INV-2024-002', customer: 'خالد علي', amount: 320, status: 'PENDING', date: '2024-01-15' },
        { id: 'INV-2024-003', customer: 'سعيد أحمد', amount: 780, status: 'OVERDUE', date: '2024-01-14' },
      ]);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
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
  ];

  return (
    <AppLayout currentPage="invoices">
      <Card title="إدارة الفواتير">
        <div className="space-y-6">
          <div className="flex gap-4">
            <Input placeholder="بحث برقم الفاتورة أو العميل..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
            <Button>فاتورة جديدة</Button>
          </div>

          <Table data={invoices} columns={columns} loading={loading} />
        </div>
      </Card>
    </AppLayout>
  );
};

export default Invoices;
