import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../models/customer.dart';
import '../../models/vehicle.dart';
import '../../services/notification_service.dart';
import '../../state/customer_provider.dart';
import '../../state/vehicle_provider.dart';

class VehiclesScreen extends ConsumerStatefulWidget {
  const VehiclesScreen({super.key});

  @override
  ConsumerState<VehiclesScreen> createState() => _VehiclesScreenState();
}

class _VehiclesScreenState extends ConsumerState<VehiclesScreen> {
  String? _selectedCustomerId;
  String? _selectedCustomerName;

  @override
  Widget build(BuildContext context) {
    final vehiclesAsync = ref.watch(vehiclesProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF1A1A2E) : const Color(0xFFF5F7FA),
      body: CustomScrollView(
        slivers: [
          // Creative AppBar
          SliverAppBar(
            expandedHeight: 140,
            floating: true,
            pinned: true,
            backgroundColor: const Color(0xFF1E88E5),
            flexibleSpace: FlexibleSpaceBar(
              title: const Text(
                'السيارات',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
              ),
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF1E88E5), Color(0xFF0D47A1)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: Center(
                  child: Icon(
                    Icons.directions_car,
                    size: 60,
                    color: Colors.white.withOpacity(0.15),
                  ),
                ),
              ),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.refresh, color: Colors.white),
                onPressed: () => ref.invalidate(vehiclesProvider),
              ),
            ],
          ),

          // Content
          vehiclesAsync.when(
            data: (vehicles) {
              if (vehicles.isEmpty) {
                return SliverFillRemaining(
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.directions_car_outlined,
                          size: 80,
                          color: Colors.grey[400],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'لا توجد سيارات مسجلة',
                          style: TextStyle(
                            fontSize: 18,
                            color: Colors.grey[500],
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'اضغط الزر + لإضافة سيارة جديدة',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[400],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }
              return SliverPadding(
                padding: const EdgeInsets.all(12),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final vehicle = vehicles[index];
                      return _buildVehicleCard(context, vehicle, isDark);
                    },
                    childCount: vehicles.length,
                  ),
                ),
              );
            },
            loading: () => const SliverFillRemaining(
              child: Center(child: CircularProgressIndicator()),
            ),
            error: (error, stack) => SliverFillRemaining(
              child: Center(child: Text('خطأ: $error')),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddDialog(context),
        backgroundColor: const Color(0xFF1E88E5),
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text(
          'سيارة جديدة',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }

  Widget _buildVehicleCard(BuildContext context, Vehicle vehicle, bool isDark) {
    final customerName = vehicle.customer?.name ?? 'غير مسند';
    final customerColor = vehicle.customer != null ? Colors.green : Colors.orange;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF16213E) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Material(
          color: Colors.transparent,
          child: ExpansionTile(
            tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            leading: Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1E88E5), Color(0xFF42A5F5)],
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.directions_car, color: Colors.white, size: 24),
            ),
            title: Text(
              vehicle.model,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Icons.pin, size: 14, color: Colors.grey[500]),
                    const SizedBox(width: 4),
                    Text(
                      vehicle.plateNumber,
                      style: TextStyle(fontSize: 13, color: Colors.grey[600]),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Icons.person, size: 14, color: customerColor),
                    const SizedBox(width: 4),
                    Text(
                      customerName,
                      style: TextStyle(
                        fontSize: 12,
                        color: customerColor,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1A1A2E) : const Color(0xFFF8F9FA),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Vehicle Info Grid
                    Wrap(
                      spacing: 16,
                      runSpacing: 12,
                      children: [
                        _buildInfoChip(Icons.calendar_today, 'السنة', '${vehicle.year}'),
                        _buildInfoChip(Icons.color_lens, 'اللون', vehicle.color),
                        _buildInfoChip(Icons.local_gas_station, 'الوقود', vehicle.fuelType),
                      ],
                    ),
                    if (vehicle.notes != null && vehicle.notes!.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      _buildInfoChip(Icons.notes, 'ملاحظات', vehicle.notes!),
                    ],
                    const SizedBox(height: 16),
                    // Action Buttons Row
                    Row(
                      children: [
                        _buildActionButton(
                          icon: Icons.qr_code,
                          label: 'QR',
                          color: const Color(0xFF4CAF50),
                          onPressed: () => _showQRDialog(context, vehicle),
                        ),
                        const SizedBox(width: 8),
                        _buildActionButton(
                          icon: Icons.edit,
                          label: 'تعديل',
                          color: const Color(0xFF2196F3),
                          onPressed: () => _showEditDialog(context, vehicle),
                        ),
                        const SizedBox(width: 8),
                        _buildActionButton(
                          icon: Icons.person_add,
                          label: vehicle.customerId.isEmpty ? 'اسناد' : 'تغيير',
                          color: const Color(0xFFFF9800),
                          onPressed: () => _showAssignCustomerDialog(context, vehicle),
                        ),
                        const SizedBox(width: 8),
                        _buildActionButton(
                          icon: Icons.delete_outline,
                          label: 'حذف',
                          color: const Color(0xFFF44336),
                          onPressed: () => _showDeleteDialog(context, vehicle),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.grey.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: Colors.grey[600]),
          const SizedBox(width: 6),
          Text(
            '$label: ',
            style: TextStyle(fontSize: 12, color: Colors.grey[500]),
          ),
          Text(
            value,
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.grey[800]),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onPressed,
  }) {
    return Expanded(
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: color.withOpacity(0.3), width: 1),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 20, color: color),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ========== ADD DIALOG WITH CUSTOMER ASSIGNMENT ==========
  void _showAddDialog(BuildContext context) {
    _selectedCustomerId = null;
    _selectedCustomerName = null;

    final plateController = TextEditingController();
    final modelController = TextEditingController();
    final yearController = TextEditingController(text: DateTime.now().year.toString());
    final colorController = TextEditingController();
    final fuelController = TextEditingController();
    final notesController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) {
          return AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            title: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E88E5).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.directions_car, color: Color(0xFF1E88E5)),
                ),
                const SizedBox(width: 12),
                const Text('إضافة سيارة جديدة', style: TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _buildTextField(plateController, 'رقم اللوحة', Icons.pin),
                  const SizedBox(height: 12),
                  _buildTextField(modelController, 'الموديل', Icons.directions_car),
                  const SizedBox(height: 12),
                  _buildTextField(yearController, 'السنة', Icons.calendar_today, keyboard: TextInputType.number),
                  const SizedBox(height: 12),
                  _buildTextField(colorController, 'اللون', Icons.color_lens),
                  const SizedBox(height: 12),
                  _buildTextField(fuelController, 'نوع الوقود', Icons.local_gas_station),
                  const SizedBox(height: 12),
                  _buildTextField(notesController, 'ملاحظات (اختياري)', Icons.notes),
                  const SizedBox(height: 16),

                  // Customer Assignment Button
                  _buildCustomerAssignmentButton(
                    context,
                    setDialogState,
                    isEdit: false,
                  ),
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('إلغاء', style: TextStyle(color: Colors.grey)),
              ),
              ElevatedButton.icon(
                icon: const Icon(Icons.save, size: 18),
                label: const Text('حفظ السيارة'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1E88E5),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: () async {
                  if (plateController.text.isEmpty || modelController.text.isEmpty) {
                    showErrorToast(context, 'رقم اللوحة والموديل مطلوبان');
                    return;
                  }
                  final newVehicle = Vehicle(
                    id: '',
                    customerId: _selectedCustomerId ?? '',
                    plateNumber: plateController.text,
                    model: modelController.text,
                    year: int.tryParse(yearController.text) ?? DateTime.now().year,
                    color: colorController.text,
                    fuelType: fuelController.text,
                    notes: notesController.text.isEmpty ? null : notesController.text,
                    createdAt: DateTime.now(),
                    updatedAt: DateTime.now(),
                  );
                  try {
                    await ref.read(vehicleServiceProvider).createVehicle(newVehicle);
                    ref.invalidate(vehiclesProvider);
                    if (mounted) {
                      Navigator.pop(context);
                      showSuccessToast(context, 'تم إضافة السيارة بنجاح!');
                    }
                  } catch (e) {
                    if (mounted) showErrorToast(context, 'خطأ: $e');
                  }
                },
              ),
            ],
          );
        },
      ),
    );
  }

  // ========== EDIT DIALOG WITH CUSTOMER ASSIGNMENT ==========
  void _showEditDialog(BuildContext context, Vehicle vehicle) {
    _selectedCustomerId = vehicle.customerId;
    _selectedCustomerName = vehicle.customer?.name;

    final plateController = TextEditingController(text: vehicle.plateNumber);
    final modelController = TextEditingController(text: vehicle.model);
    final yearController = TextEditingController(text: vehicle.year.toString());
    final colorController = TextEditingController(text: vehicle.color);
    final fuelController = TextEditingController(text: vehicle.fuelType);
    final notesController = TextEditingController(text: vehicle.notes ?? '');

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) {
          return AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            title: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF2196F3).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.edit, color: Color(0xFF2196F3)),
                ),
                const SizedBox(width: 12),
                const Text('تعديل السيارة', style: TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _buildTextField(plateController, 'رقم اللوحة', Icons.pin),
                  const SizedBox(height: 12),
                  _buildTextField(modelController, 'الموديل', Icons.directions_car),
                  const SizedBox(height: 12),
                  _buildTextField(yearController, 'السنة', Icons.calendar_today, keyboard: TextInputType.number),
                  const SizedBox(height: 12),
                  _buildTextField(colorController, 'اللون', Icons.color_lens),
                  const SizedBox(height: 12),
                  _buildTextField(fuelController, 'نوع الوقود', Icons.local_gas_station),
                  const SizedBox(height: 12),
                  _buildTextField(notesController, 'ملاحظات (اختياري)', Icons.notes),
                  const SizedBox(height: 16),

                  // Customer Assignment Button
                  _buildCustomerAssignmentButton(
                    context,
                    setDialogState,
                    isEdit: true,
                  ),
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('إلغاء', style: TextStyle(color: Colors.grey)),
              ),
              ElevatedButton.icon(
                icon: const Icon(Icons.save, size: 18),
                label: const Text('حفظ التعديلات'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2196F3),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: () async {
                  final updatedVehicle = Vehicle(
                    id: vehicle.id,
                    customerId: _selectedCustomerId ?? vehicle.customerId,
                    plateNumber: plateController.text,
                    model: modelController.text,
                    year: int.tryParse(yearController.text) ?? vehicle.year,
                    color: colorController.text,
                    fuelType: fuelController.text,
                    notes: notesController.text.isEmpty ? null : notesController.text,
                    createdAt: vehicle.createdAt,
                    updatedAt: DateTime.now(),
                  );
                  try {
                    await ref.read(vehicleServiceProvider).updateVehicle(vehicle.id, updatedVehicle);
                    ref.invalidate(vehiclesProvider);
                    if (mounted) {
                      Navigator.pop(context);
                      showSuccessToast(context, 'تم تحديث السيارة بنجاح!');
                    }
                  } catch (e) {
                    if (mounted) showErrorToast(context, 'خطأ: $e');
                  }
                },
              ),
            ],
          );
        },
      ),
    );
  }

  // ========== CUSTOMER ASSIGNMENT WIDGET ==========
  Widget _buildCustomerAssignmentButton(
    BuildContext context,
    StateSetter setDialogState, {
    required bool isEdit,
  }) {
    final isAssigned = _selectedCustomerId != null && _selectedCustomerId!.isNotEmpty;

    return InkWell(
      onTap: () => _showCustomerPicker(context, setDialogState),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isAssigned
              ? const Color(0xFF4CAF50).withOpacity(0.1)
              : const Color(0xFFFF9800).withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isAssigned
                ? const Color(0xFF4CAF50).withOpacity(0.3)
                : const Color(0xFFFF9800).withOpacity(0.3),
            width: 1.5,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: isAssigned ? const Color(0xFF4CAF50) : const Color(0xFFFF9800),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                isAssigned ? Icons.person : Icons.person_add,
                color: Colors.white,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    isAssigned ? 'العميل المسند' : 'اسناد السيارة لعميل',
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    isAssigned ? (_selectedCustomerName ?? 'عميل محدد') : 'اضغط لاختيار عميل',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: isAssigned ? const Color(0xFF4CAF50) : const Color(0xFFFF9800),
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.arrow_forward_ios,
              size: 16,
              color: isAssigned ? const Color(0xFF4CAF50) : const Color(0xFFFF9800),
            ),
          ],
        ),
      ),
    );
  }

  // ========== CUSTOMER PICKER DIALOG ==========
  void _showCustomerPicker(BuildContext dialogContext, StateSetter setDialogState) {
    final customersAsync = ref.read(customersProvider);

    showDialog(
      context: dialogContext,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFFFF9800).withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.people, color: Color(0xFFFF9800)),
            ),
            const SizedBox(width: 12),
            const Text('اختيار العميل', style: TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
        content: SizedBox(
          width: double.maxFinite,
          height: 350,
          child: ref.watch(customersProvider).when(
            data: (customers) {
              if (customers.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.people_outline, size: 60, color: Colors.grey[400]),
                      const SizedBox(height: 12),
                      Text(
                        'لا يوجد عملاء مسجلين',
                        style: TextStyle(color: Colors.grey[500]),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'أضف عميلاً أولاً من شاشة العملاء',
                        style: TextStyle(fontSize: 12, color: Colors.grey[400]),
                      ),
                    ],
                  ),
                );
              }
              return ListView.builder(
                itemCount: customers.length,
                itemBuilder: (context, index) {
                  final customer = customers[index];
                  final isSelected = _selectedCustomerId == customer.id;
                  return InkWell(
                    onTap: () {
                      setDialogState(() {
                        _selectedCustomerId = customer.id;
                        _selectedCustomerName = customer.name;
                      });
                      Navigator.pop(context);
                    },
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? const Color(0xFF1E88E5).withOpacity(0.1)
                            : Colors.grey.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSelected
                              ? const Color(0xFF1E88E5)
                              : Colors.transparent,
                          width: 2,
                        ),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFF1E88E5), Color(0xFF42A5F5)],
                              ),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Center(
                              child: Text(
                                customer.name.isNotEmpty ? customer.name[0] : '?',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  customer.name,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  customer.phone,
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey[600],
                                  ),
                                ),
                              ],
                            ),
                          ),
                          if (isSelected)
                            const Icon(Icons.check_circle, color: Color(0xFF1E88E5)),
                        ],
                      ),
                    ),
                  );
                },
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (error, stack) => Center(child: Text('خطأ: $error')),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إلغاء', style: TextStyle(color: Colors.grey)),
          ),
          if (_selectedCustomerId != null)
            TextButton(
              onPressed: () {
                setDialogState(() {
                  _selectedCustomerId = null;
                  _selectedCustomerName = null;
                });
                Navigator.pop(context);
              },
              child: const Text('إزالة الاسناد', style: TextStyle(color: Colors.red)),
            ),
        ],
      ),
    );
  }

  // ========== ASSIGN CUSTOMER DIALOG (FROM CARD) ==========
  void _showAssignCustomerDialog(BuildContext context, Vehicle vehicle) {
    _selectedCustomerId = vehicle.customerId;
    _selectedCustomerName = vehicle.customer?.name;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) {
          return AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            title: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFF9800).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.person_add, color: Color(0xFFFF9800)),
                ),
                const SizedBox(width: 12),
                const Text('اسناد السيارة', style: TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  '${vehicle.model} - ${vehicle.plateNumber}',
                  style: const TextStyle(fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 16),
                _buildCustomerAssignmentButton(
                  context,
                  setDialogState,
                  isEdit: true,
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('إلغاء', style: TextStyle(color: Colors.grey)),
              ),
              ElevatedButton.icon(
                icon: const Icon(Icons.save, size: 18),
                label: const Text('حفظ الاسناد'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFF9800),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: () async {
                  final updatedVehicle = Vehicle(
                    id: vehicle.id,
                    customerId: _selectedCustomerId ?? vehicle.customerId,
                    plateNumber: vehicle.plateNumber,
                    model: vehicle.model,
                    year: vehicle.year,
                    color: vehicle.color,
                    fuelType: vehicle.fuelType,
                    notes: vehicle.notes,
                    createdAt: vehicle.createdAt,
                    updatedAt: DateTime.now(),
                  );
                  try {
                    await ref.read(vehicleServiceProvider).updateVehicle(vehicle.id, updatedVehicle);
                    ref.invalidate(vehiclesProvider);
                    if (mounted) {
                      Navigator.pop(context);
                      showSuccessToast(context, 'تم اسناد السيارة بنجاح!');
                    }
                  } catch (e) {
                    if (mounted) showErrorToast(context, 'خطأ: $e');
                  }
                },
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildTextField(
    TextEditingController controller,
    String label,
    IconData icon, {
    TextInputType keyboard = TextInputType.text,
  }) {
    return TextField(
      controller: controller,
      keyboardType: keyboard,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: const Color(0xFF1E88E5)),
        filled: true,
        fillColor: Colors.grey.withOpacity(0.05),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.withOpacity(0.2)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF1E88E5), width: 2),
        ),
      ),
    );
  }

  void _showQRDialog(BuildContext context, Vehicle vehicle) {
    final trackingUrl = 'https://garage-management.pages.dev/track/${vehicle.id}';

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('QR Code - تتبع السيارة', style: TextStyle(fontWeight: FontWeight.bold)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '${vehicle.model} - ${vehicle.plateNumber}',
                style: const TextStyle(fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 10,
                    ),
                  ],
                ),
                child: QrImageView(
                  data: trackingUrl,
                  version: QrVersions.auto,
                  size: 220.0,
                ),
              ),
              const SizedBox(height: 16),
              SelectableText(
                trackingUrl,
                style: const TextStyle(fontSize: 12, color: Colors.grey),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إغلاق'),
          ),
          ElevatedButton.icon(
            onPressed: () {
              Clipboard.setData(ClipboardData(text: trackingUrl));
              showSuccessToast(context, 'تم نسخ الرابط!');
            },
            icon: const Icon(Icons.copy, size: 18),
            label: const Text('نسخ الرابط'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF4CAF50),
              foregroundColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  void _showDeleteDialog(BuildContext context, Vehicle vehicle) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(Icons.warning, color: Colors.red),
            const SizedBox(width: 8),
            const Text('تأكيد الحذف'),
          ],
        ),
        content: Text('هل أنت متأكد من حذف ${vehicle.model} (${vehicle.plateNumber})؟'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إلغاء', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton.icon(
            icon: const Icon(Icons.delete, size: 18),
            label: const Text('حذف'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () async {
              try {
                await ref.read(vehicleServiceProvider).deleteVehicle(vehicle.id);
                ref.invalidate(vehiclesProvider);
                if (mounted) {
                  Navigator.pop(context);
                  showSuccessToast(context, 'تم حذف السيارة بنجاح!');
                }
              } catch (e) {
                if (mounted) showErrorToast(context, 'خطأ: $e');
              }
            },
          ),
        ],
      ),
    );
  }
}
