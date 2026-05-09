import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Input from '../components/ui/Input';

const Inventory: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      setInventory([
        { id: '1', name: 'فرامل Toyota', sku: 'BRAK-001', quantity: 5, reorderPoint: 10, price: 150 },
        { id: '2', name: 'زيت محرك 5W-30', sku: 'OIL-5W30', quantity: 25, reorderPoint: 15, price: 45 },
        { id: '3', name: 'فلتر هواء', sku: 'FLT-AIR', quantity: 30, reorderPoint: 20, price: 25 },
      ]);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (quantity: number, reorderPoint: number) => {
    if (quantity <= reorderPoint / 2) return { color: 'text-red-600', bg: 'bg-red-100', text: 'منخفض جداً' };
    if (quantity <= reorderPoint) return { color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'منخفض' };
    return { color: 'text-green-600', bg: 'bg-green-100', text: 'متوفر' };
  };

  const columns = [
    { key: 'name', title: 'الاسم' },
    { key: 'sku', title: 'SKU' },
    { key: 'quantity', title: 'الكمية' },
    { key: 'price', title: 'السعر (ر.س)' },
    {
      key: 'status',
      title: 'الحالة',
      render: (value: any, row: any) => {
        const status = getStockStatus(row.quantity, row.reorderPoint);
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
            {status.text}
          </span>
        );
      },
    },
  ];

  return (
    <AppLayout currentPage="inventory">
      <Card title="إدارة المخزون">
        <div className="space-y-6">
          <div className="flex gap-4">
            <Input placeholder="بحث بالاسم أو SKU..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
            <Button>قطعة جديدة</Button>
          </div>

          <Table data={inventory} columns={columns} loading={loading} />
        </div>
      </Card>
    </AppLayout>
  );
};

export default Inventory;
