import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/app_theme.dart';
import '../../models/booking.dart';
import '../../services/booking_service.dart';
import '../../services/notification_service.dart';
import '../../state/mechanic_provider.dart';
import 'mechanic_login_screen.dart';
import 'mechanic_task_detail_screen.dart';
import 'mechanic_receipt_screen.dart';

class MechanicDashboardScreen extends ConsumerStatefulWidget {
  const MechanicDashboardScreen({super.key});

  @override
  ConsumerState<MechanicDashboardScreen> createState() => _MechanicDashboardScreenState();
}

class _MechanicDashboardScreenState extends ConsumerState<MechanicDashboardScreen> {
  final _service = BookingService();
  List<Booking> _bookings = [];
  bool _loading = true;
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadBookings();
  }

  Future<void> _loadBookings() async {
    final mechanic = ref.read(currentMechanicProvider);
    if (mechanic == null) return;
    try {
      final bookings = await _service.getBookingsByTechnician(mechanic.id);
      setState(() {
        _bookings = bookings;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
      showErrorToast(context, 'فشل تحميل المهام: $e');
    }
  }

  List<Booking> get _activeBookings =>
      _bookings.where((b) => b.status != 'DONE' && b.status != 'CANCELLED').toList();

  List<Booking> get _doneBookings =>
      _bookings.where((b) => b.status == 'DONE').toList();

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
      case 'CANCELLED': return AppColors.error;
      default: return AppColors.textMuted;
    }
  }

  @override
  Widget build(BuildContext context) {
    final mechanic = ref.watch(currentMechanicProvider);
    if (mechanic == null) {
      return const MechanicLoginScreen();
    }

    final displayList = _selectedIndex == 0 ? _activeBookings : _doneBookings;

    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      appBar: AppBar(
        backgroundColor: AppColors.bgPrimary,
        elevation: 0,
        title: Text('مرحباً ${mechanic.name}', style: AppTypography.headingSmall),
        actions: [
          IconButton(
            icon: Icon(Icons.logout, color: AppColors.error),
            onPressed: () {
              ref.read(currentMechanicProvider.notifier).state = null;
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (_) => const MechanicLoginScreen()),
              );
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadBookings,
        color: AppColors.primary,
        backgroundColor: AppColors.bgCard,
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : displayList.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.check_circle_outline, size: 64, color: AppColors.success.withOpacity(0.5)),
                        const SizedBox(height: 16),
                        Text(
                          _selectedIndex == 0 ? 'لا توجد مهام حالياً' : 'لا توجد مهام مكتملة',
                          style: AppTypography.bodyLarge.copyWith(color: AppColors.textMuted)),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: displayList.length,
                    itemBuilder: (context, index) {
                      final booking = displayList[index];
                      return GestureDetector(
                        onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => MechanicTaskDetailScreen(
                              booking: booking,
                              onUpdated: _loadBookings,
                            ),
                          ),
                        ),
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.bgCard,
                            borderRadius: AppBorders.radiusLg,
                            border: Border.all(color: AppColors.border.withOpacity(0.2)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      booking.serviceDescription,
                                      style: AppTypography.bodyLarge.copyWith(
                                        fontWeight: FontWeight.w600),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: _statusColor(booking.status).withOpacity(0.15),
                                      borderRadius: AppBorders.radiusFull,
                                    ),
                                    child: Text(
                                      _statusText(booking.status),
                                      style: AppTypography.labelSmall.copyWith(
                                        color: _statusColor(booking.status),
                                        fontWeight: FontWeight.w600),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  Icon(Icons.directions_car_outlined,
                                    size: 16, color: AppColors.textMuted),
                                  const SizedBox(width: 6),
                                  Text('رقم السيارة: ${booking.vehicleId.substring(0, 8)}...',
                                    style: AppTypography.bodySmall.copyWith(
                                      color: AppColors.textMuted)),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  Icon(Icons.calendar_today_outlined,
                                    size: 16, color: AppColors.textMuted),
                                  const SizedBox(width: 6),
                                  Text(
                                    '${booking.scheduledDate.day}/${booking.scheduledDate.month}/${booking.scheduledDate.year}',
                                    style: AppTypography.bodySmall.copyWith(
                                      color: AppColors.textMuted),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppColors.bgCard,
          border: Border(
            top: BorderSide(color: AppColors.border.withOpacity(0.2)),
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildNavItem(Icons.build_outlined, 'المهام', 0),
                _buildNavItem(Icons.history, 'السجل', 1),
                _buildNavItem(Icons.qr_code_scanner, 'استلام', -1),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(IconData icon, String label, int index) {
    final isSelected = _selectedIndex == index;
    return GestureDetector(
      onTap: () {
        if (index == -1) {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const MechanicReceiptScreen()),
          );
        } else {
          setState(() => _selectedIndex = index);
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary.withOpacity(0.15) : Colors.transparent,
          borderRadius: AppBorders.radiusMd,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 24, color: isSelected ? AppColors.primary : AppColors.textTertiary),
            const SizedBox(height: 4),
            Text(label, style: AppTypography.labelSmall.copyWith(
              color: isSelected ? AppColors.primary : AppColors.textTertiary)),
          ],
        ),
      ),
    );
  }
}
