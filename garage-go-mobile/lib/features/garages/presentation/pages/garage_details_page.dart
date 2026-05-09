import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../../core/router/app_router.dart';
import '../providers/garage_provider.dart';

class GarageDetailsPage extends ConsumerStatefulWidget {
  final String garageId;

  const GarageDetailsPage({
    super.key,
    required this.garageId,
  });

  @override
  ConsumerState<GarageDetailsPage> createState() => _GarageDetailsPageState();
}

class _GarageDetailsPageState extends ConsumerState<GarageDetailsPage> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(garageProvider.notifier).loadGarageById(widget.garageId));
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(garageProvider);
    final details = state.selectedGarage;
    final garage = details?.garage;
    final services = details?.services ?? [];

    return Scaffold(
      appBar: AppBar(title: const Text('تفاصيل الورشة')),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : state.error != null
              ? _MessageState(
                  icon: Icons.error_outline,
                  message: 'تعذر تحميل تفاصيل الورشة',
                  actionText: 'إعادة المحاولة',
                  onPressed: () => ref.read(garageProvider.notifier).loadGarageById(widget.garageId),
                )
              : garage == null
                  ? const _MessageState(icon: Icons.garage_outlined, message: 'لم يتم العثور على الورشة')
                  : ListView(
                      padding: EdgeInsets.all(20.w),
                      children: [
                        Icon(Icons.garage, size: 72.sp, color: Theme.of(context).colorScheme.primary),
                        SizedBox(height: 16.h),
                        Text(
                          garage.name,
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 24.sp, fontWeight: FontWeight.bold),
                        ),
                        SizedBox(height: 8.h),
                        Text(
                          garage.isActive ? 'مفتوحة' : 'مغلقة',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 14.sp, color: garage.isActive ? Colors.green : Colors.red),
                        ),
                        SizedBox(height: 24.h),
                        _InfoTile(label: 'العنوان', value: garage.address),
                        _InfoTile(label: 'الهاتف', value: garage.phone),
                        _InfoTile(label: 'البريد الإلكتروني', value: garage.email),
                        _InfoTile(label: 'التقييم', value: '${garage.ratingText} (${garage.reviewCount})'),
                        if (garage.description != null && garage.description!.trim().isNotEmpty)
                          _InfoTile(label: 'الوصف', value: garage.description),
                        SizedBox(height: 16.h),
                        Text('الخدمات', style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.bold)),
                        SizedBox(height: 8.h),
                        if (services.isEmpty)
                          const Card(child: ListTile(title: Text('لا توجد خدمات متاحة حالياً')))
                        else
                          ...services.map(
                            (service) => Card(
                              child: ListTile(
                                title: Text(service.title),
                                subtitle: Text(service.description ?? 'بدون وصف'),
                                trailing: Text(service.price.toStringAsFixed(0)),
                                onTap: () => context.navigateToCreateBooking(
                                  garageId: garage.id,
                                  serviceId: service.id,
                                ),
                              ),
                            ),
                          ),
                        SizedBox(height: 20.h),
                        ElevatedButton.icon(
                          onPressed: () => context.navigateToCreateBooking(garageId: garage.id),
                          icon: const Icon(Icons.calendar_month),
                          label: const Text('إنشاء حجز'),
                        ),
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
    final displayValue = value == null || value!.trim().isEmpty ? 'غير محدد' : value!;
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

