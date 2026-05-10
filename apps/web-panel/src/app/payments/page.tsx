'use client';

import { useEffect, useState } from 'react';
import { 
  CreditCard, 
  Search, 
  Calendar,
  DollarSign,
  Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import AppLayout from '@/components/layouts/AppLayout';

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { default: apiClient } = await import('@/lib/api-client');
      const response = await apiClient.get('/payments');
      const data = (response.data || []).map((p: any) => ({
        ...p,
        invoiceNumber: p.invoice?.invoiceNumber ?? p.invoiceId ?? '-',
        method: p.paymentMethod ?? p.method ?? 'CASH',
        paidAt: p.paymentDate ?? p.paidAt ?? null,
      }));
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = !methodFilter || payment.method === methodFilter;
    const matchesStatus = !statusFilter || payment.status === statusFilter;
    return matchesSearch && matchesMethod && matchesStatus;
  });

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      CASH: 'bg-green-100 text-green-800 border-green-200',
      CARD: 'bg-blue-100 text-blue-800 border-blue-200',
      BANK_TRANSFER: 'bg-purple-100 text-purple-800 border-purple-200',
      APPLE_PAY: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[method] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getMethodText = (method: string) => {
    const texts: Record<string, string> = {
      CASH: 'نقداً',
      CARD: 'بطاقة',
      BANK_TRANSFER: 'تحويل بنكي',
      APPLE_PAY: 'Apple Pay',
    };
    return texts[method] || method;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      COMPLETED: 'bg-green-100 text-green-800 border-green-200',
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      FAILED: 'bg-red-100 text-red-800 border-red-200',
      REFUNDED: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      COMPLETED: 'مكتمل',
      PENDING: 'قيد الانتظار',
      FAILED: 'فشل',
      REFUNDED: 'مسترد',
    };
    return texts[status] || status;
  };

  const totalPayments = payments.reduce((sum, p) => sum + (p.status === 'COMPLETED' ? p.amount : 0), 0);
  const pendingPayments = payments.reduce((sum, p) => sum + (p.status === 'PENDING' ? p.amount : 0), 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة المدفوعات</h1>
            <p className="text-gray-600">عرض وإدارة جميع المدفوعات</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">إجمالي المدفوعات المكتملة</p>
                <p className="text-3xl font-bold">{totalPayments.toLocaleString('ar-SA')} ر.س</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">المدفوعات المعلقة</p>
                <p className="text-3xl font-bold">{pendingPayments.toLocaleString('ar-SA')} ر.س</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="بحث برقم الفاتورة أو اسم العميل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">كل الطرق</option>
              <option value="CASH">نقداً</option>
              <option value="CARD">بطاقة</option>
              <option value="BANK_TRANSFER">تحويل بنكي</option>
              <option value="APPLE_PAY">Apple Pay</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">كل الحالات</option>
              <option value="COMPLETED">مكتمل</option>
              <option value="PENDING">قيد الانتظار</option>
              <option value="FAILED">فشل</option>
              <option value="REFUNDED">مسترد</option>
            </select>
          </div>
        </Card>

        {/* Payments Table */}
        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد مدفوعات</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      رقم الفاتورة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      العميل
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المبلغ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      طريقة الدفع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ الدفع
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                        {payment.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {payment.customer.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                        {payment.amount.toLocaleString('ar-SA')} ر.س
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getMethodColor(payment.method)}`}>
                          {getMethodText(payment.method)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                          {getStatusText(payment.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('ar-SA') : '-'}
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
            عرض {filteredPayments.length} من {payments.length} دفعة
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
