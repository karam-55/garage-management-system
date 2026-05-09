import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../../../core/theme/app_theme.dart';
import '../../data/models/vehicle_model.dart';

class VehicleCard extends StatelessWidget {
  final Vehicle vehicle;
  final VoidCallback onTap;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;

  const VehicleCard({
    super.key,
    required this.vehicle,
    required this.onTap,
    this.onEdit,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
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
          child: Row(
            children: [
              // Vehicle Image or Placeholder
              Container(
                width: 80.w,
                height: 80.h,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12.r),
                  gradient: AppTheme.primaryGradient,
                ),
                child: vehicle.imageUrl != null
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(12.r),
                        child: CachedNetworkImage(
                          imageUrl: vehicle.imageUrl!,
                          width: double.infinity,
                          height: double.infinity,
                          fit: BoxFit.cover,
                          placeholder: (context, url) => Center(
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                Colors.white,
                              ),
                            ),
                          ),
                          errorWidget: (context, url, error) => _buildPlaceholder(),
                        ),
                      )
                    : _buildPlaceholder(),
              ),
              
              SizedBox(width: 16.w),
              
              // Vehicle Info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Name and Status
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            vehicle.displayName,
                            style: TextStyle(
                              fontSize: 16.sp,
                              fontWeight: FontWeight.bold,
                              color: Theme.of(context).colorScheme.onBackground,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        SizedBox(width: 8.w),
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.h),
                          decoration: BoxDecoration(
                            color: vehicle.isActive ? AppTheme.successColor : AppTheme.statusGrey,
                            borderRadius: BorderRadius.circular(8.r),
                          ),
                          child: Text(
                            vehicle.isActive ? 'Active' : 'Inactive',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 10.sp,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                    
                    SizedBox(height: 4.h),
                    
                    // Plate Number
                    Row(
                      children: [
                        Icon(
                          Icons.credit_card,
                          size: 12.sp,
                          color: Theme.of(context).colorScheme.onBackground.withOpacity(0.6),
                        ),
                        SizedBox(width: 4.w),
                        Text(
                          vehicle.plateNumber,
                          style: TextStyle(
                            fontSize: 12.sp,
                            color: Theme.of(context).colorScheme.onBackground.withOpacity(0.7),
                          ),
                        ),
                      ],
                    ),
                    
                    SizedBox(height: 8.h),
                    
                    // Vehicle Details
                    Row(
                      children: [
                        _buildDetailChip(
                          context,
                          vehicle.fuelTypeText,
                          Icons.local_gas_station,
                        ),
                        SizedBox(width: 8.w),
                        _buildDetailChip(
                          context,
                          vehicle.transmissionText,
                          Icons.settings,
                        ),
                      ],
                    ),
                    
                    SizedBox(height: 8.h),
                    
                    // Mileage
                    Row(
                      children: [
                        Icon(
                          Icons.speed,
                          size: 12.sp,
                          color: Theme.of(context).colorScheme.onBackground.withOpacity(0.6),
                        ),
                        SizedBox(width: 4.w),
                        Text(
                          vehicle.mileageText,
                          style: TextStyle(
                            fontSize: 12.sp,
                            color: Theme.of(context).colorScheme.onBackground.withOpacity(0.7),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              
              // Action Buttons
              Column(
                children: [
                  if (onEdit != null)
                    IconButton(
                      icon: Icon(Icons.edit_outlined, size: 20.sp),
                      onPressed: onEdit,
                      color: AppTheme.infoColor,
                    ),
                  if (onDelete != null)
                    IconButton(
                      icon: Icon(Icons.delete_outline, size: 20.sp),
                      onPressed: onDelete,
                      color: AppTheme.errorColor,
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPlaceholder() {
    return Center(
      child: Icon(
        Icons.directions_car,
        size: 32.sp,
        color: Colors.white.withOpacity(0.8),
      ),
    );
  }

  Widget _buildDetailChip(BuildContext context, String text, IconData icon) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.h),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8.r),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 10.sp,
            color: Theme.of(context).colorScheme.primary,
          ),
          SizedBox(width: 2.w),
          Text(
            text,
            style: TextStyle(
              fontSize: 10.sp,
              color: Theme.of(context).colorScheme.primary,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

class VehicleStatsCard extends StatelessWidget {
  final VehicleStats stats;

  const VehicleStatsCard({
    super.key,
    required this.stats,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      margin: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16.r),
      ),
      child: Padding(
        padding: EdgeInsets.all(16.w),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Vehicle Statistics',
              style: TextStyle(
                fontSize: 18.sp,
                fontWeight: FontWeight.bold,
                color: Theme.of(context).colorScheme.onBackground,
              ),
            ),
            
            SizedBox(height: 16.h),
            
            // Total Vehicles
            Row(
              children: [
                Expanded(
                  child: _buildStatItem(
                    context,
                    'Total Vehicles',
                    stats.totalVehicles.toString(),
                    Icons.directions_car,
                    AppTheme.primaryColor,
                  ),
                ),
                SizedBox(width: 16.w),
                Expanded(
                  child: _buildStatItem(
                    context,
                    'Active',
                    stats.activeVehicles.toString(),
                    Icons.check_circle,
                    AppTheme.successColor,
                  ),
                ),
              ],
            ),
            
            SizedBox(height: 16.h),
            
            // Popular Makes
            Text(
              'Popular Makes',
              style: TextStyle(
                fontSize: 14.sp,
                fontWeight: FontWeight.w600,
                color: Theme.of(context).colorScheme.onBackground,
              ),
            ),
            SizedBox(height: 8.h),
            Wrap(
              spacing: 8.w,
              runSpacing: 4.h,
              children: stats.makeCounts.take(5).map((makeCount) {
                return Chip(
                  label: Text('${makeCount.make} (${makeCount.count})'),
                  backgroundColor: AppTheme.primaryColor.withOpacity(0.1),
                  labelStyle: TextStyle(
                    fontSize: 12.sp,
                    color: AppTheme.primaryColor,
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(
    BuildContext context,
    String label,
    String value,
    IconData icon,
    Color color,
  ) {
    return Container(
      padding: EdgeInsets.all(12.w),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12.r),
      ),
      child: Column(
        children: [
          Icon(
            icon,
            color: color,
            size: 24.sp,
          ),
          SizedBox(height: 4.h),
          Text(
            value,
            style: TextStyle(
              fontSize: 20.sp,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          Text(
            label,
            style: TextStyle(
              fontSize: 12.sp,
              color: Theme.of(context).colorScheme.onBackground.withOpacity(0.7),
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
