import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import '../utils/logger.dart';

class NotificationService {
  static final FlutterLocalNotificationsPlugin _notificationsPlugin =
      FlutterLocalNotificationsPlugin();

  static Future<void> init(FlutterLocalNotificationsPlugin plugin) async {
    try {
      // Initialize Android settings
      const AndroidInitializationSettings initializationSettingsAndroid =
          AndroidInitializationSettings('@mipmap/ic_launcher');

      // Initialize iOS settings
      const DarwinInitializationSettings initializationSettingsIOS =
          DarwinInitializationSettings(
        requestAlertPermission: true,
        requestBadgePermission: true,
        requestSoundPermission: true,
      );

      // Initialize settings
      const InitializationSettings initializationSettings =
          InitializationSettings(
        android: initializationSettingsAndroid,
        iOS: initializationSettingsIOS,
      );

      // Initialize the plugin
      await plugin.initialize(
        initializationSettings,
        onDidReceiveNotificationResponse: _onNotificationTapped,
      );

      // Create notification channel for Android
      const AndroidNotificationChannel channel = AndroidNotificationChannel(
        'garage_go_notifications',
        'Garage Go Notifications',
        description: 'Notifications for bookings and updates',
        importance: Importance.high,
        enableVibration: true,
        playSound: true,
      );

      await plugin
          .resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>()
          ?.createNotificationChannel(channel);

      Logger.info('Notification service initialized successfully');
    } catch (e) {
      Logger.error('Failed to initialize notification service', e);
    }
  }

  static void _onNotificationTapped(NotificationResponse response) {
    try {
      Logger.info('Notification tapped: ${response.payload}');
      // Handle navigation based on notification payload
      _handleNotificationNavigation(response.payload);
    } catch (e) {
      Logger.error('Failed to handle notification tap', e);
    }
  }

  static void _handleNotificationNavigation(String? payload) {
    if (payload == null) return;

    try {
      final data = jsonDecode(payload) as Map<String, dynamic>;
      final type = data['type'] as String?;
      final id = data['id'] as String?;

      Logger.navigation('Navigating from notification: $type, $id');

      // Navigation logic will be handled by the router
      // This will be implemented with the navigation service
    } catch (e) {
      Logger.error('Failed to parse notification payload', e);
    }
  }

  static Future<void> showNotification({
    required String title,
    required String body,
    String? payload,
    String? imageUrl,
    NotificationDetails? notificationDetails,
  }) async {
    try {
      final details = notificationDetails ?? _getDefaultNotificationDetails();

      if (imageUrl != null && imageUrl.isNotEmpty) {
        // Show notification with image (Big Picture Style)
        final bigPictureStyleInformation = BigPictureStyleInformation(
          FilePathAndroidBitmap(imageUrl),
          contentTitle: title,
          htmlFormatContentTitle: true,
          summaryText: body,
        );

        final androidDetails = AndroidNotificationDetails(
          'garage_go_notifications',
          'Garage Go Notifications',
          channelDescription: 'Notifications for bookings and updates',
          importance: Importance.high,
          priority: Priority.high,
          showWhen: true,
          styleInformation: bigPictureStyleInformation,
        );

        final detailsWithImage = NotificationDetails(
          android: androidDetails,
          iOS: const DarwinNotificationDetails(),
        );

        await _notificationsPlugin.show(
          DateTime.now().millisecondsSinceEpoch.remainder(100000),
          title,
          body,
          detailsWithImage,
          payload: payload,
        );
      } else {
        // Show regular notification
        await _notificationsPlugin.show(
          DateTime.now().millisecondsSinceEpoch.remainder(100000),
          title,
          body,
          details,
          payload: payload,
        );
      }

      Logger.notification('Notification shown: $title');
    } catch (e) {
      Logger.error('Failed to show notification', e);
    }
  }

  static Future<void> showBookingNotification({
    required String garageName,
    required String serviceTitle,
    required DateTime scheduledAt,
    required String bookingId,
    String type = 'created', // created, confirmed, cancelled, completed
  }) async {
    final titles = {
      'created': 'Booking Created',
      'confirmed': 'Booking Confirmed',
      'cancelled': 'Booking Cancelled',
      'completed': 'Service Completed',
    };

    final bodies = {
      'created': 'Your booking for $serviceTitle at $garageName has been created.',
      'confirmed': 'Your booking for $serviceTitle at $garageName has been confirmed.',
      'cancelled': 'Your booking for $serviceTitle at $garageName has been cancelled.',
      'completed': 'Your service $serviceTitle at $garageName has been completed.',
    };

    final title = titles[type] ?? 'Booking Update';
    final body = bodies[type] ?? 'Your booking has been updated.';

    await showNotification(
      title: title,
      body: body,
      payload: jsonEncode({
        'type': 'booking',
        'id': bookingId,
        'action': type,
      }),
    );
  }

  static Future<void> showPaymentNotification({
    required String garageName,
    required double amount,
    required String invoiceId,
  }) async {
    await showNotification(
      title: 'Payment Received',
      body: 'Your payment of \$${amount.toStringAsFixed(2)} for $garageName has been received.',
      payload: jsonEncode({
        'type': 'payment',
        'id': invoiceId,
      }),
    );
  }

  static Future<void> showInvoiceNotification({
    required String garageName,
    required double amount,
    required DateTime dueDate,
    required String invoiceId,
  }) async {
    await showNotification(
      title: 'Invoice Issued',
      body: 'A new invoice of \$${amount.toStringAsFixed(2)} from $garageName is due on ${dueDate.toString().split(' ')[0]}.',
      payload: jsonEncode({
        'type': 'invoice',
        'id': invoiceId,
      }),
    );
  }

  static Future<void> showMaintenanceNotification({
    required String vehiclePlate,
    required DateTime nextServiceDate,
    required String vehicleId,
  }) async {
    await showNotification(
      title: 'Maintenance Due',
      body: 'Your vehicle $vehiclePlate is due for maintenance on ${nextServiceDate.toString().split(' ')[0]}.',
      payload: jsonEncode({
        'type': 'maintenance',
        'id': vehicleId,
      }),
    );
  }

  static Future<void> showGarageUpdateNotification({
    required String garageName,
    required String update,
    required String garageId,
  }) async {
    await showNotification(
      title: 'Garage Update',
      body: '$garageName: $update',
      payload: jsonEncode({
        'type': 'garage_update',
        'id': garageId,
      }),
    );
  }

  static Future<void> showSystemNotification({
    required String title,
    required String message,
  }) async {
    await showNotification(
      title: title,
      body: message,
      payload: jsonEncode({
        'type': 'system',
      }),
    );
  }

  static Future<void> cancelNotification(int id) async {
    try {
      await _notificationsPlugin.cancel(id);
      Logger.notification('Notification cancelled: $id');
    } catch (e) {
      Logger.error('Failed to cancel notification', e);
    }
  }

  static Future<void> cancelAllNotifications() async {
    try {
      await _notificationsPlugin.cancelAll();
      Logger.notification('All notifications cancelled');
    } catch (e) {
      Logger.error('Failed to cancel all notifications', e);
    }
  }

  static Future<List<PendingNotificationRequest>> getPendingNotifications() async {
    try {
      final notifications = await _notificationsPlugin.pendingNotificationRequests();
      Logger.notification('Pending notifications count: ${notifications.length}');
      return notifications;
    } catch (e) {
      Logger.error('Failed to get pending notifications', e);
      return [];
    }
  }

  static Future<void> scheduleNotification({
    required int id,
    required String title,
    required String body,
    required DateTime scheduledTime,
    String? payload,
  }) async {
    try {
      // Schedule via simple delayed show
      final delay = scheduledTime.difference(DateTime.now());
      if (delay.isNegative) return;
      await Future.delayed(delay);
      await _notificationsPlugin.show(
        id,
        title,
        body,
        _getDefaultNotificationDetails(),
        payload: payload,
      );

      Logger.notification('Notification scheduled: $title at $scheduledTime');
    } catch (e) {
      Logger.error('Failed to schedule notification', e);
    }
  }

  static Future<void> schedulePeriodicNotification({
    required int id,
    required String title,
    required String body,
    required RepeatInterval repeatInterval,
    String? payload,
  }) async {
    try {
      await _notificationsPlugin.periodicallyShow(
        id,
        title,
        body,
        repeatInterval,
        _getDefaultNotificationDetails(),
        androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
        payload: payload,
      );

      Logger.notification('Periodic notification scheduled: $title');
    } catch (e) {
      Logger.error('Failed to schedule periodic notification', e);
    }
  }

  static NotificationDetails _getDefaultNotificationDetails() {
    const androidDetails = AndroidNotificationDetails(
      'garage_go_notifications',
      'Garage Go Notifications',
      channelDescription: 'Notifications for bookings and updates',
      importance: Importance.high,
      priority: Priority.high,
      showWhen: true,
      enableVibration: true,
      playSound: true,
    );

    const iOSDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    return const NotificationDetails(
      android: androidDetails,
      iOS: iOSDetails,
    );
  }

  static Future<bool> hasPermission() async {
    try {
      final androidPlugin = _notificationsPlugin.resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin>();
      
      if (androidPlugin != null) {
        final result = await androidPlugin.areNotificationsEnabled();
        return result ?? false;
      }

      final iOSPlugin = _notificationsPlugin.resolvePlatformSpecificImplementation<
          IOSFlutterLocalNotificationsPlugin>();
      
      if (iOSPlugin != null) {
        final settings = await iOSPlugin.requestPermissions(
          alert: true,
          badge: true,
          sound: true,
        );
        return settings ?? false;
      }

      return false;
    } catch (e) {
      Logger.error('Failed to check notification permissions', e);
      return false;
    }
  }

  static Future<bool> requestPermission() async {
    try {
      final androidPlugin = _notificationsPlugin.resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin>();
      
      if (androidPlugin != null) {
        final result = await androidPlugin.requestNotificationsPermission();
        Logger.notification('Notification permission requested: $result');
        return result ?? false;
      }

      final iOSPlugin = _notificationsPlugin.resolvePlatformSpecificImplementation<
          IOSFlutterLocalNotificationsPlugin>();
      
      if (iOSPlugin != null) {
        final settings = await iOSPlugin.requestPermissions(
          alert: true,
          badge: true,
          sound: true,
        );
        Logger.notification('Notification permission requested: $settings');
        return settings ?? false;
      }

      return false;
    } catch (e) {
      Logger.error('Failed to request notification permissions', e);
      return false;
    }
  }
}
