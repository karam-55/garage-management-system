import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import apiClient from '../lib/api-client';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  time: string;
}

const Notifications: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      console.log('[API] Fetching notifications');
      const res = await apiClient.get('/notifications');
      const data = res.data?.data || res.data || [];
      setNotifications(Array.isArray(data) ? data.map((n: any) => ({
        id: n.id,
        type: n.type || 'info',
        title: n.title || 'إشعار',
        message: n.message || '',
        read: n.status === 'READ' || n.isRead || false,
        time: n.createdAt ? new Date(n.createdAt).toLocaleDateString('ar-SA') : 'الآن',
      })) : []);
    } catch (error) {
      console.error('[API] Error fetching notifications:', error);
      setNotifications([]);
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

  const markAsRead = async (id: string) => {
    try {
      console.log('[API] Marking notification as read:', id);
      await apiClient.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('[API] Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      console.log('[API] Marking all notifications as read');
      await apiClient.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('[API] Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإشعار؟')) return;
    
    try {
      console.log('[API] Deleting notification:', id);
      await apiClient.delete(`/notifications/${id}`);
      console.log('[API] Notification deleted successfully');
      
      // Remove from local state immediately for instant feedback
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      // Then refresh from server to confirm
      await fetchNotifications();
    } catch (error: any) {
      console.error('[API] Error deleting notification:', error);
      console.error('[API] Response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'فشل حذف الإشعار';
      alert(`خطأ: ${errorMessage}`);
    }
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

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">جاري التحميل...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.length === 0 ? (
                <p className="text-center text-gray-500 py-8">لا توجد إشعارات</p>
              ) : (
                filteredNotifications.map((notification) => (
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
                ))
              )}
            </div>
          )}
        </div>
      </Card>
    </AppLayout>
  );
};

export default Notifications;
