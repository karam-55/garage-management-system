import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../data/models/vehicle_model.dart';
import '../providers/vehicle_provider.dart';

class AddVehiclePage extends ConsumerStatefulWidget {
  const AddVehiclePage({super.key});

  @override
  ConsumerState<AddVehiclePage> createState() => _AddVehiclePageState();
}

class _AddVehiclePageState extends ConsumerState<AddVehiclePage> {
  final _formKey = GlobalKey<FormState>();
  final _makeController = TextEditingController();
  final _modelController = TextEditingController();
  final _yearController = TextEditingController();
  final _plateController = TextEditingController();
  final _colorController = TextEditingController();
  final _vinController = TextEditingController();
  final _mileageController = TextEditingController();

  @override
  void dispose() {
    _makeController.dispose();
    _modelController.dispose();
    _yearController.dispose();
    _plateController.dispose();
    _colorController.dispose();
    _vinController.dispose();
    _mileageController.dispose();
    super.dispose();
  }

  Future<void> _saveVehicle() async {
    if (!_formKey.currentState!.validate()) return;

    final request = CreateVehicleRequest(
      make: _makeController.text.trim(),
      model: _modelController.text.trim(),
      year: int.parse(_yearController.text.trim()),
      plateNumber: _plateController.text.trim(),
      color: _colorController.text.trim().isEmpty ? null : _colorController.text.trim(),
      vin: _vinController.text.trim().isEmpty ? null : _vinController.text.trim(),
      mileage: _mileageController.text.trim().isEmpty ? null : int.parse(_mileageController.text.trim()),
    );

    try {
      await ref.read(vehicleProvider.notifier).createVehicle(request);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تمت إضافة السيارة بنجاح')),
      );
      Navigator.of(context).pop(true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('فشلت إضافة السيارة: ${e.toString()}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isCreating = ref.watch(vehicleProvider).isCreating;

    return Scaffold(
      appBar: AppBar(
        title: const Text('إضافة سيارة'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.all(20.w),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Icon(
                  Icons.directions_car_filled,
                  size: 64.sp,
                  color: Theme.of(context).colorScheme.primary,
                ),
                SizedBox(height: 16.h),
                Text(
                  'بيانات السيارة',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 24.sp,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 24.h),
                _buildField(
                  controller: _makeController,
                  label: 'الشركة المصنعة',
                  hint: 'مثال: Toyota',
                  icon: Icons.business,
                  validator: (value) => _requiredText(value, 'الشركة المصنعة مطلوبة', min: 2),
                ),
                SizedBox(height: 16.h),
                _buildField(
                  controller: _modelController,
                  label: 'الموديل',
                  hint: 'مثال: Corolla',
                  icon: Icons.car_repair,
                  validator: (value) => _requiredText(value, 'الموديل مطلوب', min: 2),
                ),
                SizedBox(height: 16.h),
                _buildField(
                  controller: _yearController,
                  label: 'سنة الصنع',
                  hint: 'مثال: 2020',
                  icon: Icons.calendar_today,
                  keyboardType: TextInputType.number,
                  validator: _validateYear,
                ),
                SizedBox(height: 16.h),
                _buildField(
                  controller: _plateController,
                  label: 'رقم اللوحة',
                  hint: 'أدخل رقم اللوحة',
                  icon: Icons.confirmation_number,
                  validator: (value) => _requiredText(value, 'رقم اللوحة مطلوب', min: 3),
                ),
                SizedBox(height: 16.h),
                _buildField(
                  controller: _colorController,
                  label: 'اللون',
                  hint: 'اختياري',
                  icon: Icons.palette,
                ),
                SizedBox(height: 16.h),
                _buildField(
                  controller: _vinController,
                  label: 'رقم الهيكل',
                  hint: 'اختياري',
                  icon: Icons.numbers,
                ),
                SizedBox(height: 16.h),
                _buildField(
                  controller: _mileageController,
                  label: 'الممشى',
                  hint: 'اختياري',
                  icon: Icons.speed,
                  keyboardType: TextInputType.number,
                  validator: _validateOptionalNumber,
                ),
                SizedBox(height: 28.h),
                ElevatedButton(
                  onPressed: isCreating ? null : _saveVehicle,
                  style: ElevatedButton.styleFrom(
                    padding: EdgeInsets.symmetric(vertical: 14.h),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
                  ),
                  child: isCreating
                      ? SizedBox(
                          width: 22.w,
                          height: 22.w,
                          child: const CircularProgressIndicator(strokeWidth: 2),
                        )
                      : Text(
                          'حفظ السيارة',
                          style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.bold),
                        ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      textDirection: TextDirection.rtl,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        prefixIcon: Icon(icon),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12.r)),
      ),
      validator: validator,
    );
  }

  String? _requiredText(String? value, String message, {int min = 1}) {
    final text = value?.trim() ?? '';
    if (text.isEmpty) return message;
    if (text.length < min) return 'يجب أن يكون الحقل $min أحرف على الأقل';
    return null;
  }

  String? _validateYear(String? value) {
    final year = int.tryParse(value?.trim() ?? '');
    final currentYear = DateTime.now().year + 1;
    if (year == null) return 'سنة الصنع مطلوبة';
    if (year < 1900 || year > currentYear) return 'يرجى إدخال سنة صحيحة';
    return null;
  }

  String? _validateOptionalNumber(String? value) {
    final text = value?.trim() ?? '';
    if (text.isEmpty) return null;
    final number = int.tryParse(text);
    if (number == null || number < 0) return 'يرجى إدخال رقم صحيح';
    return null;
  }
}
