import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import apiClient from '../lib/api-client';

const Inventory: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    quantity: '',
    minQuantity: '',
    unitPrice: '',
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/inventory');
      const data = res.data?.data || res.data || [];
      setInventory(Array.isArray(data) ? data.map((item: any) => ({
        id: item.id,
        name: item.name || '',
        sku: item.partNumber || item.sku || '',
        quantity: item.quantity || 0,
        reorderPoint: item.reorderPoint || item.minStockLevel || 0,
        price: Number(item.sellingPrice || item.unitPrice || item.price || 0).toFixed(2),
      })) : []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      console.log('[API] Creating inventory item:', formData);
      const response = await apiClient.post('/inventory', {
        name: formData.name,
        sku: formData.sku,
        quantity: Number(formData.quantity),
        minQuantity: Number(formData.minQuantity),
        unitPrice: Number(formData.unitPrice),
      });
      console.log('[API] Inventory item created successfully:', response.data);
      setIsModalOpen(false);
      setFormData({ name: '', sku: '', quantity: '', minQuantity: '', unitPrice: '' });
      fetchInventory();
      alert('تم إنشاء العنصر بنجاح');
    } catch (error: any) {
      console.error('[API] Error creating inventory item:', error);
      console.error('[API] Response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'فشل إنشاء العنصر';
      alert(`خطأ: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInventory = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العنصر؟')) return;
    try {
      console.log('[API] Deleting inventory item:', id);
      await apiClient.delete(`/inventory/${id}`);
      console.log('[API] Inventory item deleted successfully');
      // Update local state immediately
      setInventory(prev => prev.filter(item => item.id !== id));
      // Then refresh from server
      await fetchInventory();
    } catch (error: any) {
      console.error('[API] Error deleting inventory item:', error);
      console.error('[API] Response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'فشل حذف العنصر';
      alert(`خطأ: ${errorMessage}`);
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
      render: (_value: any, row: any) => {
        const status = getStockStatus(Number(row.quantity), Number(row.reorderPoint));
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
            {status.text}
          </span>
        );
      },
    },
    {
      key: 'actions',
      title: 'إجراءات',
      render: (_value: any, row: any) => (
        <Button variant="outline" size="sm" onClick={() => handleDeleteInventory(row.id)}>
          حذف
        </Button>
      ),
    },
  ];

  return (
    <AppLayout currentPage="inventory">
      <Card title="إدارة المخزون">
        <div className="space-y-6">
          <div className="flex gap-4">
            <Input placeholder="بحث بالاسم أو SKU..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
            <Button onClick={() => setIsModalOpen(true)}>عنصر جديد</Button>
          </div>

          <Table data={inventory} columns={columns} loading={loading} />
        </div>
      </Card>

      {/* Create Inventory Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="عنصر جديد" size="md">
        <form onSubmit={handleCreateInventory} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="اسم العنصر"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
            <Input
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="SKU"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الكمية</label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الحد الأدنى</label>
              <Input
                type="number"
                value={formData.minQuantity}
                onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                placeholder="10"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">السعر</label>
            <Input
              type="number"
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'جاري إنشاء...' : 'إنشاء العنصر'}
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

export default Inventory;
