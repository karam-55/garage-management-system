import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Notifications: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      setNotifications([
        { id: '1', type: 'info', title: 'حجز جديد', message: 'حجز جديد من أحمد محمد', read: false, time: 'منذ 5 دقائق' },
        { id: '2', type: 'warning', title: 'تنبيه المخزون', message: 'قطعة "فرامل Toyota" منخفضة المخزون', read: false, time: 'منذ ساعة' },
        { id: '3', type: 'success', title: 'دفع مكتمل', message: 'تم استلام دفع فاتورة INV-2024-001', read: true, time: 'منذ ساعتين' },
        { id: '4', type: 'error', title: 'فاتورة متأخرة', message: 'فاتورة INV-2024-003 متأخرة الدفع', read: true, time: 'منذ يوم' },
      ]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    const icons: Record<string, string> = {
      info: 'ℹ️',
      warning: '⚠️',
      success: '✅',
      error: '❌',
    };
    return icons[type] || 'ℹ️';
  };

  const getColor = (type: string) => {
    const colors: Record<string, string> = {
      info: 'border-blue-400 bg-blue-50',
      warning: 'border-yellow-400 bg-yellow-50',
      success: 'border-green-400 bg-green-50',
      error: 'border-red-400 bg-red-50',
    };
    return colors[type] || 'border-gray-400 bg-gray-50';
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread' 
      ? notifications.filter(n => !n.read)
      : notifications.filter(n => n.read);

  return (
    <AppLayout currentPage="notifications">
      <Card 
        title="الإشعارات"
        actions={
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            تعليم الكل كمقروء
          </Button>
        }
      >
        <div className="space-y-6">
          <div className="flex gap-2">
            <Button variant={filter === 'all' ? 'primary' : 'outline'} size="sm" onClick={() => setFilter('all')}>
              الكل
            </Button>
            <Button variant={filter === 'unread' ? 'primary' : 'outline'} size="sm" onClick={() => setFilter('unread')}>
              غير مقروء
            </Button>
            <Button variant={filter === 'read' ? 'primary' : 'outline'} size="sm" onClick={() => setFilter('read')}>
              مقروء
            </Button>
          </div>

          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 rounded-xl border-l-4 ${getColor(notification.type)} ${!notification.read ? 'shadow-md' : 'opacity-75'}`}
              >
                <span className="text-2xl">{getIcon(notification.type)}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                    <span className="text-xs text-gray-500">{notification.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                </div>
                <div className="flex gap-2">
                  {!notification.read && (
                    <Button variant="outline" size="sm" onClick={() => markAsRead(notification.id)}>
                      قراءة
                    </Button>
                  )}
                  <Button variant="danger" size="sm" onClick={() => deleteNotification(notification.id)}>
                    حذف
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </AppLayout>
  );
};

export default Notifications;
