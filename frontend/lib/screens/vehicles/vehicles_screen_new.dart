import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/design_system.dart';
import '../../models/customer.dart';
import '../../models/vehicle.dart';
import '../../state/customer_provider.dart';
import '../../state/vehicle_provider.dart';
import '../../widgets/app_button.dart';
import '../../widgets/app_modal.dart';
import '../../widgets/shimmer_loading.dart';

class VehiclesScreenNew extends ConsumerStatefulWidget {
  const VehiclesScreenNew({super.key});

  @override
  ConsumerState<VehiclesScreenNew> createState() => _VehiclesScreenNewState();
}

class _VehiclesScreenNewState extends ConsumerState<VehiclesScreenNew> {
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
                Text('السيارات', style: AppTypography.displaySmall.copyWith(fontSize: 28)),
                const SizedBox(height: 4),
                Text('إدارة السيارات واسنادها للعملاء', style: AppTypography.bodyLarge),
              ],
            ),
          ),
          AppButton(
            label: 'سيارة جديدة',
            icon: Icons.add,
            variant: ButtonVariant.primary,
            onPressed: () => _showAddVehicleDialog(),
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
                  Icon(Icons.search, size: 20, color: AppColors.textTertiary),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      style: AppTypography.bodyMedium,
                      decoration: InputDecoration(
                        hintText: 'بحث باللوحة، الموديل، أو اللون...',
                        hintStyle: AppTypography.bodyMedium.copyWith(color: AppColors.textTertiary),
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
                    color: isActive ? AppColors.primary.withOpacity(0.15) : AppColors.bgSecondary,
                    borderRadius: AppBorders.radiusFull,
                    border: isActive ? Border.all(color: AppColors.primary.withOpacity(0.3)) : null,
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
          childAspectRatio: 1.4,
        ),
        itemCount: filtered.length,
        itemBuilder: (context, index) {
          return _VehicleCard(
            vehicle: filtered[index],
            delay: index * 100,
          );
        },
      ),
    );
  }

  Widget _buildLoadingState() {
    return Padding(
      padding: const EdgeInsets.all(32),
      child: GridView.count(
        crossAxisCount: MediaQuery.of(context).size.width > 1200 ? 3 : 2,
        crossAxisSpacing: 20,
        mainAxisSpacing: 20,
        childAspectRatio: 1.4,
        children: List.generate(6, (index) => ShimmerLoading(
          child: Container(
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: AppBorders.radiusLg,
            ),
          ),
        )),
      ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, size: 48, color: AppColors.error.withOpacity(0.5)),
          const SizedBox(height: 16),
          Text('حدث خطأ في تحميل البيانات', style: AppTypography.bodyLarge),
          const SizedBox(height: 16),
          AppButton(
            label: 'إعادة المحاولة',
            variant: ButtonVariant.outline,
            onPressed: () => ref.invalidate(vehiclesProvider),
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
            child: Icon(Icons.directions_car_outlined, size: 48, color: AppColors.primary.withOpacity(0.5)),
          ),
          const SizedBox(height: 24),
          Text('لا توجد سيارات', style: AppTypography.headingSmall),
          const SizedBox(height: 8),
          Text('أضف سيارة جديدة للبدء', style: AppTypography.bodyLarge),
          const SizedBox(height: 24),
          AppButton(
            label: 'إضافة سيارة',
            icon: Icons.add,
            variant: ButtonVariant.primary,
            onPressed: () => _showAddVehicleDialog(),
          ),
        ],
      ),
    );
  }

  void _showAddVehicleDialog() {
    // Implementation
  }

  void _showAssignCustomerDialog(Vehicle vehicle) {
    AppModal.show(
      context: context,
      title: 'اسناد العميل',
      content: Consumer(
        builder: (context, ref, child) {
          final customersAsync = ref.watch(customersProvider);
          return customersAsync.when(
            data: (customers) => Column(
              children: customers.map((customer) => _buildCustomerRow(customer, vehicle)).toList(),
            ),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (_, __) => Text('خطأ في تحميل العملاء', style: AppTypography.bodyMedium),
          );
        },
      ),
    );
  }

  Widget _buildCustomerRow(Customer customer, Vehicle vehicle) {
    return GestureDetector(
      onTap: () {
        // Assign customer
        Navigator.pop(context);
      },
      child: Container(
        padding: const EdgeInsets.all(12),
        margin: const EdgeInsets.only(bottom: 8),
        decoration: BoxDecoration(
          color: AppColors.bgSecondary,
          borderRadius: AppBorders.radiusMd,
          border: Border.all(color: AppColors.border.withOpacity(0.3)),
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: [AppColors.primary.withOpacity(0.8), AppColors.accentPurple.withOpacity(0.8)]),
                borderRadius: AppBorders.radiusFull,
              ),
              child: Center(child: Text(customer.name[0], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(customer.name, style: AppTypography.labelMedium),
                  Text(customer.phone, style: AppTypography.bodySmall),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios, size: 16, color: AppColors.textTertiary),
          ],
        ),
      ),
    );
  }
}

class _VehicleCard extends StatefulWidget {
  final Vehicle vehicle;
  final int delay;

  const _VehicleCard({required this.vehicle, required this.delay});

  @override
  State<_VehicleCard> createState() => _VehicleCardState();
}

class _VehicleCardState extends State<_VehicleCard> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;
  bool _hovered = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _fadeAnimation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _controller, curve: AppAnimations.easeOut),
    );
    _slideAnimation = Tween<Offset>(begin: const Offset(0, 0.2), end: Offset.zero).animate(
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
      opacity: _fadeAnimation,
      child: SlideTransition(
        position: _slideAnimation,
        child: MouseRegion(
          onEnter: (_) => setState(() => _hovered = true),
          onExit: (_) => setState(() => _hovered = false),
          child: AnimatedContainer(
            duration: AppAnimations.normal,
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: AppBorders.radiusLg,
              border: Border.all(
                color: _hovered ? AppColors.primary.withOpacity(0.3) : AppColors.border.withOpacity(0.5),
              ),
              boxShadow: _hovered ? [AppShadows.lg, AppShadows.glow] : [AppShadows.md],
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
                          gradient: const LinearGradient(colors: AppColors.gradientPrimary),
                          borderRadius: AppBorders.radiusMd,
                        ),
                        child: const Icon(Icons.directions_car, color: Colors.white, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(v.model, style: AppTypography.labelLarge),
                            const SizedBox(height: 2),
                            Text('${v.year} · ${v.color}', style: AppTypography.bodySmall),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
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
                          onTap: hasCustomer ? null : () {},
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              color: hasCustomer ? AppColors.success.withOpacity(0.1) : AppColors.bgPrimary,
                              borderRadius: AppBorders.radiusMd,
                              border: Border.all(
                                color: hasCustomer ? AppColors.success.withOpacity(0.3) : AppColors.border.withOpacity(0.3),
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  hasCustomer ? Icons.check_circle : Icons.person_add,
                                  size: 16,
                                  color: hasCustomer ? AppColors.success : AppColors.textTertiary,
                                ),
                                const SizedBox(width: 6),
                                Flexible(
                                  child: Text(
                                    hasCustomer ? (v.customer?.name ?? 'عميل مسند') : 'اسناد عميل',
                                    style: AppTypography.labelSmall.copyWith(
                                      color: hasCustomer ? AppColors.success : AppColors.textSecondary,
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton(
                        icon: Icon(Icons.qr_code, size: 18, color: AppColors.textTertiary),
                        onPressed: () {},
                      ),
                      IconButton(
                        icon: Icon(Icons.edit_outlined, size: 18, color: AppColors.textSecondary),
                        onPressed: () {},
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
