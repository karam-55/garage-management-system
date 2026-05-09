import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

const Vehicles: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      setVehicles([
        { id: '1', plate: 'ABC 1234', brand: 'Toyota', model: 'Camry', year: '2020', customer: 'أحمد محمد' },
        { id: '2', plate: 'XYZ 5678', brand: 'Honda', model: 'Accord', year: '2021', customer: 'خالد علي' },
        { id: '3', plate: 'DEF 9012', brand: 'BMW', model: 'X5', year: '2022', customer: 'سعيد أحمد' },
      ]);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout currentPage="vehicles">
      <Card title="إدارة السيارات">
        <div className="space-y-6">
          <div className="flex gap-4">
            <Input placeholder="بحث باللوحة أو الموديل..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
            <Select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              options={[
                { value: '', label: 'كل الماركات' },
                { value: 'Toyota', label: 'Toyota' },
                { value: 'Honda', label: 'Honda' },
                { value: 'BMW', label: 'BMW' },
              ]}
            />
            <Button>سيارة جديدة</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">🚗</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{vehicle.plate}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{vehicle.brand} {vehicle.model}</h3>
                <p className="text-sm text-gray-600 mt-1">{vehicle.year}</p>
                <p className="text-sm text-gray-600 mt-2">👤 {vehicle.customer}</p>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">عرض</Button>
                  <Button variant="outline" size="sm" className="flex-1">تعديل</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </AppLayout>
  );
};

export default Vehicles;
