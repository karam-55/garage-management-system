import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../../core/theme/app_theme.dart';
import '../../data/models/booking_model.dart';

class BookingCard extends StatelessWidget {
  final BookingWithDetails bookingWithDetails;
  final VoidCallback onTap;
  final VoidCallback? onCancel;
  final VoidCallback? onReschedule;

  const BookingCard({
    super.key,
    required this.bookingWithDetails,
    required this.onTap,
    this.onCancel,
    this.onReschedule,
  });

  @override
  Widget build(BuildContext context) {
    final booking = bookingWithDetails.booking;
    final garage = bookingWithDetails.garage;
    final service = bookingWithDetails.service;
    final vehicle = bookingWithDetails.vehicle;

    return Card(
      elevation: 2,
      margin: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16.r),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16.r),
        child: Padding(
          padding: EdgeInsets.all(16.w),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header with status and actions
              Row(
                children: [
                  // Status Badge
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                    decoration: BoxDecoration(
                      color: _getStatusColor(booking.status),
                      borderRadius: BorderRadius.circular(12.r),
                    ),
                    child: Text(
                      booking.statusText,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 10.sp,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  
                  const Spacer(),
                  
                  // Action buttons
                  if (booking.isPending && onCancel != null)
                    IconButton(
                      icon: Icon(Icons.cancel_outlined, size: 20.sp),
                      onPressed: onCancel,
                      color: AppTheme.errorColor,
                    ),
                  
                  if (booking.isConfirmed && onReschedule != null)
                    IconButton(
                      icon: Icon(Icons.schedule_outlined, size: 20.sp),
                      onPressed: onReschedule,
                      color: AppTheme.infoColor,
                    ),
                ],
              ),
              
              SizedBox(height: 12.h),
              
              // Service and Garage
              Text(
                service?.title ?? 'Service',
                style: TextStyle(
                  fontSize: 16.sp,
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).colorScheme.onBackground,
                ),
              ),
              
              SizedBox(height: 4.h),
              
              Text(
                garage?.name ?? 'Garage',
                style: TextStyle(
                  fontSize: 14.sp,
                  color: Theme.of(context).colorScheme.onBackground.withOpacity(0.7),
                ),
              ),
              
              SizedBox(height: 12.h),
              
              // Date and Time
              Row(
                children: [
                  Icon(
                    Icons.calendar_today_outlined,
                    size: 16.sp,
                    color: Theme.of(context).colorScheme.onBackground.withOpacity(0.6),
                  ),
                  SizedBox(width: 4.w),
                  Text(
                    _formatDate(booking.scheduledAt),
                    style: TextStyle(
                      fontSize: 14.sp,
                      color: Theme.of(context).colorScheme.onBackground,
                    ),
                  ),
                ],
              ),
              
              SizedBox(height: 8.h),
              
              Row(
                children: [
                  Icon(
                    Icons.access_time,
                    size: 16.sp,
                    color: Theme.of(context).colorScheme.onBackground.withOpacity(0.6),
                  ),
                  SizedBox(width: 4.w),
                  Text(
                    _formatTime(booking.scheduledAt),
                    style: TextStyle(
                      fontSize: 14.sp,
                      color: Theme.of(context).colorScheme.onBackground,
                    ),
                  ),
                ],
              ),
              
              if (vehicle != null) ...[
                SizedBox(height: 8.h),
                Row(
                  children: [
                    Icon(
                      Icons.directions_car_outlined,
                      size: 16.sp,
                      color: Theme.of(context).colorScheme.onBackground.withOpacity(0.6),
                    ),
                    SizedBox(width: 4.w),
                    Text(
                      vehicle.shortName,
                      style: TextStyle(
                        fontSize: 14.sp,
                        color: Theme.of(context).colorScheme.onBackground,
                      ),
                    ),
                    SizedBox(width: 8.w),
                    Text(
                      '(${vehicle.plateNumber})',
                      style: TextStyle(
                        fontSize: 12.sp,
                        color: Theme.of(context).colorScheme.onBackground.withOpacity(0.6),
                      ),
                    ),
                  ],
                ),
              ],
              
              SizedBox(height: 12.h),
              
              // Price and Notes
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    booking.priceText,
                    style: TextStyle(
                      fontSize: 16.sp,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primaryColor,
                    ),
                  ),
                  
                  if (booking.notes != null && booking.notes!.isNotEmpty)
                    Expanded(
                      child: Text(
                        booking.notes!,
                        style: TextStyle(
                          fontSize: 12.sp,
                          color: Theme.of(context).colorScheme.onBackground.withOpacity(0.6),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        textAlign: TextAlign.end,
                      ),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'PENDING':
        return AppTheme.warningColor;
      case 'CONFIRMED':
        return AppTheme.infoColor;
      case 'IN_PROGRESS':
        return AppTheme.primaryColor;
      case 'COMPLETED':
        return AppTheme.successColor;
      case 'CANCELLED':
        return AppTheme.errorColor;
      default:
        return AppTheme.statusGrey;
    }
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final bookingDate = DateTime(date.year, date.month, date.day);

    if (bookingDate == today) {
      return 'Today';
    } else if (bookingDate == today.add(const Duration(days: 1))) {
      return 'Tomorrow';
    } else if (bookingDate == today.subtract(const Duration(days: 1))) {
      return 'Yesterday';
    } else {
      return '${date.day}/${date.month}/${date.year}';
    }
  }

  String _formatTime(DateTime date) {
    return '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
  }
}

class BookingStatusChip extends StatelessWidget {
  final String status;
  final bool isSelected;
  final VoidCallback? onTap;

  const BookingStatusChip({
    super.key,
    required this.status,
    this.isSelected = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final color = _getStatusColor(status);
    
    return FilterChip(
      label: Text(status.replaceAll('_', ' ')),
      selected: isSelected,
      onSelected: onTap != null ? (selected) => onTap!() : null,
      backgroundColor: color.withOpacity(0.1),
      selectedColor: color.withOpacity(0.3),
      labelStyle: TextStyle(
        color: isSelected ? color : color.withOpacity(0.8),
        fontSize: 12.sp,
        fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'PENDING':
        return AppTheme.warningColor;
      case 'CONFIRMED':
        return AppTheme.infoColor;
      case 'IN_PROGRESS':
        return AppTheme.primaryColor;
      case 'COMPLETED':
        return AppTheme.successColor;
      case 'CANCELLED':
        return AppTheme.errorColor;
      default:
        return AppTheme.statusGrey;
    }
  }
}
