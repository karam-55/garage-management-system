import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:form_builder_validators/form_builder_validators.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../core/utils/logger.dart';
import '../../../garages/presentation/providers/garage_provider.dart';
import '../../../vehicles/presentation/providers/vehicle_provider.dart';
import '../../data/models/booking_model.dart';
import '../providers/booking_provider.dart';

class CreateBookingForm extends ConsumerStatefulWidget {
  final String garageId;
  final String? serviceId;

  const CreateBookingForm({
    super.key,
    required this.garageId,
    this.serviceId,
  });

  @override
  ConsumerState<CreateBookingForm> createState() => _CreateBookingFormState();
}

class _CreateBookingFormState extends ConsumerState<CreateBookingForm> {
  final _formKey = GlobalKey<FormState>();
  final _notesController = TextEditingController();
  final _dateController = TextEditingController();
  final _timeController = TextEditingController();
  
  String? _selectedVehicleId;
  String? _selectedServiceId;
  DateTime? _selectedDate;
  DateTime? _selectedTime;
  List<DateTime> _availableTimeSlots = [];

  @override
  void initState() {
    super.initState();
    _selectedServiceId = widget.serviceId;
    _dateController.text = _formatDate(DateTime.now());
    _selectedDate = DateTime.now();
    Future.microtask(() async {
      await ref.read(vehicleProvider.notifier).loadVehicles(refresh: true);
      await ref.read(garageProvider.notifier).loadGarageById(widget.garageId);
    });
  }

  @override
  void dispose() {
    _notesController.dispose();
    _dateController.dispose();
    _timeController.dispose();
    super.dispose();
  }

  Future<void> _selectDate() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );

    if (picked != null) {
      setState(() {
        _selectedDate = picked;
        _dateController.text = _formatDate(picked);
        _selectedTime = null;
        _timeController.clear();
        _availableTimeSlots = [];
      });
      
      // Load available time slots if service is selected
      if (_selectedServiceId != null) {
        _loadAvailableTimeSlots();
      }
    }
  }

  Future<void> _selectTime() async {
    if (_availableTimeSlots.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('يرجى اختيار التاريخ والخدمة أولاً'),
          backgroundColor: AppTheme.warningColor,
        ),
      );
      return;
    }

    final DateTime? picked = await showModalBottomSheet<DateTime>(
      context: context,
      builder: (context) => _TimeSlotPicker(
        timeSlots: _availableTimeSlots,
        selectedTime: _selectedTime,
      ),
    );

    if (picked != null) {
      setState(() {
        _selectedTime = picked;
        _timeController.text = _formatTime(picked);
      });
    }
  }

  Future<void> _loadAvailableTimeSlots() async {
    if (_selectedDate == null || _selectedServiceId == null) return;

    try {
      await ref.read(bookingProvider.notifier).loadAvailableTimeSlots(
        widget.garageId,
        _selectedServiceId!,
        _selectedDate!,
      );

      final timeSlots = ref.read(availableTimeSlotsProvider);
      setState(() {
        _availableTimeSlots = timeSlots;
      });
    } catch (e) {
      Logger.error('Failed to load available time slots', e);
    }
  }

  Future<void> _createBooking() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_selectedVehicleId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('يرجى اختيار سيارة'),
          backgroundColor: AppTheme.errorColor,
        ),
      );
      return;
    }

    if (_selectedServiceId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('يرجى اختيار خدمة'),
          backgroundColor: AppTheme.errorColor,
        ),
      );
      return;
    }

    if (_selectedTime == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('يرجى اختيار موعد'),
          backgroundColor: AppTheme.errorColor,
        ),
      );
      return;
    }

    final scheduledAt = DateTime(
      _selectedDate!.year,
      _selectedDate!.month,
      _selectedDate!.day,
      _selectedTime!.hour,
      _selectedTime!.minute,
    );

    final request = CreateBookingRequest(
      garageId: widget.garageId,
      vehicleId: _selectedVehicleId!,
      serviceId: _selectedServiceId!,
      scheduledAt: scheduledAt,
      notes: _notesController.text.trim().isEmpty ? null : _notesController.text.trim(),
    );

    try {
      await ref.read(bookingProvider.notifier).createBooking(request);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('تم إنشاء الحجز بنجاح'),
            backgroundColor: AppTheme.successColor,
          ),
        );
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('فشل إنشاء الحجز: ${e.toString()}'),
            backgroundColor: AppTheme.errorColor,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isCreating = ref.watch(bookingCreatingProvider);
    final vehiclesState = ref.watch(vehicleProvider);
    final garageState = ref.watch(garageProvider);
    final vehicles = vehiclesState.vehicles;
    final services = garageState.selectedGarage?.services ?? [];

    return Form(
      key: _formKey,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          DropdownButtonFormField<String>(
            value: _selectedVehicleId,
            decoration: InputDecoration(
              labelText: 'السيارة',
              hintText: 'اختر سيارتك',
              prefixIcon: const Icon(Icons.directions_car_outlined),
            ),
            items: vehicles
                .map(
                  (vehicle) => DropdownMenuItem(
                    value: vehicle.id,
                    child: Text('${vehicle.displayName} - ${vehicle.plateNumber}'),
                  ),
                )
                .toList(),
            onChanged: (value) {
              setState(() {
                _selectedVehicleId = value;
              });
            },
            validator: FormBuilderValidators.required(
              errorText: 'يرجى اختيار سيارة',
            ),
          ),
          if (!vehiclesState.isLoading && vehicles.isEmpty) ...[
            SizedBox(height: 8.h),
            const Text('لا توجد سيارات. يرجى إضافة سيارة قبل إنشاء الحجز.'),
          ],
          
          SizedBox(height: 16.h),
          
          DropdownButtonFormField<String>(
            value: _selectedServiceId,
            decoration: InputDecoration(
              labelText: 'الخدمة',
              hintText: 'اختر الخدمة',
              prefixIcon: const Icon(Icons.build_outlined),
            ),
            items: services
                .map(
                  (service) => DropdownMenuItem(
                    value: service.id,
                    child: Text('${service.title} - ${service.price.toStringAsFixed(0)}'),
                  ),
                )
                .toList(),
            onChanged: (value) {
              setState(() {
                _selectedServiceId = value;
              });
              if (_selectedDate != null) {
                _loadAvailableTimeSlots();
              }
            },
            validator: FormBuilderValidators.required(
              errorText: 'يرجى اختيار خدمة',
            ),
          ),
          if (!garageState.isLoading && services.isEmpty) ...[
            SizedBox(height: 8.h),
            const Text('لا توجد خدمات متاحة لهذه الورشة حالياً.'),
          ],
          
          SizedBox(height: 16.h),
          
          // Date Selection
          TextFormField(
            controller: _dateController,
            readOnly: true,
            decoration: InputDecoration(
              labelText: 'التاريخ',
              hintText: 'اختر تاريخ الموعد',
              prefixIcon: const Icon(Icons.calendar_today_outlined),
              suffixIcon: const Icon(Icons.arrow_drop_down),
            ),
            onTap: _selectDate,
            validator: FormBuilderValidators.required(
              errorText: 'يرجى اختيار التاريخ',
            ),
          ),
          
          SizedBox(height: 16.h),
          
          // Time Selection
          TextFormField(
            controller: _timeController,
            readOnly: true,
            decoration: InputDecoration(
              labelText: 'الوقت',
              hintText: 'اختر وقت الموعد',
              prefixIcon: const Icon(Icons.access_time),
              suffixIcon: const Icon(Icons.arrow_drop_down),
            ),
            onTap: _selectTime,
            validator: FormBuilderValidators.required(
              errorText: 'يرجى اختيار الوقت',
            ),
          ),
          
          SizedBox(height: 16.h),
          
          // Notes
          TextFormField(
            controller: _notesController,
            decoration: InputDecoration(
              labelText: 'ملاحظات (اختياري)',
              hintText: 'أضف أي تعليمات خاصة',
              prefixIcon: const Icon(Icons.note_outlined),
            ),
            maxLines: 3,
            textInputAction: TextInputAction.done,
          ),
          
          SizedBox(height: 24.h),
          
          // Create Button
          SizedBox(
            width: double.infinity,
            height: 56.h,
            child: ElevatedButton(
              onPressed: isCreating ? null : _createBooking,
              child: isCreating
                  ? SizedBox(
                      width: 20.w,
                      height: 20.h,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          Theme.of(context).colorScheme.onPrimary,
                        ),
                      ),
                    )
                  : const Text('إنشاء الحجز'),
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  String _formatTime(DateTime time) {
    return '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
  }
}

class _TimeSlotPicker extends StatelessWidget {
  final List<DateTime> timeSlots;
  final DateTime? selectedTime;

  const _TimeSlotPicker({
    required this.timeSlots,
    this.selectedTime,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(16.w),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'الأوقات المتاحة',
            style: TextStyle(
              fontSize: 18.sp,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: 16.h),
          if (timeSlots.isEmpty)
            Text(
              'لا توجد أوقات متاحة لهذا التاريخ',
              style: TextStyle(
                fontSize: 14.sp,
                color: Theme.of(context).colorScheme.onBackground.withOpacity(0.6),
              ),
            )
          else
            Wrap(
              spacing: 8.w,
              runSpacing: 8.h,
              children: timeSlots.map((timeSlot) {
                final isSelected = selectedTime != null &&
                    timeSlot.hour == selectedTime!.hour &&
                    timeSlot.minute == selectedTime!.minute;
                
                return FilterChip(
                  label: Text(
                    '${timeSlot.hour.toString().padLeft(2, '0')}:${timeSlot.minute.toString().padLeft(2, '0')}',
                  ),
                  selected: isSelected,
                  onSelected: (selected) {
                    if (selected) {
                      Navigator.of(context).pop(timeSlot);
                    }
                  },
                );
              }).toList(),
            ),
          SizedBox(height: 16.h),
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
  }
}
