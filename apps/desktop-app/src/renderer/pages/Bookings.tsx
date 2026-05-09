import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

const Bookings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Mock data
      setBookings([
        { id: '1', customer: 'أحمد محمد', vehicle: 'Toyota Camry', service: 'تغيير زيت', status: 'IN_PROGRESS', date: '2024-01-15' },
        { id: '2', customer: 'خالد علي', vehicle: 'Honda Accord', service: 'صيانة دورية', status: 'PENDING', date: '2024-01-15' },
        { id: '3', customer: 'سعيد أحمد', vehicle: 'BMW X5', service: 'إصلاح فرامل', status: 'COMPLETED', date: '2024-01-14' },
      ]);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
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
            <Button>حجز جديد</Button>
          </div>

          {/* Table */}
          <Table data={bookings} columns={columns} loading={loading} />
        </div>
      </Card>
    </AppLayout>
  );
};

export default Bookings;
