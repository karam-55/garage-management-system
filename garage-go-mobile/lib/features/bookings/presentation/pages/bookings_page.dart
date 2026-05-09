import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/router/app_router.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/utils/logger.dart';
import '../providers/booking_provider.dart';
import '../widgets/booking_card.dart';

class BookingsPage extends ConsumerStatefulWidget {
  const BookingsPage({super.key});

  @override
  ConsumerState<BookingsPage> createState() => _BookingsPageState();
}

class _BookingsPageState extends ConsumerState<BookingsPage> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _initializeData();
    _setupScrollListener();
  }

  void _initializeData() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(bookingProvider.notifier).refresh();
    });
  }

  void _setupScrollListener() {
    _scrollController.addListener(() {
      if (_scrollController.position.pixels >=
          _scrollController.position.maxScrollExtent - 200) {
        ref.read(bookingProvider.notifier).loadBookings();
      }
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bookings = ref.watch(bookingsProvider);
    final isLoading = ref.watch(bookingLoadingProvider);
    final error = ref.watch(bookingErrorProvider);
    final selectedStatus = ref.watch(bookingStatusFilterProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('حجوزاتي'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              ref.read(bookingProvider.notifier).refresh();
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await ref.read(bookingProvider.notifier).refresh();
        },
        child: Column(
          children: [
            // Status Filter
            Container(
              height: 60.h,
              padding: EdgeInsets.symmetric(horizontal: 16.w),
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: bookingStatuses.length,
                itemBuilder: (context, index) {
                  final status = bookingStatuses[index];
                  final isSelected = status == selectedStatus;
                  
                  return Padding(
                    padding: EdgeInsets.only(right: 8.w),
                    child: BookingStatusChip(
                      status: status,
                      isSelected: isSelected,
                      onTap: () {
                        ref.read(bookingProvider.notifier).filterByStatus(
                          status == 'ALL' ? null : status,
                        );
                      },
                    ),
                  );
                },
              ),
            ),
            
            // Content
            Expanded(
              child: _buildContent(bookings, isLoading, error),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          context.navigateToCreateBooking();
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildContent(List bookings, bool isLoading, String? error) {
    if (error != null) {
      return Center(
        child: Padding(
          padding: EdgeInsets.all(16.w),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline,
                size: 64.sp,
                color: AppTheme.errorColor,
              ),
              SizedBox(height: 16.h),
              Text(
                'Something went wrong',
                style: TextStyle(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).colorScheme.onBackground,
                ),
              ),
              SizedBox(height: 8.h),
              Text(
                error,
                style: TextStyle(
                  fontSize: 14.sp,
                  color: Theme.of(context).colorScheme.onBackground.withOpacity(0.7),
                ),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 16.h),
              ElevatedButton(
                onPressed: () {
                  ref.read(bookingProvider.notifier).refresh();
                },
                child: const Text('Try Again'),
              ),
            ],
          ),
        ),
      );
    }

    if (isLoading && bookings.isEmpty) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (bookings.isEmpty) {
      return Center(
        child: Padding(
          padding: EdgeInsets.all(16.w),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.calendar_today_outlined,
                size: 64.sp,
                color: Theme.of(context).colorScheme.onBackground.withOpacity(0.3),
              ),
              SizedBox(height: 16.h),
              Text(
                'No bookings found',
                style: TextStyle(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.w600,
                  color: Theme.of(context).colorScheme.onBackground.withOpacity(0.7),
                ),
              ),
              SizedBox(height: 8.h),
              Text(
                'Create your first booking to get started',
                style: TextStyle(
                  fontSize: 14.sp,
                  color: Theme.of(context).colorScheme.onBackground.withOpacity(0.5),
                ),
              ),
              SizedBox(height: 24.h),
              ElevatedButton.icon(
                onPressed: () {
                  context.navigateToCreateBooking();
                },
                icon: const Icon(Icons.add),
                label: const Text('إنشاء حجز'),
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      controller: _scrollController,
      padding: EdgeInsets.symmetric(vertical: 8.h),
      itemCount: bookings.length + (isLoading ? 1 : 0),
      itemBuilder: (context, index) {
        if (index >= bookings.length) {
          return const Padding(
            padding: EdgeInsets.all(16.0),
            child: Center(
              child: CircularProgressIndicator(),
            ),
          );
        }

        final booking = bookings[index];
        return BookingCard(
          bookingWithDetails: booking,
          onTap: () {
            context.navigateToBookingDetails(booking.booking.id);
          },
          onCancel: booking.booking.isPending
              ? () => _cancelBooking(booking.booking.id)
              : null,
          onReschedule: null,
        );
      },
    );
  }

  Future<void> _cancelBooking(String bookingId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('إلغاء الحجز'),
        content: const Text('هل أنت متأكد من إلغاء هذا الحجز؟'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('لا'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('نعم'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await ref.read(bookingProvider.notifier).cancelBooking(bookingId);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('تم إلغاء الحجز بنجاح'),
              backgroundColor: AppTheme.successColor,
            ),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('فشل إلغاء الحجز: ${e.toString()}'),
              backgroundColor: AppTheme.errorColor,
            ),
          );
        }
      }
    }
  }
}
