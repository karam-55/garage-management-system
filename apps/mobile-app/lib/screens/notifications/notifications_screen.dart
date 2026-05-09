import 'package:flutter/material.dart';
import '../../widgets/custom_card.dart';
import '../../widgets/status_badge.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({Key? key}) : super(key: key);

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final List<Map<String, dynamic>> _notifications = [
    {
      'id': '1',
      'title': 'حجز جديد',
      'message': 'تم إضافة حجز جديد لسيارة تويوتا كامري',
      'type': 'info',
      'read': false,
      'createdAt': DateTime.now().subtract(const Duration(minutes: 5)),
    },
    {
      'id': '2',
      'title': 'تنبيه المخزون',
      'message': 'فلتر زيت منخفض في المخزون (5 قطع)',
      'type': 'warning',
      'read': false,
      'createdAt': DateTime.now().subtract(const Duration(hours: 1)),
    },
    {
      'id': '3',
      'title': 'اكتمل العمل',
      'message': 'تم إكمال العمل على سيارة هوندا أكورد',
      'type': 'success',
      'read': true,
      'createdAt': DateTime.now().subtract(const Duration(hours: 3)),
    },
    {
      'id': '4',
      'title': 'طلب موافقة',
      'message': 'العميل طلب إضافة خدمة إضافية',
      'type': 'warning',
      'read': true,
      'createdAt': DateTime.now().subtract(const Duration(days: 1)),
    },
    {
      'id': '5',
      'title': 'دفع فاتورة',
      'message': 'تم دفع فاتورة الحجز #123',
      'type': 'success',
      'read': true,
      'createdAt': DateTime.now().subtract(const Duration(days: 2)),
    },
  ];

  int get _unreadCount => _notifications.where((n) => !n['read']).length;

  void _markAsRead(String id) {
    setState(() {
      final index = _notifications.indexWhere((n) => n['id'] == id);
      if (index != -1) {
        _notifications[index]['read'] = true;
      }
    });
  }

  void _markAllAsRead() {
    setState(() {
      for (var notification in _notifications) {
        notification['read'] = true;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('الإشعارات'),
        actions: [
          if (_unreadCount > 0)
            TextButton(
              onPressed: _markAllAsRead,
              child: const Text('تحديد الكل كمقروء'),
            ),
        ],
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _notifications.length,
        itemBuilder: (context, index) {
          final notification = _notifications[index];
          return CustomCard(
            onTap: () => _markAsRead(notification['id']),
            backgroundColor: notification['read'] ? null : Colors.blue.withOpacity(0.05),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: _getNotificationColor(notification['type']).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    _getNotificationIcon(notification['type']),
                    color: _getNotificationColor(notification['type']),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              notification['title'],
                              style: TextStyle(
                                fontWeight: notification['read'] ? FontWeight.normal : FontWeight.bold,
                              ),
                            ),
                          ),
                          if (!notification['read'])
                            Container(
                              width: 8,
                              height: 8,
                              decoration: const BoxDecoration(
                                color: Colors.blue,
                                shape: BoxShape.circle,
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        notification['message'],
                        style: const TextStyle(fontSize: 14, color: Colors.grey),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _formatDate(notification['createdAt']),
                        style: const TextStyle(fontSize: 12, color: Colors.grey),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Color _getNotificationColor(String type) {
    switch (type) {
      case 'info':
        return Colors.blue;
      case 'warning':
        return Colors.orange;
      case 'success':
        return Colors.green;
      case 'error':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  IconData _getNotificationIcon(String type) {
    switch (type) {
      case 'info':
        return Icons.info_outline;
      case 'warning':
        return Icons.warning_outlined;
      case 'success':
        return Icons.check_circle_outline;
      case 'error':
        return Icons.error_outline;
      default:
        return Icons.notifications_outlined;
    }
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inMinutes < 60) {
      return 'منذ ${difference.inMinutes} دقيقة';
    } else if (difference.inHours < 24) {
      return 'منذ ${difference.inHours} ساعة';
    } else if (difference.inDays < 7) {
      return 'منذ ${difference.inDays} يوم';
    } else {
      return '${date.day}/${date.month}/${date.year}';
    }
  }
}
