'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  Car,
  Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import AppLayout from '@/components/layouts/AppLayout';

export default function CustomersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // Fetch customers from backend
      // const response = await apiClient.get('/customers');
      // setCustomers(response.data);
      
      // Mock data for now
      setCustomers([
        {
          id: '1',
          fullName: 'أحمد محمد',
          email: 'ahmed@example.com',
          phone: '0501234567',
          vehiclesCount: 2,
          totalBookings: 5,
          createdAt: '2024-01-10T00:00:00Z',
        },
        {
          id: '2',
          fullName: 'خالد علي',
          email: 'khaled@example.com',
          phone: '0507654321',
          vehiclesCount: 1,
          totalBookings: 3,
          createdAt: '2024-01-12T00:00:00Z',
        },
        {
          id: '3',
          fullName: 'سعيد أحمد',
          email: 'saeed@example.com',
          phone: '0509876543',
          vehiclesCount: 3,
          totalBookings: 8,
          createdAt: '2024-01-08T00:00:00Z',
        },
      ]);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => 
    customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة العملاء</h1>
            <p className="text-gray-600">عرض وإدارة جميع عملاء الكراج</p>
          </div>
          <Button onClick={() => router.push('/customers/new')} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            عميل جديد
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="بحث بالاسم، البريد الإلكتروني، أو الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </Card>

        {/* Customers Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">لا يوجد عملاء</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/customers/${customer.id}`)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => router.push(`/customers/${customer.id}/edit`)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{customer.fullName}</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{customer.phone}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Car className="w-4 h-4 text-blue-600" />
                        <span className="text-2xl font-bold text-gray-900">{customer.vehiclesCount}</span>
                      </div>
                      <p className="text-xs text-gray-500">سيارة</p>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-bold text-gray-900">{customer.totalBookings}</span>
                      <p className="text-xs text-gray-500">حجز</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            عرض {filteredCustomers.length} من {customers.length} عميل
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
