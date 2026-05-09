'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Wrench, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Phone,
  Star,
  Loader2,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import AppLayout from '@/components/layouts/AppLayout';

export default function MechanicsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchMechanics = async () => {
    setLoading(true);
    try {
      // Fetch mechanics from backend
      // const response = await apiClient.get('/mechanics');
      // setMechanics(response.data);
      
      // Mock data for now
      setMechanics([
        {
          id: '1',
          fullName: 'أحمد محمد',
          phone: '0501234567',
          specializations: ['صيانة عامة', 'تغيير زيت'],
          status: 'AVAILABLE',
          rating: 4.5,
          reviewCount: 12,
          totalBookings: 45,
          completedBookings: 42,
        },
        {
          id: '2',
          fullName: 'خالد عبدالله',
          phone: '0507654321',
          specializations: ['فحص كهرباء', 'ميكانيكا'],
          status: 'BUSY',
          rating: 4.8,
          reviewCount: 8,
          totalBookings: 38,
          completedBookings: 35,
        },
        {
          id: '3',
          fullName: 'علي حسن',
          phone: '0509876543',
          specializations: ['إصلاح المحركات', 'ناقل الحركة'],
          status: 'ON_LEAVE',
          rating: 4.2,
          reviewCount: 15,
          totalBookings: 52,
          completedBookings: 48,
        },
      ]);
    } catch (error) {
      console.error('Error fetching mechanics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMechanics();
  }, []);

  const filteredMechanics = mechanics.filter(mechanic => {
    const matchesSearch = 
      mechanic.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mechanic.phone.includes(searchTerm);
    const matchesStatus = !statusFilter || mechanic.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      AVAILABLE: 'bg-green-100 text-green-800 border-green-200',
      BUSY: 'bg-red-100 text-red-800 border-red-200',
      ON_LEAVE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      AVAILABLE: 'متاح',
      BUSY: 'مشغول',
      ON_LEAVE: 'في إجازة',
    };
    return texts[status] || status;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة الفنيين</h1>
            <p className="text-gray-600">عرض وإدارة جميع فنيي الكراج</p>
          </div>
          <Button onClick={() => router.push('/mechanics/new')} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            فني جديد
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="بحث بالاسم أو الهاتف..."
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
              <option value="AVAILABLE">متاح</option>
              <option value="BUSY">مشغول</option>
              <option value="ON_LEAVE">في إجازة</option>
            </select>
          </div>
        </Card>

        {/* Mechanics Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredMechanics.length === 0 ? (
          <div className="text-center py-12">
            <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">لا يوجد فنيين</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMechanics.map((mechanic) => (
              <Card key={mechanic.id} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <Wrench className="w-6 h-6 text-white" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(mechanic.status)}`}>
                      {getStatusText(mechanic.status)}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{mechanic.fullName}</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{mechanic.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{mechanic.rating}</span>
                      <span className="text-xs text-gray-500">({mechanic.reviewCount} تقييم)</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">التخصصات:</p>
                    <div className="flex flex-wrap gap-2">
                      {mechanic.specializations.map((spec: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-2xl font-bold text-gray-900">{mechanic.totalBookings}</span>
                      </div>
                      <p className="text-xs text-gray-500">إجمالي الحجوزات</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-2xl font-bold text-gray-900">{mechanic.completedBookings}</span>
                      </div>
                      <p className="text-xs text-gray-500">مكتملة</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => router.push(`/mechanics/${mechanic.id}`)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => router.push(`/mechanics/${mechanic.id}/edit`)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            عرض {filteredMechanics.length} من {mechanics.length} فني
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
