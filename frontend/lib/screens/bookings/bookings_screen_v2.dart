import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../core/app_theme.dart';
import '../../models/booking.dart';
import '../../models/vehicle.dart';
import '../../state/booking_provider.dart';
import '../../state/vehicle_provider.dart';
import '../../services/notification_service.dart';
import 'reception_screen.dart';

class BookingsScreenV2 extends ConsumerStatefulWidget {
  const BookingsScreenV2({super.key});

  @override
  ConsumerState<BookingsScreenV2> createState() => _BookingsScreenV2State();
}

class _BookingsScreenV2State extends ConsumerState<BookingsScreenV2> {
  String _searchQuery = '';
  String _filterStatus = 'ALL';

  Color _getStatusColor(String status) {
    switch (status) {
      case 'PENDING': return AppColors.warning;
      case 'IN_PROGRESS': return AppColors.accentBlue;
      case 'COMPLETED': return AppColors.success;
      case 'CANCELLED': return AppColors.error;
      default: return AppColors.textMuted;
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

    return Container(
      color: AppColors.bgPrimary,
      child: Column(
        children: [
          _buildHeader(),
          _buildFilters(),
          Expanded(
            child: bookingsAsync.when(
              data: (bookings) => _buildContent(bookings),
              loading: () => _buildLoadingState(),
              error: (_, __) => _buildErrorState(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('الحجوزات', style: AppTypography.displaySmall.copyWith(fontSize: 28)),
                const SizedBox(height: 4),
                Text('إدارة حجوزات الصيانة والخدمات', style: AppTypography.bodyLarge),
              ],
            ),
          ),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              GestureDetector(
                onTap: _openReceptionScreen,
                child: AnimatedContainer(
                  duration: AppAnimations.normal,
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  decoration: BoxDecoration(
                    color: AppColors.success.withOpacity(0.15),
                    borderRadius: AppBorders.radiusMd,
                    border: Border.all(color: AppColors.success.withOpacity(0.4)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.person_add_outlined, color: AppColors.success, size: 20),
                      const SizedBox(width: 8),
                      Text('استقبال عميل', style: AppTypography.labelLarge.copyWith(
                        color: AppColors.success, fontSize: 13)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              GestureDetector(
                onTap: () => _showAddDialog(),
                child: AnimatedContainer(
                  duration: AppAnimations.normal,
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: AppColors.gradientPrimary,
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: AppBorders.radiusMd,
                    boxShadow: [AppShadows.glow(AppColors.primary)],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.add, color: Colors.white, size: 20),
                      const SizedBox(width: 8),
                      Text('حجز جديد', style: AppTypography.labelLarge.copyWith(
                        color: Colors.white, fontSize: 13)),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFilters() {
    final filters = [
      {'label': 'الكل', 'value': 'ALL'},
      {'label': 'معلق', 'value': 'PENDING'},
      {'label': 'قيد العمل', 'value': 'IN_PROGRESS'},
      {'label': 'مكتمل', 'value': 'COMPLETED'},
      {'label': 'ملغي', 'value': 'CANCELLED'},
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32),
      child: Row(
        children: [
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: AppColors.bgSecondary,
                borderRadius: AppBorders.radiusLg,
                border: Border.all(color: AppColors.border.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  Icon(Icons.search, size: 20, color: AppColors.textMuted),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      style: AppTypography.bodyMedium,
                      decoration: InputDecoration(
                        hintText: 'بحث في الحجوزات...',
                        hintStyle: AppTypography.bodyMedium.copyWith(
                          color: AppColors.textMuted),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                      onChanged: (v) => setState(() => _searchQuery = v),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 16),
          ...filters.map((f) {
            final isActive = _filterStatus == f['value'];
            return Padding(
              padding: const EdgeInsets.only(left: 8),
              child: GestureDetector(
                onTap: () => setState(() => _filterStatus = f['value']!),
                child: AnimatedContainer(
                  duration: AppAnimations.fast,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: isActive ? AppColors.primary.withOpacity(0.15) : AppColors.bgSecondary,
                    borderRadius: AppBorders.radiusFull,
                    border: isActive ? Border.all(color: AppColors.primary.withOpacity(0.3)) : null,
                  ),
                  child: Text(
                    f['label']!,
                    style: AppTypography.labelSmall.copyWith(
                      color: isActive ? AppColors.primary : AppColors.textSecondary,
                      fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildContent(List<Booking> bookings) {
    final filtered = bookings.where((b) {
      if (_filterStatus != 'ALL' && b.status != _filterStatus) return false;
      if (_searchQuery.isEmpty) return true;
      final q = _searchQuery.toLowerCase();
      return b.serviceDescription.toLowerCase().contains(q);
    }).toList();

    return Padding(
      padding: const EdgeInsets.all(32),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.bgCard,
          borderRadius: AppBorders.radiusXl,
          border: Border.all(color: AppColors.border.withOpacity(0.3)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              decoration: BoxDecoration(
                color: AppColors.bgSecondary,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: Row(
                children: [
                  Text('قائمة الحجوزات', style: AppTypography.headingSmall.copyWith(fontSize: 15)),
                  const Spacer(),
                  Text('${filtered.length} حجز', style: AppTypography.bodySmall),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.bgSecondary.withOpacity(0.5),
                border: Border(
                  bottom: BorderSide(color: AppColors.border.withOpacity(0.3)),
                ),
              ),
              child: Row(
                children: [
                  Expanded(flex: 3, child: Text('الخدمة', style: AppTypography.labelSmall)),
                  Expanded(flex: 2, child: Text('السيارة', style: AppTypography.labelSmall)),
                  Expanded(flex: 2, child: Text('التاريخ', style: AppTypography.labelSmall)),
                  Expanded(flex: 1, child: Text('الحالة', style: AppTypography.labelSmall)),
                  SizedBox(width: 80, child: Text('إجراءات', style: AppTypography.labelSmall)),
                ],
              ),
            ),
            Expanded(
              child: filtered.isEmpty
                  ? _buildEmptyState()
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      itemCount: filtered.length,
                      itemBuilder: (context, index) {
                        return _BookingRow(
                          booking: filtered[index],
                          index: index,
                          statusColor: _getStatusColor(filtered[index].status),
                          statusText: _getStatusText(filtered[index].status),
                          onStatusChange: () => _showStatusDialog(filtered[index]),
                          onEdit: () => _showEditDialog(filtered[index]),
                          onDelete: () => _showDeleteDialog(filtered[index]),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLoadingState() => Center(
    child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        SizedBox(
          width: 48, height: 48,
          child: CircularProgressIndicator(
            strokeWidth: 3,
            valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
          ),
        ),
        const SizedBox(height: 20),
        Text('جاري التحميل...', style: AppTypography.bodyLarge),
      ],
    ),
  );

  Widget _buildErrorState() => Center(
    child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: AppColors.error.withOpacity(0.1), shape: BoxShape.circle),
          child: Icon(Icons.error_outline, size: 40, color: AppColors.error),
        ),
        const SizedBox(height: 20),
        Text('حدث خطأ في تحميل البيانات',
            style: AppTypography.bodyLarge.copyWith(color: AppColors.error)),
        const SizedBox(height: 16),
        GestureDetector(
          onTap: () => ref.invalidate(bookingsProvider),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.15),
              borderRadius: AppBorders.radiusMd,
              border: Border.all(color: AppColors.primary.withOpacity(0.3)),
            ),
            child: Text('إعادة المحاولة',
                style: AppTypography.labelMedium.copyWith(color: AppColors.primary)),
          ),
        ),
      ],
    ),
  );

  Widget _buildEmptyState() => Center(
    child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: AppColors.primary.withOpacity(0.1), shape: BoxShape.circle),
          child: Icon(Icons.calendar_today_outlined,
              size: 40, color: AppColors.primary.withOpacity(0.5)),
        ),
        const SizedBox(height: 20),
        Text('لا توجد حجوزات', style: AppTypography.headingSmall),
        const SizedBox(height: 8),
        Text('أضف حجز جديد للبدء', style: AppTypography.bodyLarge),
      ],
    ),
  );

  Future<void> _openReceptionScreen() async {
    final result = await Navigator.push<bool>(
      context,
      MaterialPageRoute(builder: (_) => const ReceptionScreen()),
    );
    if (result == true) {
      ref.invalidate(bookingsProvider);
    }
  }

  void _showAddDialog() {
    final serviceController = TextEditingController();
    final vehicleIdController = TextEditingController();
    DateTime selectedDate = DateTime.now();

    _showBookingDialog(
      title: 'حجز جديد',
      serviceController: serviceController,
      vehicleIdController: vehicleIdController,
      initialDate: selectedDate,
      initialStatus: 'PENDING',
      onSave: (date, status) async {
        final newBooking = Booking(
          id: '',
          vehicleId: vehicleIdController.text,
          serviceDescription: serviceController.text,
          status: status,
          scheduledDate: date,
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
        try {
          await ref.read(bookingServiceProvider).createBooking(newBooking);
          ref.invalidate(bookingsProvider);
          showSuccessToast(context, 'تم إضافة الحجز بنجاح!');
        } catch (e) {
          showErrorToast(context, 'خطأ: \$e');
          rethrow;
        }
      },
    );
  }

  void _showEditDialog(Booking booking) {
    final serviceController = TextEditingController(text: booking.serviceDescription);
    final vehicleIdController = TextEditingController(text: booking.vehicleId);

    _showBookingDialog(
      title: 'تعديل الحجز',
      serviceController: serviceController,
      vehicleIdController: vehicleIdController,
      initialDate: booking.scheduledDate,
      initialStatus: booking.status,
      onSave: (date, status) async {
        final updated = Booking(
          id: booking.id,
          vehicleId: vehicleIdController.text,
          serviceDescription: serviceController.text,
          status: status,
          scheduledDate: date,
          createdAt: booking.createdAt,
          updatedAt: DateTime.now(),
        );
        try {
          await ref.read(bookingServiceProvider).updateBooking(booking.id, updated);
          ref.invalidate(bookingsProvider);
          showSuccessToast(context, 'تم تحديث الحجز بنجاح!');
        } catch (e) {
          showErrorToast(context, 'خطأ: \$e');
          rethrow;
        }
      },
    );
  }

  void _showStatusDialog(Booking booking) {
    final statuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        child: Container(
          constraints: const BoxConstraints(maxWidth: 360),
          decoration: BoxDecoration(
            color: AppColors.bgSecondary,
            borderRadius: AppBorders.radiusXl,
            border: Border.all(color: AppColors.border.withOpacity(0.4)),
          ),
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('تغيير الحالة', style: AppTypography.headingSmall.copyWith(fontSize: 16)),
              const SizedBox(height: 16),
              ...statuses.map((s) {
                final isActive = booking.status == s;
                return GestureDetector(
                  onTap: () async {
                    final updated = Booking(
                      id: booking.id,
                      vehicleId: booking.vehicleId,
                      serviceDescription: booking.serviceDescription,
                      status: s,
                      scheduledDate: booking.scheduledDate,
                      createdAt: booking.createdAt,
                      updatedAt: DateTime.now(),
                    );
                    try {
                      await ref.read(bookingServiceProvider).updateBooking(booking.id, updated);
                      ref.invalidate(bookingsProvider);
                      Navigator.pop(context);
                      showSuccessToast(context, 'تم تغيير الحالة!');
                    } catch (e) {
                      showErrorToast(context, 'خطأ: \$e');
                    }
                  },
                  child: AnimatedContainer(
                    duration: AppAnimations.fast,
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: isActive ? _getStatusColor(s).withOpacity(0.12) : AppColors.bgPrimary,
                      borderRadius: AppBorders.radiusMd,
                      border: Border.all(
                        color: isActive ? _getStatusColor(s).withOpacity(0.3) : AppColors.border.withOpacity(0.2),
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 12, height: 12,
                          decoration: BoxDecoration(
                            color: _getStatusColor(s),
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Text(_getStatusText(s), style: AppTypography.labelMedium),
                        const Spacer(),
                        if (isActive) Icon(Icons.check_circle, color: AppColors.primary),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ],
          ),
        ),
      ),
    );
  }

  void _showDeleteDialog(Booking booking) {
    _showConfirmDialog(
      title: 'حذف الحجز',
      message: 'هل أنت متأكد من حذف هذا الحجز؟',
      onConfirm: () async {
        try {
          await ref.read(bookingServiceProvider).deleteBooking(booking.id);
          ref.invalidate(bookingsProvider);
          Navigator.pop(context);
          showSuccessToast(context, 'تم حذف الحجز بنجاح!');
        } catch (e) {
          showErrorToast(context, 'خطأ: \$e');
        }
      },
    );
  }

  void _showBookingDialog({
    required String title,
    required TextEditingController serviceController,
    required TextEditingController vehicleIdController,
    required DateTime initialDate,
    required String initialStatus,
    required Future<void> Function(DateTime, String) onSave,
  }) {
    DateTime selectedDate = initialDate;
    String selectedStatus = initialStatus;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => Dialog(
          backgroundColor: Colors.transparent,
          child: Container(
            constraints: const BoxConstraints(maxWidth: 480),
            decoration: BoxDecoration(
              color: AppColors.bgSecondary,
              borderRadius: AppBorders.radiusXl,
              border: Border.all(color: AppColors.border.withOpacity(0.4)),
              boxShadow: [AppShadows.xl],
            ),
            child: ClipRRect(
              borderRadius: AppBorders.radiusXl,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _dialogHeader(context, title),
                  Flexible(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          _buildField('وصف الخدمة *', Icons.build_outlined, serviceController),
                          const SizedBox(height: 16),
                          _buildField('معرف السيارة *', Icons.directions_car_outlined, vehicleIdController),
                          const SizedBox(height: 16),
                          GestureDetector(
                            onTap: () async {
                              final picked = await showDatePicker(
                                context: context,
                                initialDate: selectedDate,
                                firstDate: DateTime.now().subtract(const Duration(days: 365)),
                                lastDate: DateTime.now().add(const Duration(days: 365)),
                                builder: (context, child) => Theme(
                                  data: Theme.of(context).copyWith(
                                    colorScheme: Theme.of(context).colorScheme.copyWith(
                                      primary: AppColors.primary,
                                      surface: AppColors.bgSecondary,
                                    ),
                                  ),
                                  child: child!,
                                ),
                              );
                              if (picked != null) {
                                setDialogState(() => selectedDate = picked);
                              }
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                              decoration: BoxDecoration(
                                color: AppColors.bgPrimary,
                                borderRadius: AppBorders.radiusMd,
                                border: Border.all(color: AppColors.border.withOpacity(0.3)),
                              ),
                              child: Row(
                                children: [
                                  Icon(Icons.calendar_today_outlined, size: 20, color: AppColors.textMuted),
                                  const SizedBox(width: 12),
                                  Text(
                                    '${selectedDate.year}-${selectedDate.month.toString().padLeft(2, '0')}-${selectedDate.day.toString().padLeft(2, '0')}',
                                    style: AppTypography.bodyMedium,
                                  ),
                                  const Spacer(),
                                  Icon(Icons.arrow_drop_down, color: AppColors.textTertiary),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                            decoration: BoxDecoration(
                              color: AppColors.bgPrimary,
                              borderRadius: AppBorders.radiusMd,
                              border: Border.all(color: AppColors.border.withOpacity(0.3)),
                            ),
                            child: Row(
                              children: [
                                Icon(Icons.info_outline, size: 20, color: AppColors.textMuted),
                                const SizedBox(width: 12),
                                Text('الحالة:', style: AppTypography.bodyMedium),
                                const SizedBox(width: 12),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: _getStatusColor(selectedStatus).withOpacity(0.15),
                                    borderRadius: AppBorders.radiusFull,
                                    border: Border.all(
                                      color: _getStatusColor(selectedStatus).withOpacity(0.3)),
                                  ),
                                  child: Text(
                                    _getStatusText(selectedStatus),
                                    style: AppTypography.labelSmall.copyWith(
                                      color: _getStatusColor(selectedStatus),
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  _dialogFooter(context, () async {
                    if (serviceController.text.isEmpty || vehicleIdController.text.isEmpty) return;
                    try {
                      await onSave(selectedDate, selectedStatus);
                      if (mounted) Navigator.pop(context);
                    } catch (_) {
                      // Error already shown, dialog stays open
                    }
                  }),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _showConfirmDialog({
    required String title,
    required String message,
    required VoidCallback onConfirm,
  }) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.bgSecondary,
        shape: RoundedRectangleBorder(
          borderRadius: AppBorders.radiusXl,
          side: BorderSide(color: AppColors.border.withOpacity(0.3)),
        ),
        title: Text(title, style: AppTypography.headingSmall),
        content: Text(message, style: AppTypography.bodyMedium),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('إلغاء', style: AppTypography.labelMedium.copyWith(
                color: AppColors.textTertiary)),
          ),
          GestureDetector(
            onTap: onConfirm,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              decoration: BoxDecoration(
                color: AppColors.error.withOpacity(0.15),
                borderRadius: AppBorders.radiusMd,
              ),
              child: Text('حذف', style: AppTypography.labelMedium.copyWith(
                  color: AppColors.error)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _dialogHeader(BuildContext context, String title) {
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 20, 16, 12),
      decoration: BoxDecoration(
        color: AppColors.bgTertiary.withOpacity(0.5),
        border: Border(
          bottom: BorderSide(color: AppColors.border.withOpacity(0.3)),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: AppTypography.headingSmall.copyWith(fontSize: 16)),
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.bgTertiary,
                borderRadius: AppBorders.radiusMd,
              ),
              child: Icon(Icons.close, size: 18, color: AppColors.textTertiary),
            ),
          ),
        ],
      ),
    );
  }

  Widget _dialogFooter(BuildContext context, VoidCallback onSave) {
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('إلغاء', style: AppTypography.labelMedium.copyWith(
                color: AppColors.textTertiary)),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: onSave,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: AppColors.gradientPrimary),
                borderRadius: AppBorders.radiusMd,
                boxShadow: [AppShadows.glow(AppColors.primary)],
              ),
              child: Text('حفظ', style: AppTypography.labelLarge.copyWith(
                color: Colors.white, fontSize: 13)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildField(String label, IconData icon, TextEditingController controller,
      {TextInputType? keyboardType}) {
    return TextField(
      controller: controller,
      style: AppTypography.bodyMedium,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        labelText: label,
        labelStyle: AppTypography.labelSmall.copyWith(color: AppColors.textTertiary),
        prefixIcon: Icon(icon, size: 20, color: AppColors.textMuted),
        filled: true,
        fillColor: AppColors.bgPrimary,
        border: OutlineInputBorder(
          borderRadius: AppBorders.radiusMd,
          borderSide: BorderSide(color: AppColors.border.withOpacity(0.4)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: AppBorders.radiusMd,
          borderSide: BorderSide(color: AppColors.border.withOpacity(0.3)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: AppBorders.radiusMd,
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
    );
  }
}

class _BookingRow extends StatefulWidget {
  final Booking booking;
  final int index;
  final Color statusColor;
  final String statusText;
  final VoidCallback onStatusChange;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const _BookingRow({
    required this.booking,
    required this.index,
    required this.statusColor,
    required this.statusText,
    required this.onStatusChange,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  State<_BookingRow> createState() => _BookingRowState();
}

class _BookingRowState extends State<_BookingRow>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnim;
  bool _hovered = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this, duration: const Duration(milliseconds: 400));
    _fadeAnim = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _controller, curve: AppAnimations.easeOut));
    Future.delayed(Duration(milliseconds: widget.index * 50), () {
      if (mounted) _controller.forward();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  String _formatDate(DateTime d) {
    return '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
  }

  void _showQrDialog(BuildContext context) {
    final token = widget.booking.qrToken;
    final vehicleId = widget.booking.vehicleId;
    final qrUrl = token != null
        ? '${Uri.base.origin}/track/$vehicleId?token=$token'
        : null;
    if (qrUrl == null) return;

    showDialog(
      context: context,
      useRootNavigator: true,
      builder: (dialogContext) => Dialog(
        backgroundColor: Colors.transparent,
        child: Container(
          constraints: const BoxConstraints(maxWidth: 340),
          decoration: BoxDecoration(
            color: AppColors.bgSecondary,
            borderRadius: AppBorders.radiusXl,
            border: Border.all(color: AppColors.border.withOpacity(0.4)),
          ),
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('رمز QR للسيارة',
                      style: AppTypography.headingSmall.copyWith(fontSize: 16)),
                  IconButton(
                    icon: const Icon(Icons.close, size: 20),
                    onPressed: () => Navigator.of(dialogContext).pop(),
                    splashRadius: 20,
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: AppBorders.radiusLg,
                ),
                child: QrImageView(
                  data: qrUrl,
                  version: QrVersions.auto,
                  size: 200,
                ),
              ),
              const SizedBox(height: 12),
              SelectableText(
                qrUrl,
                style: AppTypography.bodySmall
                    .copyWith(color: AppColors.textMuted, fontSize: 10),
                textAlign: TextAlign.center,
                maxLines: 2,
              ),
              const SizedBox(height: 4),
              Text('امسح لمتابعة حالة السيارة',
                  style: AppTypography.bodySmall
                      .copyWith(color: AppColors.textMuted),
                  textAlign: TextAlign.center),
              const SizedBox(height: 16),
              TextButton(
                onPressed: () => Navigator.of(dialogContext).pop(),
                child: const Text('إغلاق'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _fadeAnim,
      child: MouseRegion(
        onEnter: (_) => setState(() => _hovered = true),
        onExit: (_) => setState(() => _hovered = false),
        child: AnimatedContainer(
          duration: AppAnimations.fast,
          margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          decoration: BoxDecoration(
            color: _hovered ? AppColors.surfaceHover.withOpacity(0.5) : Colors.transparent,
            borderRadius: AppBorders.radiusMd,
          ),
          child: Row(
            children: [
              Expanded(
                flex: 3,
                child: Row(
                  children: [
                    Container(
                      width: 40, height: 40,
                      decoration: BoxDecoration(
                        color: widget.statusColor.withOpacity(0.12),
                        borderRadius: AppBorders.radiusMd,
                      ),
                      child: Icon(Icons.build, size: 18, color: widget.statusColor),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(widget.booking.serviceDescription,
                          style: AppTypography.labelMedium, overflow: TextOverflow.ellipsis),
                    ),
                  ],
                ),
              ),
              Expanded(
                flex: 2,
                child: Text(widget.booking.vehicleId.substring(0, 8),
                    style: AppTypography.bodyMedium.copyWith(fontFamily: 'monospace')),
              ),
              Expanded(
                flex: 2,
                child: Text(_formatDate(widget.booking.scheduledDate),
                    style: AppTypography.bodyMedium),
              ),
              Expanded(
                flex: 1,
                child: GestureDetector(
                  onTap: widget.onStatusChange,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: widget.statusColor.withOpacity(0.12),
                      borderRadius: AppBorders.radiusFull,
                      border: Border.all(color: widget.statusColor.withOpacity(0.25)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 6, height: 6,
                          decoration: BoxDecoration(
                            color: widget.statusColor, shape: BoxShape.circle),
                        ),
                        const SizedBox(width: 6),
                        Text(widget.statusText,
                            style: AppTypography.labelSmall.copyWith(
                              color: widget.statusColor, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ),
                ),
              ),
              SizedBox(
                width: 112,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (widget.booking.qrToken != null)
                      GestureDetector(
                        onTap: () => _showQrDialog(context),
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: AppColors.success.withOpacity(0.1),
                            borderRadius: AppBorders.radiusSm,
                          ),
                          child: Icon(Icons.qr_code_2, size: 16, color: AppColors.success),
                        ),
                      ),
                    if (widget.booking.qrToken != null) const SizedBox(width: 6),
                    GestureDetector(
                      onTap: widget.onEdit,
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: AppColors.accentBlue.withOpacity(0.1),
                          borderRadius: AppBorders.radiusSm,
                        ),
                        child: Icon(Icons.edit_outlined, size: 16, color: AppColors.accentBlue),
                      ),
                    ),
                    const SizedBox(width: 6),
                    GestureDetector(
                      onTap: widget.onDelete,
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: AppColors.error.withOpacity(0.1),
                          borderRadius: AppBorders.radiusSm,
                        ),
                        child: Icon(Icons.delete_outline, size: 16, color: AppColors.error),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
