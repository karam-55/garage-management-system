import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/app_theme.dart';
import '../../models/customer.dart';
import '../../models/vehicle.dart';
import '../../state/customer_provider.dart';
import '../../state/vehicle_provider.dart';
import '../../services/notification_service.dart';

class VehiclesScreenV2 extends ConsumerStatefulWidget {
  const VehiclesScreenV2({super.key});

  @override
  ConsumerState<VehiclesScreenV2> createState() => _VehiclesScreenV2State();
}

class _VehiclesScreenV2State extends ConsumerState<VehiclesScreenV2> {
  String _searchQuery = '';
  String _filterStatus = 'all';

  @override
  Widget build(BuildContext context) {
    final vehiclesAsync = ref.watch(vehiclesProvider);

    return Container(
      color: AppColors.bgPrimary,
      child: Column(
        children: [
          _buildHeader(),
          _buildFilters(),
          Expanded(
            child: vehiclesAsync.when(
              data: (vehicles) => _buildVehiclesGrid(vehicles),
              loading: () => _buildLoadingState(),
              error: (_, __) => _buildErrorState(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'السيارات',
                  style: AppTypography.displaySmall.copyWith(fontSize: 28),
                ),
                const SizedBox(height: 4),
                Text(
                  'إدارة السيارات واسنادها للعملاء',
                  style: AppTypography.bodyLarge,
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: () => _showAddVehicleDialog(),
            child: AnimatedContainer(
              duration: AppAnimations.normal,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: AppColors.gradientPrimary,
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: AppBorders.radiusMd,
                boxShadow: [AppShadows.glow(AppColors.primary)],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.add, color: Colors.white, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    'سيارة جديدة',
                    style: AppTypography.labelLarge.copyWith(
                      color: Colors.white,
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilters() {
    final filters = [
      {'label': 'الكل', 'value': 'all'},
      {'label': 'مؤكدة', 'value': 'confirmed'},
      {'label': 'في الصيانة', 'value': 'maintenance'},
      {'label': 'بدون عميل', 'value': 'unassigned'},
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32),
      child: Row(
        children: [
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: AppColors.bgSecondary,
                borderRadius: AppBorders.radiusLg,
                border: Border.all(color: AppColors.border.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  Icon(Icons.search, size: 20, color: AppColors.textMuted),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      style: AppTypography.bodyMedium,
                      decoration: InputDecoration(
                        hintText: 'بحث باللوحة، الموديل، أو اللون...',
                        hintStyle: AppTypography.bodyMedium.copyWith(
                          color: AppColors.textMuted,
                        ),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                      onChanged: (value) => setState(() => _searchQuery = value),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 16),
          ...filters.map((filter) {
            final isActive = _filterStatus == filter['value'];
            return Padding(
              padding: const EdgeInsets.only(left: 8),
              child: GestureDetector(
                onTap: () => setState(() => _filterStatus = filter['value']!),
                child: AnimatedContainer(
                  duration: AppAnimations.fast,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: isActive
                        ? AppColors.primary.withOpacity(0.15)
                        : AppColors.bgSecondary,
                    borderRadius: AppBorders.radiusFull,
                    border: isActive
                        ? Border.all(color: AppColors.primary.withOpacity(0.3))
                        : null,
                  ),
                  child: Text(
                    filter['label']!,
                    style: AppTypography.labelSmall.copyWith(
                      color: isActive ? AppColors.primary : AppColors.textSecondary,
                      fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildVehiclesGrid(List<Vehicle> vehicles) {
    final filtered = vehicles.where((v) {
      if (_searchQuery.isEmpty) return true;
      final q = _searchQuery.toLowerCase();
      return v.plateNumber.toLowerCase().contains(q) ||
          v.model.toLowerCase().contains(q) ||
          v.color.toLowerCase().contains(q);
    }).toList();

    if (filtered.isEmpty) {
      return _buildEmptyState();
    }

    return Padding(
      padding: const EdgeInsets.all(32),
      child: GridView.builder(
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: MediaQuery.of(context).size.width > 1200 ? 3 : 2,
          crossAxisSpacing: 20,
          mainAxisSpacing: 20,
          childAspectRatio: 1.3,
        ),
        itemCount: filtered.length,
        itemBuilder: (context, index) {
          return _VehicleCard(
            vehicle: filtered[index],
            delay: index * 100,
            onAssignCustomer: () => _showAssignCustomerDialog(filtered[index]),
            onEdit: () => _showEditVehicleDialog(filtered[index]),
            onDelete: () => _showDeleteDialog(filtered[index]),
          );
        },
      ),
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(
            width: 48,
            height: 48,
            child: CircularProgressIndicator(
              strokeWidth: 3,
              valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
            ),
          ),
          const SizedBox(height: 20),
          Text('جاري التحميل...', style: AppTypography.bodyLarge),
        ],
      ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.error.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.error_outline, size: 40, color: AppColors.error),
          ),
          const SizedBox(height: 20),
          Text(
            'حدث خطأ في تحميل البيانات',
            style: AppTypography.bodyLarge.copyWith(color: AppColors.error),
          ),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: () => ref.invalidate(vehiclesProvider),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.15),
                borderRadius: AppBorders.radiusMd,
                border: Border.all(color: AppColors.primary.withOpacity(0.3)),
              ),
              child: Text(
                'إعادة المحاولة',
                style: AppTypography.labelMedium.copyWith(color: AppColors.primary),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.directions_car_outlined,
                size: 40, color: AppColors.primary.withOpacity(0.5)),
          ),
          const SizedBox(height: 20),
          Text('لا توجد سيارات', style: AppTypography.headingSmall),
          const SizedBox(height: 8),
          Text('أضف سيارة جديدة للبدء', style: AppTypography.bodyLarge),
          const SizedBox(height: 24),
          GestureDetector(
            onTap: () => _showAddVehicleDialog(),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: AppColors.gradientPrimary),
                borderRadius: AppBorders.radiusMd,
                boxShadow: [AppShadows.glow(AppColors.primary)],
              ),
              child: Text(
                'إضافة سيارة',
                style: AppTypography.labelLarge.copyWith(
                  color: Colors.white,
                  fontSize: 13,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Dialogs
  void _showAddVehicleDialog() {
    final plateController = TextEditingController();
    final modelController = TextEditingController();
    final yearController = TextEditingController(text: DateTime.now().year.toString());
    final colorController = TextEditingController();
    final fuelController = TextEditingController();

    _showVehicleDialog(
      title: 'إضافة سيارة جديدة',
      plateController: plateController,
      modelController: modelController,
      yearController: yearController,
      colorController: colorController,
      fuelController: fuelController,
      onSave: () async {
        final newVehicle = Vehicle(
          id: '',
          customerId: null,
          plateNumber: plateController.text,
          model: modelController.text,
          year: int.tryParse(yearController.text) ?? DateTime.now().year,
          color: colorController.text,
          fuelType: fuelController.text,
          notes: null,
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
          customer: null,
        );
        try {
          await ref.read(vehicleServiceProvider).createVehicle(newVehicle);
          ref.invalidate(vehiclesProvider);
          Navigator.pop(context);
          showSuccessToast(context, 'تم إضافة السيارة بنجاح!');
        } catch (e) {
          showErrorToast(context, 'خطأ: $e');
        }
      },
    );
  }

  void _showEditVehicleDialog(Vehicle vehicle) {
    final plateController = TextEditingController(text: vehicle.plateNumber);
    final modelController = TextEditingController(text: vehicle.model);
    final yearController = TextEditingController(text: vehicle.year.toString());
    final colorController = TextEditingController(text: vehicle.color);
    final fuelController = TextEditingController(text: vehicle.fuelType);

    _showVehicleDialog(
      title: 'تعديل السيارة',
      plateController: plateController,
      modelController: modelController,
      yearController: yearController,
      colorController: colorController,
      fuelController: fuelController,
      onSave: () async {
        final updated = Vehicle(
          id: vehicle.id,
          customerId: vehicle.customerId,
          plateNumber: plateController.text,
          model: modelController.text,
          year: int.tryParse(yearController.text) ?? vehicle.year,
          color: colorController.text,
          fuelType: fuelController.text,
          notes: vehicle.notes,
          createdAt: vehicle.createdAt,
          updatedAt: DateTime.now(),
          customer: vehicle.customer,
        );
        try {
          await ref.read(vehicleServiceProvider).updateVehicle(vehicle.id, updated);
          ref.invalidate(vehiclesProvider);
          Navigator.pop(context);
          showSuccessToast(context, 'تم تحديث السيارة بنجاح!');
        } catch (e) {
          showErrorToast(context, 'خطأ: $e');
        }
      },
    );
  }

  void _showVehicleDialog({
    required String title,
    required TextEditingController plateController,
    required TextEditingController modelController,
    required TextEditingController yearController,
    required TextEditingController colorController,
    required TextEditingController fuelController,
    required VoidCallback onSave,
  }) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        child: Container(
          constraints: const BoxConstraints(maxWidth: 480),
          decoration: BoxDecoration(
            color: AppColors.bgSecondary,
            borderRadius: AppBorders.radiusXl,
            border: Border.all(color: AppColors.border.withOpacity(0.4)),
            boxShadow: [AppShadows.xl],
          ),
          child: ClipRRect(
            borderRadius: AppBorders.radiusXl,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.fromLTRB(24, 20, 16, 12),
                  decoration: BoxDecoration(
                    color: AppColors.bgTertiary.withOpacity(0.5),
                    border: Border(
                      bottom: BorderSide(color: AppColors.border.withOpacity(0.3)),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(title, style: AppTypography.headingSmall.copyWith(fontSize: 16)),
                      GestureDetector(
                        onTap: () => Navigator.pop(context),
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: AppColors.bgTertiary,
                            borderRadius: AppBorders.radiusMd,
                          ),
                          child: Icon(Icons.close, size: 18, color: AppColors.textTertiary),
                        ),
                      ),
                    ],
                  ),
                ),
                Flexible(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        _buildField('رقم اللوحة *', Icons.pin_outlined, plateController),
                        const SizedBox(height: 16),
                        _buildField('الموديل *', Icons.directions_car_outlined, modelController),
                        const SizedBox(height: 16),
                        _buildField('السنة', Icons.calendar_today_outlined, yearController,
                            keyboardType: TextInputType.number),
                        const SizedBox(height: 16),
                        _buildField('اللون', Icons.palette_outlined, colorController),
                        const SizedBox(height: 16),
                        _buildField('نوع الوقود', Icons.local_gas_station_outlined, fuelController),
                      ],
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.fromLTRB(24, 0, 24, 20),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: Text('إلغاء',
                            style: AppTypography.labelMedium.copyWith(
                                color: AppColors.textTertiary)),
                      ),
                      const SizedBox(width: 8),
                      GestureDetector(
                        onTap: onSave,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(colors: AppColors.gradientPrimary),
                            borderRadius: AppBorders.radiusMd,
                            boxShadow: [AppShadows.glow(AppColors.primary)],
                          ),
                          child: Text(
                            'حفظ',
                            style: AppTypography.labelLarge.copyWith(
                              color: Colors.white,
                              fontSize: 13,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showAssignCustomerDialog(Vehicle vehicle) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        child: Container(
          constraints: const BoxConstraints(maxWidth: 440, maxHeight: 600),
          decoration: BoxDecoration(
            color: AppColors.bgSecondary,
            borderRadius: AppBorders.radiusXl,
            border: Border.all(color: AppColors.border.withOpacity(0.4)),
            boxShadow: [AppShadows.xl],
          ),
          child: ClipRRect(
            borderRadius: AppBorders.radiusXl,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.fromLTRB(24, 20, 16, 12),
                  decoration: BoxDecoration(
                    color: AppColors.bgTertiary.withOpacity(0.5),
                    border: Border(
                      bottom: BorderSide(color: AppColors.border.withOpacity(0.3)),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('اسناد العميل', style: AppTypography.headingSmall.copyWith(fontSize: 16)),
                      GestureDetector(
                        onTap: () => Navigator.pop(context),
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: AppColors.bgTertiary,
                            borderRadius: AppBorders.radiusMd,
                          ),
                          child: Icon(Icons.close, size: 18, color: AppColors.textTertiary),
                        ),
                      ),
                    ],
                  ),
                ),
                Flexible(
                  child: Consumer(
                    builder: (context, ref, child) {
                      final customersAsync = ref.watch(customersProvider);
                      return customersAsync.when(
                        data: (customers) {
                          if (customers.isEmpty) {
                            return Center(
                              child: Text('لا يوجد عملاء',
                                  style: AppTypography.bodyLarge),
                            );
                          }
                          return ListView.builder(
                            padding: const EdgeInsets.all(16),
                            itemCount: customers.length,
                            itemBuilder: (context, index) {
                              final customer = customers[index];
                              final isAssigned = vehicle.customerId == customer.id;
                              return GestureDetector(
                                onTap: () async {
                                  try {
                                    final updated = Vehicle(
                                      id: vehicle.id,
                                      customerId: customer.id,
                                      plateNumber: vehicle.plateNumber,
                                      model: vehicle.model,
                                      year: vehicle.year,
                                      color: vehicle.color,
                                      fuelType: vehicle.fuelType,
                                      notes: vehicle.notes,
                                      createdAt: vehicle.createdAt,
                                      updatedAt: DateTime.now(),
                                      customer: customer,
                                    );
                                    await ref.read(vehicleServiceProvider).updateVehicle(
                                        vehicle.id, updated);
                                    ref.invalidate(vehiclesProvider);
                                    Navigator.pop(context);
                                    showSuccessToast(context, 'تم اسناد السيارة بنجاح!');
                                  } catch (e) {
                                    showErrorToast(context, 'خطأ: $e');
                                  }
                                },
                                child: AnimatedContainer(
                                  duration: AppAnimations.fast,
                                  padding: const EdgeInsets.all(14),
                                  margin: const EdgeInsets.only(bottom: 8),
                                  decoration: BoxDecoration(
                                    color: isAssigned
                                        ? AppColors.primary.withOpacity(0.12)
                                        : AppColors.bgPrimary,
                                    borderRadius: AppBorders.radiusMd,
                                    border: Border.all(
                                      color: isAssigned
                                          ? AppColors.primary.withOpacity(0.3)
                                          : AppColors.border.withOpacity(0.2),
                                    ),
                                  ),
                                  child: Row(
                                    children: [
                                      Container(
                                        width: 40,
                                        height: 40,
                                        decoration: BoxDecoration(
                                          gradient: LinearGradient(
                                            colors: [
                                              AppColors.primary.withOpacity(0.8),
                                              AppColors.accentPurple.withOpacity(0.8),
                                            ],
                                          ),
                                          borderRadius: AppBorders.radiusFull,
                                        ),
                                        child: Center(
                                          child: Text(
                                            customer.name[0],
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(customer.name,
                                                style: AppTypography.labelMedium),
                                            Text(customer.phone,
                                                style: AppTypography.bodySmall),
                                          ],
                                        ),
                                      ),
                                      if (isAssigned)
                                        Icon(Icons.check_circle,
                                            color: AppColors.primary),
                                    ],
                                  ),
                                ),
                              );
                            },
                          );
                        },
                        loading: () => const Center(
                            child: CircularProgressIndicator()),
                        error: (_, __) => Center(
                          child: Text('خطأ في تحميل العملاء',
                              style: AppTypography.bodyMedium),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showDeleteDialog(Vehicle vehicle) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.bgSecondary,
        shape: RoundedRectangleBorder(
          borderRadius: AppBorders.radiusXl,
          side: BorderSide(color: AppColors.border.withOpacity(0.3)),
        ),
        title: Text('حذف السيارة', style: AppTypography.headingSmall),
        content: Text(
          'هل أنت متأكد من حذف ${vehicle.model} - ${vehicle.plateNumber}؟',
          style: AppTypography.bodyMedium,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('إلغاء', style: AppTypography.labelMedium.copyWith(
                color: AppColors.textTertiary)),
          ),
          GestureDetector(
            onTap: () async {
              try {
                await ref.read(vehicleServiceProvider).deleteVehicle(vehicle.id);
                ref.invalidate(vehiclesProvider);
                Navigator.pop(context);
                showSuccessToast(context, 'تم حذف السيارة بنجاح!');
              } catch (e) {
                showErrorToast(context, 'خطأ: $e');
              }
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              decoration: BoxDecoration(
                color: AppColors.error.withOpacity(0.15),
                borderRadius: AppBorders.radiusMd,
              ),
              child: Text('حذف',
                  style: AppTypography.labelMedium.copyWith(
                      color: AppColors.error)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildField(
    String label,
    IconData icon,
    TextEditingController controller, {
    TextInputType? keyboardType,
  }) {
    return TextField(
      controller: controller,
      style: AppTypography.bodyMedium,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        labelText: label,
        labelStyle: AppTypography.labelSmall.copyWith(
          color: AppColors.textTertiary,
        ),
        prefixIcon: Icon(icon, size: 20, color: AppColors.textMuted),
        filled: true,
        fillColor: AppColors.bgPrimary,
        border: OutlineInputBorder(
          borderRadius: AppBorders.radiusMd,
          borderSide: BorderSide(color: AppColors.border.withOpacity(0.4)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: AppBorders.radiusMd,
          borderSide: BorderSide(color: AppColors.border.withOpacity(0.3)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: AppBorders.radiusMd,
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
    );
  }
}

// ============================================================
// VEHICLE CARD
// ============================================================
class _VehicleCard extends StatefulWidget {
  final Vehicle vehicle;
  final int delay;
  final VoidCallback onAssignCustomer;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const _VehicleCard({
    required this.vehicle,
    required this.delay,
    required this.onAssignCustomer,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  State<_VehicleCard> createState() => _VehicleCardState();
}

class _VehicleCardState extends State<_VehicleCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnim;
  late Animation<Offset> _slideAnim;
  bool _hovered = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _fadeAnim = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _controller, curve: AppAnimations.easeOut),
    );
    _slideAnim = Tween<Offset>(
      begin: const Offset(0, 0.2),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(parent: _controller, curve: AppAnimations.easeOut),
    );
    Future.delayed(Duration(milliseconds: widget.delay), () {
      if (mounted) _controller.forward();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final v = widget.vehicle;
    final hasCustomer = v.customerId != null && v.customerId!.isNotEmpty;

    return FadeTransition(
      opacity: _fadeAnim,
      child: SlideTransition(
        position: _slideAnim,
        child: MouseRegion(
          onEnter: (_) => setState(() => _hovered = true),
          onExit: (_) => setState(() => _hovered = false),
          child: AnimatedContainer(
            duration: AppAnimations.normal,
            decoration: BoxDecoration(
              color: AppColors.bgCard,
              borderRadius: AppBorders.radiusLg,
              border: Border.all(
                color: _hovered
                    ? AppColors.primary.withOpacity(0.3)
                    : AppColors.border.withOpacity(0.3),
              ),
              boxShadow: _hovered
                  ? [AppShadows.lg, AppShadows.glow(AppColors.primary)]
                  : [AppShadows.md],
            ),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: AppColors.gradientPrimary,
                          ),
                          borderRadius: AppBorders.radiusMd,
                          boxShadow: [AppShadows.glow(AppColors.primary)],
                        ),
                        child: const Icon(
                          Icons.directions_car,
                          color: Colors.white,
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(v.model, style: AppTypography.labelLarge),
                            const SizedBox(height: 2),
                            Text('${v.year} · ${v.color}',
                                style: AppTypography.bodySmall),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.1),
                          borderRadius: AppBorders.radiusFull,
                        ),
                        child: Text(
                          v.plateNumber,
                          style: AppTypography.labelSmall.copyWith(
                            color: AppColors.primary,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ),
                    ],
                  ),
                  const Spacer(),
                  Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: widget.onAssignCustomer,
                          child: AnimatedContainer(
                            duration: AppAnimations.fast,
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              color: hasCustomer
                                  ? AppColors.success.withOpacity(0.1)
                                  : AppColors.bgPrimary,
                              borderRadius: AppBorders.radiusMd,
                              border: Border.all(
                                color: hasCustomer
                                    ? AppColors.success.withOpacity(0.3)
                                    : AppColors.border.withOpacity(0.2),
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  hasCustomer
                                      ? Icons.check_circle
                                      : Icons.person_add,
                                  size: 16,
                                  color: hasCustomer
                                      ? AppColors.success
                                      : AppColors.textTertiary,
                                ),
                                const SizedBox(width: 6),
                                Flexible(
                                  child: Text(
                                    hasCustomer
                                        ? (v.customer?.name ?? 'عميل مسند')
                                        : 'اسناد عميل',
                                    style: AppTypography.labelSmall.copyWith(
                                      color: hasCustomer
                                          ? AppColors.success
                                          : AppColors.textSecondary,
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 6),
                      GestureDetector(
                        onTap: widget.onEdit,
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppColors.accentBlue.withOpacity(0.1),
                            borderRadius: AppBorders.radiusSm,
                          ),
                          child: Icon(
                            Icons.edit_outlined,
                            size: 16,
                            color: AppColors.accentBlue,
                          ),
                        ),
                      ),
                      const SizedBox(width: 6),
                      GestureDetector(
                        onTap: widget.onDelete,
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppColors.error.withOpacity(0.1),
                            borderRadius: AppBorders.radiusSm,
                          ),
                          child: Icon(
                            Icons.delete_outline,
                            size: 16,
                            color: AppColors.error,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
