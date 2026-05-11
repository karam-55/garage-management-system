import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../utils/api_config.dart';

final dashboardStatsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final dio = Dio(BaseOptions(baseUrl: ApiConfig.baseUrl));
  
  // Fetch all data in parallel
  final results = await Future.wait([
    dio.get('/customers'),
    dio.get('/vehicles'),
    dio.get('/bookings'),
    dio.get('/invoices'),
  ]);
  
  final customers = results[0].data as List;
  final vehicles = results[1].data as List;
  final bookings = results[2].data as List;
  final invoices = results[3].data as List;
  
  // Calculate stats
  final today = DateTime.now();
  final todayBookings = bookings.where((b) {
    final date = DateTime.parse(b['createdAt']);
    return date.day == today.day && date.month == today.month && date.year == today.year;
  }).toList();
  
  final totalRevenue = invoices.fold(0.0, (sum, inv) => sum + (inv['amount'] ?? 0.0));
  final paidInvoices = invoices.where((inv) => inv['isPaid'] == true).toList();
  final pendingInvoices = invoices.where((inv) => inv['isPaid'] == false).toList();
  
  final inProgressBookings = bookings.where((b) => b['status'] == 'IN_PROGRESS').toList();
  final completedToday = bookings.where((b) {
    if (b['status'] != 'COMPLETED') return false;
    final date = DateTime.parse(b['updatedAt']);
    return date.day == today.day && date.month == today.month && date.year == today.year;
  }).toList();
  
  return {
    'totalCustomers': customers.length,
    'totalVehicles': vehicles.length,
    'totalBookings': bookings.length,
    'todayBookings': todayBookings.length,
    'inProgress': inProgressBookings.length,
    'completedToday': completedToday.length,
    'totalRevenue': totalRevenue,
    'paidInvoices': paidInvoices.length,
    'pendingInvoices': pendingInvoices.length,
    'pendingAmount': pendingInvoices.fold(0.0, (sum, inv) => sum + (inv['amount'] ?? 0.0)),
  };
});

final recentActivityProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final dio = Dio(BaseOptions(baseUrl: ApiConfig.baseUrl));
  
  final bookingsResponse = await dio.get('/bookings?limit=5');
  final bookings = bookingsResponse.data as List;
  
  return bookings.map((b) => {
    'type': 'booking',
    'title': 'حجز جديد',
    'description': b['serviceDescription'] ?? 'صيانة',
    'status': b['status'],
    'time': b['createdAt'],
    'icon': Icons.calendar_today,
    'color': Colors.purple,
  }).toList();
});
