import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/app_theme.dart';
import '../../models/booking.dart';
import '../../models/customer.dart';
import '../../models/vehicle.dart';
import '../../services/booking_service.dart';
import '../../services/customer_service.dart';
import '../../services/notification_service.dart';
import '../../services/vehicle_service.dart';
import '../../state/mechanic_provider.dart';

class MechanicReceiptScreen extends ConsumerStatefulWidget {
  const MechanicReceiptScreen({super.key});

  @override
  ConsumerState<MechanicReceiptScreen> createState() => _MechanicReceiptScreenState();
}

class _MechanicReceiptScreenState extends ConsumerState<MechanicReceiptScreen> {
  final _plateController = TextEditingController();
  final _customerNameController = TextEditingController();
  final _customerPhoneController = TextEditingController();
  final _serviceController = TextEditingController();
  final _vehicleModelController = TextEditingController();

  bool _loading = false;
  bool _creatingCustomer = false;
  Vehicle? _foundVehicle;
  Customer? _foundCustomer;

  final _customerService = CustomerService();
  final _vehicleService = VehicleService();
  final _bookingService = BookingService();

  Future<void> _searchVehicle() async {
    if (_plateController.text.trim().isEmpty) return;
    setState(() => _loading = true);

    try {
      final vehicles = await _vehicleService.getAllVehicles();
      final plate = _plateController.text.trim();
      final found = vehicles.where((v) => v.plateNumber == plate).toList();

      if (found.isNotEmpty) {
        setState(() {
          _foundVehicle = found.first;
          _vehicleModelController.text = found.first.model;
          _creatingCustomer = false;
        });
        if (found.first.customer != null) {
          setState(() {
            _foundCustomer = found.first.customer;
            _customerNameController.text = found.first.customer!.name;
            _customerPhoneController.text = found.first.customer!.phone;
          });
        }
        showSuccessToast(context, 'تم العثور على السيارة');
      } else {
        setState(() {
          _foundVehicle = null;
          _foundCustomer = null;
          _creatingCustomer = true;
        });
        showInfoToast(context, 'سيارة جديدة - أدخل البيانات');
      }
    } catch (e) {
      showErrorToast(context, 'خطأ: $e');
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _submit() async {
    final mechanic = ref.read(currentMechanicProvider);
    if (mechanic == null) return;

    if (_serviceController.text.trim().isEmpty) {
      showErrorToast(context, 'أدخل وصف الخدمة');
      return;
    }

    setState(() => _loading = true);

    try {
      String customerId;
      String vehicleId;

      if (_foundVehicle != null && _foundCustomer != null) {
        customerId = _foundCustomer!.id;
        vehicleId = _foundVehicle!.id;
      } else {
        // Create new customer
        if (_customerNameController.text.trim().isEmpty ||
            _customerPhoneController.text.trim().isEmpty) {
          showErrorToast(context, 'أدخل بيانات العميل');
          setState(() => _loading = false);
          return;
        }

        final newCustomer = Customer(
          id: '',
          name: _customerNameController.text.trim(),
          phone: _customerPhoneController.text.trim(),
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
        final createdCustomer = await _customerService.createCustomer(newCustomer);
        customerId = createdCustomer.id;

        // Create new vehicle
        final newVehicle = Vehicle(
          id: '',
          customerId: customerId,
          plateNumber: _plateController.text.trim(),
          model: _vehicleModelController.text.trim(),
          year: DateTime.now().year,
          color: '',
          fuelType: '',
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
        final createdVehicle = await _vehicleService.createVehicle(newVehicle);
        vehicleId = createdVehicle.id;
      }

      // Create booking
      final booking = Booking(
        id: '',
        vehicleId: vehicleId,
        technicianId: mechanic.id,
        serviceDescription: _serviceController.text.trim(),
        status: 'RECEIVED',
        scheduledDate: DateTime.now(),
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      await _bookingService.createBooking(booking);
      showSuccessToast(context, 'تم استلام السيارة بنجاح!');
      Navigator.pop(context);
    } catch (e) {
      showErrorToast(context, 'خطأ: $e');
    } finally {
      setState(() => _loading = false);
    }
  }

  Widget _buildField(String label, IconData icon, TextEditingController controller,
      {TextInputType? keyboardType, bool readOnly = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTypography.labelMedium.copyWith(color: AppColors.textMuted)),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          readOnly: readOnly,
          keyboardType: keyboardType,
          style: AppTypography.bodyMedium,
          decoration: InputDecoration(
            prefixIcon: Icon(icon, size: 20, color: AppColors.textMuted),
            filled: true,
            fillColor: AppColors.bgCard,
            border: OutlineInputBorder(
              borderRadius: AppBorders.radiusMd,
              borderSide: BorderSide(color: AppColors.border.withOpacity(0.3)),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      appBar: AppBar(
        backgroundColor: AppColors.bgPrimary,
        elevation: 0,
        title: Text('استلام سيارة', style: AppTypography.headingSmall),
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Plate Search
            Row(
              children: [
                Expanded(
                  child: _buildField('رقم اللوحة', Icons.pin_outlined, _plateController),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed: _loading ? null : _searchVehicle,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: AppBorders.radiusMd),
                  ),
                  child: _loading
                      ? const SizedBox(width: 20, height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.search, color: Colors.white),
                ),
              ],
            ),
            const SizedBox(height: 24),

            if (_foundVehicle != null) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.success.withOpacity(0.1),
                  borderRadius: AppBorders.radiusLg,
                  border: Border.all(color: AppColors.success.withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.check_circle, color: AppColors.success),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text('سيارة موجودة: ${_foundVehicle!.model}',
                        style: AppTypography.bodyMedium.copyWith(color: AppColors.success)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ],

            // Vehicle Info
            _buildField('موديل السيارة', Icons.directions_car_outlined,
              _vehicleModelController, readOnly: _foundVehicle != null),
            const SizedBox(height: 20),

            // Customer Info
            Text('بيانات العميل', style: AppTypography.headingSmall.copyWith(fontSize: 16)),
            const SizedBox(height: 12),
            _buildField('اسم العميل', Icons.person_outline, _customerNameController,
              readOnly: _foundCustomer != null),
            const SizedBox(height: 12),
            _buildField('رقم الهاتف', Icons.phone_outlined, _customerPhoneController,
              keyboardType: TextInputType.phone, readOnly: _foundCustomer != null),
            const SizedBox(height: 24),

            // Service
            _buildField('وصف الخدمة', Icons.build_outlined, _serviceController),
            const SizedBox(height: 32),

            // Submit
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _loading ? null : _submit,
                icon: _loading
                    ? const SizedBox(width: 20, height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.check, color: Colors.white),
                label: Text('استلام السيارة',
                  style: AppTypography.labelLarge.copyWith(color: Colors.white)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.success,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: AppBorders.radiusLg),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
