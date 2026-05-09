import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Customers: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      setCustomers([
        { id: '1', name: 'أحمد محمد', phone: '0501234567', email: 'ahmed@example.com', vehicles: 2 },
        { id: '2', name: 'خالد علي', phone: '0507654321', email: 'khaled@example.com', vehicles: 1 },
        { id: '3', name: 'سعيد أحمد', phone: '0509876543', email: 'saeed@example.com', vehicles: 3 },
      ]);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout currentPage="customers">
      <Card title="إدارة العملاء">
        <div className="space-y-6">
          <div className="flex gap-4">
            <Input placeholder="بحث بالاسم أو الهاتف..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
            <Button>عميل جديد</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map((customer) => (
              <div key={customer.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{customer.name}</h3>
                    <p className="text-sm text-gray-600">{customer.phone}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>📧 {customer.email}</p>
                  <p>🚗 {customer.vehicles} سيارات</p>
                </div>
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

export default Customers;
