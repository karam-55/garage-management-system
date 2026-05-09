import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../providers/vehicle_provider.dart';

class VehicleDetailsPage extends ConsumerStatefulWidget {
  final String vehicleId;

  const VehicleDetailsPage({
    super.key,
    required this.vehicleId,
  });

  @override
  ConsumerState<VehicleDetailsPage> createState() => _VehicleDetailsPageState();
}

class _VehicleDetailsPageState extends ConsumerState<VehicleDetailsPage> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(vehicleProvider.notifier).loadVehicleById(widget.vehicleId));
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(vehicleProvider);
    final vehicle = state.selectedVehicle;

    return Scaffold(
      appBar: AppBar(title: const Text('تفاصيل السيارة')),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : state.error != null
              ? _MessageState(
                  icon: Icons.error_outline,
                  message: 'تعذر تحميل تفاصيل السيارة',
                  actionText: 'إعادة المحاولة',
                  onPressed: () => ref.read(vehicleProvider.notifier).loadVehicleById(widget.vehicleId),
                )
              : vehicle == null
                  ? const _MessageState(
                      icon: Icons.directions_car_outlined,
                      message: 'لم يتم العثور على السيارة',
                    )
                  : ListView(
                      padding: EdgeInsets.all(20.w),
                      children: [
                        Icon(Icons.directions_car_filled, size: 72.sp, color: Theme.of(context).colorScheme.primary),
                        SizedBox(height: 16.h),
                        Text(
                          vehicle.displayName,
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 24.sp, fontWeight: FontWeight.bold),
                        ),
                        SizedBox(height: 24.h),
                        _InfoTile(label: 'رقم اللوحة', value: vehicle.plateNumber),
                        _InfoTile(label: 'الشركة', value: vehicle.make),
                        _InfoTile(label: 'الموديل', value: vehicle.model),
                        _InfoTile(label: 'سنة الصنع', value: vehicle.year.toString()),
                        _InfoTile(label: 'اللون', value: vehicle.color),
                        _InfoTile(label: 'رقم الهيكل', value: vehicle.vin),
                        _InfoTile(label: 'الممشى', value: vehicle.mileageText),
                        _InfoTile(label: 'نوع الوقود', value: vehicle.fuelTypeText),
                        _InfoTile(label: 'ناقل الحركة', value: vehicle.transmissionText),
                        _InfoTile(label: 'الحالة', value: vehicle.isActive ? 'نشطة' : 'غير نشطة'),
                      ],
                    ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  final String label;
  final String? value;

  const _InfoTile({required this.label, this.value});

  @override
  Widget build(BuildContext context) {
    final displayValue = value == null || value!.trim().isEmpty || value == 'N/A' ? 'غير محدد' : value!;
    return Card(
      child: ListTile(
        title: Text(label),
        subtitle: Text(displayValue),
      ),
    );
  }
}

class _MessageState extends StatelessWidget {
  final IconData icon;
  final String message;
  final String? actionText;
  final VoidCallback? onPressed;

  const _MessageState({
    required this.icon,
    required this.message,
    this.actionText,
    this.onPressed,
  });

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

