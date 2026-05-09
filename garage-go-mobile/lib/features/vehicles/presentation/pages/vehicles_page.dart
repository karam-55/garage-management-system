import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/router/app_router.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/utils/logger.dart';
import '../../data/models/vehicle_model.dart';
import '../providers/vehicle_provider.dart';
import '../widgets/vehicle_card.dart';

class VehiclesPage extends ConsumerStatefulWidget {
  const VehiclesPage({super.key});

  @override
  ConsumerState<VehiclesPage> createState() => _VehiclesPageState();
}

class _VehiclesPageState extends ConsumerState<VehiclesPage> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _initializeData();
    _setupScrollListener();
  }

  void _initializeData() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(vehicleProvider.notifier).refresh();
    });
  }

  void _setupScrollListener() {
    _scrollController.addListener(() {
      if (_scrollController.position.pixels >=
          _scrollController.position.maxScrollExtent - 200) {
        ref.read(vehicleProvider.notifier).loadVehicles();
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
    final vehicles = ref.watch(vehiclesProvider);
    final stats = ref.watch(vehicleStatsProvider);
    final isLoading = ref.watch(vehicleLoadingProvider);
    final error = ref.watch(vehicleErrorProvider);
    final activeFilter = ref.watch(vehicleActiveFilterProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Vehicles'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              ref.read(vehicleProvider.notifier).refresh();
            },
          ),
          PopupMenuButton<bool?>(
            icon: const Icon(Icons.filter_list),
            onSelected: (value) {
              ref.read(vehicleProvider.notifier).filterByActive(value);
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: null,
                child: Text('All Vehicles'),
              ),
              const PopupMenuItem(
                value: true,
                child: Text('Active Only'),
              ),
              const PopupMenuItem(
                value: false,
                child: Text('Inactive Only'),
              ),
            ],
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await ref.read(vehicleProvider.notifier).refresh();
        },
        child: Column(
          children: [
            // Statistics Card
            if (stats != null)
              VehicleStatsCard(stats: stats),
            
            // Content
            Expanded(
              child: _buildContent(vehicles, isLoading, error, activeFilter),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          context.navigateToAddVehicle();
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildContent(List vehicles, bool isLoading, String? error, bool? activeFilter) {
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
                  ref.read(vehicleProvider.notifier).refresh();
                },
                child: const Text('Try Again'),
              ),
            ],
          ),
        ),
      );
    }

    if (isLoading && vehicles.isEmpty) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (vehicles.isEmpty) {
      return Center(
        child: Padding(
          padding: EdgeInsets.all(16.w),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.directions_car_outlined,
                size: 64.sp,
                color: Theme.of(context).colorScheme.onBackground.withOpacity(0.3),
              ),
              SizedBox(height: 16.h),
              Text(
                'No vehicles found',
                style: TextStyle(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.w600,
                  color: Theme.of(context).colorScheme.onBackground.withOpacity(0.7),
                ),
              ),
              SizedBox(height: 8.h),
              Text(
                'Add your first vehicle to get started',
                style: TextStyle(
                  fontSize: 14.sp,
                  color: Theme.of(context).colorScheme.onBackground.withOpacity(0.5),
                ),
              ),
              SizedBox(height: 24.h),
              ElevatedButton.icon(
                onPressed: () {
                  context.navigateToAddVehicle();
                },
                icon: const Icon(Icons.add),
                label: const Text('Add Vehicle'),
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      children: [
    // Filter indicator
    if (activeFilter != null) ...[
      Container(
        width: double.infinity,
        padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
        color: AppTheme.primaryColor.withOpacity(0.1),
        child: Row(
          children: [
            Icon(
              Icons.filter_list,
              size: 16.sp,
              color: AppTheme.primaryColor,
            ),
            SizedBox(width: 8.w),
            Text(
              'Showing ${activeFilter ? 'active' : 'inactive'} vehicles',
              style: TextStyle(
                fontSize: 12.sp,
                color: AppTheme.primaryColor,
                fontWeight: FontWeight.w500,
              ),
            ),
            const Spacer(),
            TextButton(
              onPressed: () {
                ref.read(vehicleProvider.notifier).filterByActive(null);
              },
              child: const Text('Clear'),
            ),
          ],
        ),
      ),
    ],
        Expanded(
          child: ListView.builder(
      controller: _scrollController,
      padding: EdgeInsets.symmetric(vertical: 8.h),
      itemCount: vehicles.length + (isLoading ? 1 : 0),
      itemBuilder: (context, index) {
        if (index >= vehicles.length) {
          return const Padding(
            padding: EdgeInsets.all(16.0),
            child: Center(
              child: CircularProgressIndicator(),
            ),
          );
        }

        final vehicle = vehicles[index];
        return VehicleCard(
          vehicle: vehicle,
          onTap: () {
            context.navigateToVehicleDetails(vehicle.id);
          },
          onEdit: () {
            _editVehicle(vehicle);
          },
          onDelete: () {
            _deleteVehicle(vehicle);
          },
        );
      },
    )),
      ],
    );
  }

  Future<void> _editVehicle(Vehicle vehicle) async {
    final result = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.9,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        builder: (context, scrollController) {
          return Container(
            padding: EdgeInsets.all(16.w),
            child: Column(
              children: [
                // Handle bar
                Container(
                  width: 40.w,
                  height: 4.h,
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.onBackground.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(2.r),
                  ),
                ),
                
                SizedBox(height: 16.h),
                
                // Title
                Text(
                  'Edit Vehicle',
                  style: TextStyle(
                    fontSize: 20.sp,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                
                SizedBox(height: 16.h),
                
                // Form will go here
                // For now, just show a message
                Expanded(
                  child: Center(
                    child: Text(
                      'Edit vehicle form will be implemented here',
                      style: TextStyle(
                        fontSize: 16.sp,
                        color: Theme.of(context).colorScheme.onBackground.withOpacity(0.7),
                      ),
                    ),
                  ),
                ),
                
                // Close button
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Close'),
                ),
              ],
            ),
          );
        },
      ),
    );

    if (result == true) {
      // Refresh the list
      ref.read(vehicleProvider.notifier).refresh();
    }
  }

  Future<void> _deleteVehicle(Vehicle vehicle) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Vehicle'),
        content: Text('Are you sure you want to delete ${vehicle.displayName}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text(
              'Delete',
              style: TextStyle(color: AppTheme.errorColor),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await ref.read(vehicleProvider.notifier).deleteVehicle(vehicle.id);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Vehicle deleted successfully'),
              backgroundColor: AppTheme.successColor,
            ),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to delete vehicle: ${e.toString()}'),
              backgroundColor: AppTheme.errorColor,
            ),
          );
        }
      }
    }
  }
}
