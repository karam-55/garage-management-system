import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/booking.dart';
import '../../state/booking_provider.dart';
import '../../services/notification_service.dart';

class BookingsScreen extends ConsumerStatefulWidget {
  const BookingsScreen({super.key});

  @override
  ConsumerState<BookingsScreen> createState() => _BookingsScreenState();
}

class _BookingsScreenState extends ConsumerState<BookingsScreen> {
  String _selectedStatus = 'ALL';

  Color _getStatusColor(String status) {
    switch (status) {
      case 'PENDING': return Colors.orange;
      case 'IN_PROGRESS': return Colors.blue;
      case 'COMPLETED': return Colors.green;
      case 'CANCELLED': return Colors.red;
      default: return Colors.grey;
    }
  }

  String _getStatusText(String status) {
    switch (status) {
      case 'PENDING': return 'معلق';
      case 'IN_PROGRESS': return 'قيد العمل';
      case 'COMPLETED': return 'مكتمل';
      case 'CANCELLED': return 'ملغي';
      default: return status;
    }
  }

  @override
  Widget build(BuildContext context) {
    final bookingsAsync = ref.watch(bookingsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('الحجوزات'),
        backgroundColor: Colors.purple,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(bookingsProvider),
          ),
        ],
      ),
      body: Column(
        children: [
          // Status Filter
          Container(
            height: 50,
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 8),
              children: [
                _buildFilterChip('ALL', 'الكل'),
                _buildFilterChip('PENDING', 'معلق'),
                _buildFilterChip('IN_PROGRESS', 'قيد العمل'),
                _buildFilterChip('COMPLETED', 'مكتمل'),
                _buildFilterChip('CANCELLED', 'ملغي'),
              ],
            ),
          ),

          // Bookings List
          Expanded(
            child: bookingsAsync.when(
              data: (bookings) {
                final filtered = _selectedStatus == 'ALL'
                    ? bookings
                    : bookings.where((b) => b.status == _selectedStatus).toList();
                
                if (filtered.isEmpty) {
                  return const Center(child: Text('لا توجد حجوزات'));
                }
                
                return ListView.builder(
                  padding: const EdgeInsets.all(8),
                  itemCount: filtered.length,
                  itemBuilder: (context, index) {
                    final booking = filtered[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                      child: ListTile(
                        leading: Container(
                          width: 12,
                          height: 12,
                          decoration: BoxDecoration(
                            color: _getStatusColor(booking.status),
                            shape: BoxShape.circle,
                          ),
                        ),
                        title: Text(booking.serviceDescription, style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text('التاريخ: ${_formatDate(booking.scheduledDate)}'),
                        trailing: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: _getStatusColor(booking.status).withOpacity(0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            _getStatusText(booking.status),
                            style: TextStyle(
                              color: _getStatusColor(booking.status),
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        onTap: () => _showStatusUpdateDialog(booking),
                      ),
                    );
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (error, stack) => Center(child: Text('خطأ: $error')),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddDialog,
        backgroundColor: Colors.purple,
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildFilterChip(String status, String label) {
    final isSelected = _selectedStatus == status;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (selected) {
          setState(() {
            _selectedStatus = status;
          });
        },
        selectedColor: Colors.purple.withOpacity(0.2),
        checkmarkColor: Colors.purple,
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  void _showAddDialog() {
    final vehicleIdController = TextEditingController();
    final descController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('حجز جديد'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: vehicleIdController, decoration: const InputDecoration(labelText: 'رقم السيارة')),
              TextField(controller: descController, decoration: const InputDecoration(labelText: 'وصف الخدمة')),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('إلغاء')),
          ElevatedButton(
            onPressed: () async {
              try {
                await ref.read(bookingServiceProvider).createBooking(
                  Booking(
                    id: '',
                    vehicleId: vehicleIdController.text,
                    serviceDescription: descController.text,
                    scheduledDate: DateTime.now(),
                    createdAt: DateTime.now(),
                    updatedAt: DateTime.now(),
                  ),
                );
                ref.invalidate(bookingsProvider);
                Navigator.pop(context);
                showSuccessToast(context, 'تم إنشاء الحجز بنجاح!');
              } catch (e) {
                showErrorToast(context, 'خطأ: $e');
              }
            },
            child: const Text('حفظ'),
          ),
        ],
      ),
    );
  }

  void _showStatusUpdateDialog(Booking booking) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('تحديث الحالة'),
        content: Text('الحالة الحالية: ${_getStatusText(booking.status)}'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('إلغاء')),
          if (booking.status == 'PENDING')
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.blue),
              onPressed: () => _updateStatus(booking, 'IN_PROGRESS'),
              child: const Text('بدء العمل'),
            ),
          if (booking.status == 'IN_PROGRESS')
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
              onPressed: () => _updateStatus(booking, 'COMPLETED'),
              child: const Text('إكمال'),
            ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () => _updateStatus(booking, 'CANCELLED'),
            child: const Text('إلغاء'),
          ),
        ],
      ),
    );
  }

  Future<void> _updateStatus(Booking booking, String newStatus) async {
    try {
      await ref.read(bookingServiceProvider).updateBooking(
        booking.id,
        Booking(
          id: booking.id,
          vehicleId: booking.vehicleId,
          technicianId: booking.technicianId,
          serviceDescription: booking.serviceDescription,
          status: newStatus,
          scheduledDate: booking.scheduledDate,
          createdAt: booking.createdAt,
          updatedAt: DateTime.now(),
        ),
      );
      ref.invalidate(bookingsProvider);
      Navigator.pop(context);
      showSuccessToast(context, 'تم تحديث الحالة بنجاح!');
    } catch (e) {
      showErrorToast(context, 'خطأ: $e');
    }
  }
}
