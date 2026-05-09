'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Car, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  User,
  Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import AppLayout from '@/components/layouts/AppLayout';

export default function VehiclesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [makeFilter, setMakeFilter] = useState('');

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      // Fetch vehicles from backend
      // const response = await apiClient.get('/vehicles');
      // setVehicles(response.data);
      
      // Mock data for now
      setVehicles([
        {
          id: '1',
          make: 'Toyota',
          model: 'Camry',
          year: 2022,
          plate: 'ABC1234',
          vin: 'JTDKN3DU5A0123456',
          color: 'أبيض',
          customer: { fullName: 'أحمد محمد' },
          totalBookings: 3,
          createdAt: '2024-01-10T00:00:00Z',
        },
        {
          id: '2',
          make: 'Honda',
          model: 'Accord',
          year: 2021,
          plate: 'XYZ5678',
          vin: '1HGCV1F31KA0123456',
          color: 'أسود',
          customer: { fullName: 'خالد علي' },
          totalBookings: 5,
          createdAt: '2024-01-12T00:00:00Z',
        },
        {
          id: '3',
          make: 'BMW',
          model: 'X5',
          year: 2023,
          plate: 'DEF9012',
          vin: 'WBAJA0C50KA0123456',
          color: 'رمادي',
          customer: { fullName: 'سعيد أحمد' },
          totalBookings: 2,
          createdAt: '2024-01-08T00:00:00Z',
        },
      ]);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMake = !makeFilter || vehicle.make === makeFilter;
    return matchesSearch && matchesMake;
  });

  const makes = [...new Set(vehicles.map(v => v.make))];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة السيارات</h1>
            <p className="text-gray-600">عرض وإدارة جميع سيارات العملاء</p>
          </div>
          <Button onClick={() => router.push('/vehicles/new')} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            سيارة جديدة
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="بحث باللوحة، الماركة، أو الموديل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={makeFilter}
              onChange={(e) => setMakeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">كل الماركات</option>
              {makes.map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>
          </div>
        </Card>

        {/* Vehicles Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-12">
            <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد سيارات</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <Car className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/vehicles/${vehicle.id}`)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => router.push(`/vehicles/${vehicle.id}/edit`)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{vehicle.make} {vehicle.model}</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">رقم اللوحة</span>
                      <span className="font-semibold text-gray-900 text-lg">{vehicle.plate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">السنة</span>
                      <span className="font-semibold text-gray-900">{vehicle.year}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">اللون</span>
                      <span className="font-semibold text-gray-900">{vehicle.color}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 pt-2 border-t border-gray-200">
                      <User className="w-4 h-4" />
                      <span className="text-sm">{vehicle.customer.fullName}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <span className="text-2xl font-bold text-gray-900">{vehicle.totalBookings}</span>
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
            عرض {filteredVehicles.length} من {vehicles.length} سيارة
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
