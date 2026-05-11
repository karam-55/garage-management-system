import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/app_theme.dart';
import '../../models/booking.dart';
import '../../services/booking_service.dart';
import '../../services/notification_service.dart';

class MechanicTaskDetailScreen extends ConsumerStatefulWidget {
  final Booking booking;
  final VoidCallback onUpdated;

  const MechanicTaskDetailScreen({
    super.key,
    required this.booking,
    required this.onUpdated,
  });

  @override
  ConsumerState<MechanicTaskDetailScreen> createState() => _MechanicTaskDetailScreenState();
}

class _MechanicTaskDetailScreenState extends ConsumerState<MechanicTaskDetailScreen> {
  final _service = BookingService();
  bool _updating = false;
  final _notesController = TextEditingController();

  String _statusText(String status) {
    switch (status) {
      case 'RECEIVED': return 'مستلمة';
      case 'INSPECTION': return 'فحص';
      case 'IN_PROGRESS': return 'قيد العمل';
      case 'WAITING_APPROVAL': return 'بانتظار الموافقة';
      case 'DONE': return 'مكتملة';
      case 'CANCELLED': return 'ملغاة';
      default: return status;
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'RECEIVED': return AppColors.info;
      case 'INSPECTION': return AppColors.accentPurple;
      case 'IN_PROGRESS': return AppColors.warning;
      case 'WAITING_APPROVAL': return AppColors.accentOrange;
      case 'DONE': return AppColors.success;
      case 'CANCELED': return AppColors.error;
      default: return AppColors.textMuted;
    }
  }

  String _nextStatus(String current) {
    switch (current) {
      case 'RECEIVED': return 'INSPECTION';
      case 'INSPECTION': return 'IN_PROGRESS';
      case 'IN_PROGRESS': return 'WAITING_APPROVAL';
      case 'WAITING_APPROVAL': return 'DONE';
      default: return current;
    }
  }

  String _nextStatusText(String current) {
    switch (current) {
      case 'RECEIVED': return 'بدء الفحص';
      case 'INSPECTION': return 'بدء العمل';
      case 'IN_PROGRESS': return 'إرسال للموافقة';
      case 'WAITING_APPROVAL': return 'إنهاء المهمة';
      default: return 'تحديث';
    }
  }

  IconData _nextStatusIcon(String current) {
    switch (current) {
      case 'RECEIVED': return Icons.search;
      case 'INSPECTION': return Icons.build;
      case 'IN_PROGRESS': return Icons.check_circle;
      case 'WAITING_APPROVAL': return Icons.done_all;
      default: return Icons.update;
    }
  }

  Future<void> _updateStatus() async {
    if (_updating) return;
    setState(() => _updating = true);

    final next = _nextStatus(widget.booking.status);
    try {
      final updated = Booking(
        id: widget.booking.id,
        vehicleId: widget.booking.vehicleId,
        technicianId: widget.booking.technicianId,
        serviceDescription: widget.booking.serviceDescription,
        status: next,
        scheduledDate: widget.booking.scheduledDate,
        createdAt: widget.booking.createdAt,
        updatedAt: DateTime.now(),
      );
      await _service.updateBooking(widget.booking.id, updated);
      showSuccessToast(context, 'تم تحديث الحالة إلى: ${_statusText(next)}');
      widget.onUpdated();
      Navigator.pop(context);
    } catch (e) {
      showErrorToast(context, 'خطأ: $e');
    } finally {
      setState(() => _updating = false);
    }
  }

  Future<void> _addNotes() async {
    if (_notesController.text.trim().isEmpty) return;
    // Notes functionality - would need backend support
    showInfoToast(context, 'سيتم إضافة الملاحظات لاحقاً');
    _notesController.clear();
  }

  @override
  Widget build(BuildContext context) {
    final booking = widget.booking;
    final isDone = booking.status == 'DONE' || booking.status == 'CANCELLED';

    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      appBar: AppBar(
        backgroundColor: AppColors.bgPrimary,
        elevation: 0,
        title: Text('تفاصيل المهمة', style: AppTypography.headingSmall),
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    _statusColor(booking.status).withOpacity(0.8),
                    _statusColor(booking.status).withOpacity(0.5),
                  ],
                ),
                borderRadius: AppBorders.radiusXl,
              ),
              child: Column(
                children: [
                  Text(_statusText(booking.status),
                    style: AppTypography.headingMedium.copyWith(
                      color: Colors.white, fontSize: 24)),
                  const SizedBox(height: 8),
                  Text('الحالة الحالية', style: AppTypography.bodyMedium.copyWith(
                    color: Colors.white.withOpacity(0.8))),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Service Info
            _buildSection('معلومات الخدمة', [
              _buildInfoRow(Icons.build_outlined, 'الخدمة', booking.serviceDescription),
              _buildInfoRow(Icons.directions_car_outlined, 'معرف السيارة', booking.vehicleId),
              _buildInfoRow(Icons.calendar_today_outlined, 'التاريخ',
                '${booking.scheduledDate.day}/${booking.scheduledDate.month}/${booking.scheduledDate.year}'),
            ]),
            const SizedBox(height: 24),

            // Notes Section
            if (!isDone) ...[
              Text('ملاحظات', style: AppTypography.headingSmall.copyWith(fontSize: 16)),
              const SizedBox(height: 12),
              TextField(
                controller: _notesController,
                maxLines: 3,
                style: AppTypography.bodyMedium,
                decoration: InputDecoration(
                  hintText: 'أضف ملاحظات عن العمل...',
                  hintStyle: AppTypography.bodyMedium.copyWith(color: AppColors.textMuted),
                  filled: true,
                  fillColor: AppColors.bgCard,
                  border: OutlineInputBorder(
                    borderRadius: AppBorders.radiusMd,
                    borderSide: BorderSide(color: AppColors.border.withOpacity(0.3)),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: TextButton.icon(
                  onPressed: _addNotes,
                  icon: Icon(Icons.add, color: AppColors.primary),
                  label: Text('إضافة ملاحظة', style: AppTypography.labelMedium.copyWith(
                    color: AppColors.primary)),
                ),
              ),
              const SizedBox(height: 24),
            ],

            // Status Timeline
            Text('مسار المهمة', style: AppTypography.headingSmall.copyWith(fontSize: 16)),
            const SizedBox(height: 16),
            _buildTimeline(booking.status),
            const SizedBox(height: 32),

            // Action Button
            if (!isDone)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _updating ? null : _updateStatus,
                  icon: _updating
                      ? const SizedBox(width: 20, height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : Icon(_nextStatusIcon(booking.status), color: Colors.white),
                  label: Text(_nextStatusText(booking.status),
                    style: AppTypography.labelLarge.copyWith(color: Colors.white)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: AppBorders.radiusLg),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: AppTypography.headingSmall.copyWith(fontSize: 16)),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.bgCard,
            borderRadius: AppBorders.radiusLg,
            border: Border.all(color: AppColors.border.withOpacity(0.2)),
          ),
          child: Column(children: children),
        ),
      ],
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.primary),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: AppTypography.labelSmall.copyWith(
                  color: AppColors.textMuted)),
                const SizedBox(height: 2),
                Text(value, style: AppTypography.bodyMedium),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimeline(String currentStatus) {
    final statuses = ['RECEIVED', 'INSPECTION', 'IN_PROGRESS', 'WAITING_APPROVAL', 'DONE'];
    final labels = ['استلام', 'فحص', 'عمل', 'موافقة', 'إنجاز'];
    final currentIndex = statuses.indexOf(currentStatus);

    return Row(
      children: List.generate(statuses.length, (index) {
        final isCompleted = index <= currentIndex;
        final isCurrent = index == currentIndex;
        return Expanded(
          child: Column(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: isCompleted ? AppColors.success : AppColors.bgTertiary,
                  shape: BoxShape.circle,
                  border: isCurrent ? Border.all(color: AppColors.primary, width: 3) : null,
                ),
                child: isCompleted
                    ? Icon(Icons.check, size: 18, color: Colors.white)
                    : null,
              ),
              const SizedBox(height: 8),
              Text(labels[index], style: AppTypography.labelSmall.copyWith(
                color: isCompleted ? AppColors.success : AppColors.textMuted,
                fontWeight: isCurrent ? FontWeight.w700 : FontWeight.w400,
              )),
            ],
          ),
        );
      }),
    );
  }
}
