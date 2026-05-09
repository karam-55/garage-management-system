import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

const Mechanics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchMechanics();
  }, []);

  const fetchMechanics = async () => {
    setLoading(true);
    try {
      setMechanics([
        { id: '1', name: 'محمد علي', phone: '0501111111', status: 'ACTIVE', rating: 4.5, specializations: ['محرك', 'فرامل'] },
        { id: '2', name: 'أحمد حسن', phone: '0502222222', status: 'ACTIVE', rating: 4.8, specializations: ['كهرباء', 'تكييف'] },
        { id: '3', name: 'عمر خالد', phone: '0503333333', status: 'INACTIVE', rating: 4.2, specializations: ['زيت', 'فلترة'] },
      ]);
    } catch (error) {
      console.error('Error fetching mechanics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      ACTIVE: 'نشط',
      INACTIVE: 'غير نشط',
    };
    return texts[status] || status;
  };

  return (
    <AppLayout currentPage="mechanics">
      <Card title="إدارة الفنيين">
        <div className="space-y-6">
          <div className="flex gap-4">
            <Input placeholder="بحث بالاسم أو الهاتف..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'كل الحالات' },
                { value: 'ACTIVE', label: 'نشط' },
                { value: 'INACTIVE', label: 'غير نشط' },
              ]}
            />
            <Button>فني جديد</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mechanics.map((mechanic) => (
              <div key={mechanic.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {mechanic.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{mechanic.name}</h3>
                    <p className="text-sm text-gray-600">{mechanic.phone}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(mechanic.status)}`}>
                      {getStatusText(mechanic.status)}
                    </span>
                    <span className="text-yellow-500">⭐ {mechanic.rating}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {mechanic.specializations.map((spec: string, index: number) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {spec}
                      </span>
                    ))}
                  </div>
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

export default Mechanics;
