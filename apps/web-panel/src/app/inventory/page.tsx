'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import AppLayout from '@/components/layouts/AppLayout';

export default function InventoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const { default: apiClient } = await import('@/lib/api-client');
      const response = await apiClient.get('/inventory');
      const items = (response.data || []).map((item: any) => ({
        ...item,
        price: item.sellingPrice ?? item.price ?? 0,
        status: Number(item.quantity) === 0
          ? 'OUT_OF_STOCK'
          : Number(item.quantity) <= Number(item.reorderPoint)
          ? 'LOW_STOCK'
          : 'IN_STOCK',
      }));
      setInventory(items);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.partNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      IN_STOCK: 'bg-green-100 text-green-800 border-green-200',
      LOW_STOCK: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      OUT_OF_STOCK: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      IN_STOCK: 'متوفر',
      LOW_STOCK: 'منخفض',
      OUT_OF_STOCK: 'نفذ',
    };
    return texts[status] || status;
  };

  const lowStockCount = inventory.filter(item => item.status === 'LOW_STOCK').length;
  const outOfStockCount = inventory.filter(item => item.status === 'OUT_OF_STOCK').length;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة المخزون</h1>
            <p className="text-gray-600">عرض وإدارة جميع قطع الغيار</p>
          </div>
          <Button onClick={() => router.push('/inventory/new')} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            قطعة جديدة
          </Button>
        </div>

        {/* Alerts */}
        {(lowStockCount > 0 || outOfStockCount > 0) && (
          <Card className="border-orange-200 bg-orange-50">
            <div className="flex items-center gap-4">
              <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">تنبيهات المخزون</p>
                <p className="text-sm text-gray-600">
                  {lowStockCount} قطع منخفضة المخزون • {outOfStockCount} قطع نفذت
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setStatusFilter('LOW_STOCK')}>
                عرض القطع المنخفضة
              </Button>
            </div>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="بحث بالاسم أو رقم القطعة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">كل الحالات</option>
              <option value="IN_STOCK">متوفر</option>
              <option value="LOW_STOCK">منخفض</option>
              <option value="OUT_OF_STOCK">نفذ</option>
            </select>
          </div>
        </Card>

        {/* Inventory Table */}
        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد قطع غيار</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الاسم
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      رقم القطعة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الكمية
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحد الأدنى
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      السعر
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInventory.map((item) => (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-gray-50 transition-colors ${
                        item.status === 'OUT_OF_STOCK' ? 'bg-red-50' :
                        item.status === 'LOW_STOCK' ? 'bg-yellow-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900 font-mono text-sm">{item.partNumber}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`font-bold ${
                          item.quantity === 0 ? 'text-red-600' :
                          item.quantity <= item.reorderPoint ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {item.reorderPoint}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                        {item.price.toLocaleString('ar-SA')} ر.س
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                          {getStatusText(item.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => router.push(`/inventory/${item.id}`)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => router.push(`/inventory/${item.id}/edit`)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            عرض {filteredInventory.length} من {inventory.length} قطعة
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              السابق
            </Button>
            <div className="flex items-center gap-1">
              <Button variant="primary" size="sm">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
            </div>
            <Button variant="outline" size="sm">
              التالي
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
