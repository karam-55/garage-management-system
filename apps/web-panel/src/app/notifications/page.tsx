'use client';

import { useEffect, useState } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2,
  Loader2,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import AppLayout from '@/components/layouts/AppLayout';

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Fetch notifications from backend
      // const response = await apiClient.get('/notifications');
      // setNotifications(response.data);
      
      // Mock data for now
      setNotifications([
        {
          id: '1',
          title: 'حجز جديد',
          message: 'تم إنشاء حجز جديد من قبل أحمد محمد',
          type: 'INFO',
          read: false,
          createdAt: '2024-01-15T10:30:00Z',
        },
        {
          id: '2',
          title: 'تنبيه المخزون',
          message: 'قطعة "فرامل Honda" منخفضة المخزون (5 قطع)',
          type: 'WARNING',
          read: false,
          createdAt: '2024-01-15T09:15:00Z',
        },
        {
          id: '3',
          title: 'فاتورة متأخرة',
          message: 'فاتورة INV-2024-003 متأخرة الدفع',
          type: 'ERROR',
          read: true,
          createdAt: '2024-01-14T16:20:00Z',
        },
        {
          id: '4',
          title: 'إتمام الحجز',
          message: 'تم إتمام حجز #BK-2024-001 بنجاح',
          type: 'SUCCESS',
          read: true,
          createdAt: '2024-01-14T14:30:00Z',
        },
      ]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const getIcon = (type: string) => {
    const icons: Record<string, any> = {
      INFO: Info,
      WARNING: AlertTriangle,
      ERROR: XCircle,
      SUCCESS: CheckCircle,
    };
    return icons[type] || Bell;
  };

  const getColor = (type: string) => {
    const colors: Record<string, string> = {
      INFO: 'bg-blue-100 text-blue-600 border-blue-200',
      WARNING: 'bg-yellow-100 text-yellow-600 border-yellow-200',
      ERROR: 'bg-red-100 text-red-600 border-red-200',
      SUCCESS: 'bg-green-100 text-green-600 border-green-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const markAsRead = async (id: string) => {
    try {
      // Mark notification as read
      // await apiClient.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Mark all notifications as read
      // await apiClient.put('/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      // Delete notification
      // await apiClient.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">الإشعارات</h1>
            <p className="text-gray-600">عرض وإدارة جميع الإشعارات</p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} variant="outline" className="flex items-center gap-2">
                <CheckCheck className="w-4 h-4" />
                تحديد الكل كمقروء
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl transition-all ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              الكل ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-xl transition-all ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              غير مقروء ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-xl transition-all ${
                filter === 'read'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              مقروء ({notifications.length - unreadCount})
            </button>
          </div>
        </Card>

        {/* Notifications List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد إشعارات</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => {
              const Icon = getIcon(notification.type);
              return (
                <Card
                  key={notification.id}
                  className={`transition-all ${!notification.read ? 'border-blue-500 bg-blue-50' : ''}`}
                >
                  <div className="flex items-start gap-4 p-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getColor(notification.type)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleDateString('ar-SA', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{notification.message}</p>
                    </div>
                    <div className="flex gap-2">
                      {!notification.read && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          title="تحديد كمقروء"
                        >
                          <CheckCheck className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
