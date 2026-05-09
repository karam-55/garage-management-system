import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../providers/booking_provider.dart';

class BookingDetailsPage extends ConsumerStatefulWidget {
  final String bookingId;

  const BookingDetailsPage({
    super.key,
    required this.bookingId,
  });

  @override
  ConsumerState<BookingDetailsPage> createState() => _BookingDetailsPageState();
}

class _BookingDetailsPageState extends ConsumerState<BookingDetailsPage> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(bookingProvider.notifier).loadBookingById(widget.bookingId));
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(bookingProvider);
    final details = state.selectedBooking;
    final booking = details?.booking;

    return Scaffold(
      appBar: AppBar(title: const Text('تفاصيل الحجز')),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : state.error != null
              ? _MessageState(
                  icon: Icons.error_outline,
                  message: 'تعذر تحميل تفاصيل الحجز',
                  actionText: 'إعادة المحاولة',
                  onPressed: () => ref.read(bookingProvider.notifier).loadBookingById(widget.bookingId),
                )
              : booking == null
                  ? const _MessageState(icon: Icons.event_busy, message: 'لم يتم العثور على الحجز')
                  : ListView(
                      padding: EdgeInsets.all(20.w),
                      children: [
                        Icon(Icons.calendar_today, size: 72.sp, color: Theme.of(context).colorScheme.primary),
                        SizedBox(height: 16.h),
                        Text(
                          'حجز ${_statusText(booking.status)}',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 24.sp, fontWeight: FontWeight.bold),
                        ),
                        SizedBox(height: 24.h),
                        _InfoTile(label: 'الورشة', value: details?.garage?.name),
                        _InfoTile(label: 'السيارة', value: details?.vehicle?.displayName),
                        _InfoTile(label: 'الخدمة', value: details?.service?.title),
                        _InfoTile(label: 'التاريخ والوقت', value: _formatDateTime(booking.scheduledAt)),
                        _InfoTile(label: 'الحالة', value: _statusText(booking.status)),
                        _InfoTile(label: 'السعر', value: booking.price == null ? null : booking.price!.toStringAsFixed(0)),
                        _InfoTile(label: 'ملاحظات', value: booking.notes),
                        if (!booking.isCancelled && !booking.isCompleted) ...[
                          SizedBox(height: 20.h),
                          OutlinedButton.icon(
                            onPressed: () async {
                              await ref.read(bookingProvider.notifier).cancelBooking(booking.id);
                              if (context.mounted) Navigator.of(context).pop(true);
                            },
                            icon: const Icon(Icons.cancel_outlined),
                            label: const Text('إلغاء الحجز'),
                          ),
                        ],
                      ],
                    ),
    );
  }

  String _formatDateTime(DateTime date) {
    final hour = date.hour.toString().padLeft(2, '0');
    final minute = date.minute.toString().padLeft(2, '0');
    return '${date.day}/${date.month}/${date.year} - $hour:$minute';
  }

  String _statusText(String status) {
    switch (status) {
      case 'PENDING':
        return 'قيد الانتظار';
      case 'CONFIRMED':
        return 'مؤكد';
      case 'IN_PROGRESS':
        return 'قيد التنفيذ';
      case 'COMPLETED':
        return 'مكتمل';
      case 'CANCELLED':
        return 'ملغي';
      default:
        return status;
    }
  }
}

class _InfoTile extends StatelessWidget {
  final String label;
  final String? value;

  const _InfoTile({required this.label, this.value});

  @override
  Widget build(BuildContext context) {
    final displayValue = value == null || value!.trim().isEmpty || value == 'N/A' ? 'غير محدد' : value!;
    return Card(child: ListTile(title: Text(label), subtitle: Text(displayValue)));
  }
}

class _MessageState extends StatelessWidget {
  final IconData icon;
  final String message;
  final String? actionText;
  final VoidCallback? onPressed;

  const _MessageState({required this.icon, required this.message, this.actionText, this.onPressed});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(24.w),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 64.sp, color: Theme.of(context).colorScheme.primary),
            SizedBox(height: 16.h),
            Text(message, textAlign: TextAlign.center, style: TextStyle(fontSize: 16.sp)),
            if (actionText != null && onPressed != null) ...[
              SizedBox(height: 16.h),
              ElevatedButton(onPressed: onPressed, child: Text(actionText!)),
            ],
          ],
        ),
      ),
    );
  }
}

