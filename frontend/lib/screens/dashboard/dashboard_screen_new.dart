import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/design_system.dart';
import '../../core/transitions.dart';
import '../../state/dashboard_provider.dart';
import '../../widgets/app_button.dart';
import '../../widgets/app_card.dart';
import '../../widgets/custom_loader.dart';
import '../../widgets/shimmer_loading.dart';
import '../customers/customers_screen.dart';
import '../vehicles/vehicles_screen.dart';
import '../technicians/technicians_screen.dart';
import '../bookings/bookings_screen.dart';
import '../invoices/invoices_screen.dart';
import '../inventory/inventory_screen.dart';

class DashboardScreenNew extends ConsumerWidget {
  const DashboardScreenNew({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(dashboardStatsProvider);
    final isWide = MediaQuery.of(context).size.width > 1200;

    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            _buildHeader(context),
            const SizedBox(height: 32),
            
            // Stats
            statsAsync.when(
              data: (stats) => _buildStatsGrid(context, stats, isWide),
              loading: () => _buildStatsShimmer(isWide),
              error: (_, __) => _buildError(),
            ),
            const SizedBox(height: 32),
            
            // Main Content
            _buildMainContent(context, isWide, statsAsync.value),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('لوحة التحكم', style: AppTypography.displaySmall.copyWith(fontSize: 32)),
              const SizedBox(height: 4),
              Text(
                'نظرة عامة على أداء الكراج',
                style: AppTypography.bodyLarge,
              ),
            ],
          ),
        ),
        AppButton(
          label: 'تقرير اليوم',
          icon: Icons.download,
          variant: ButtonVariant.outline,
          size: ButtonSize.sm,
          onPressed: () {},
        ),
      ],
    );
  }

  Widget _buildStatsGrid(BuildContext context, Map<String, dynamic> stats, bool isWide) {
    final crossAxisCount = isWide ? 4 : 2;
    return LayoutBuilder(
      builder: (context, constraints) {
        return GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: crossAxisCount,
          crossAxisSpacing: 20,
          mainAxisSpacing: 20,
          childAspectRatio: 1.6,
          children: [
            StatCard(
              title: 'إجمالي الإيرادات',
              value: '\$${stats['totalRevenue'].toStringAsFixed(0)}',
              subtitle: '${stats['paidInvoices']} فاتورة مدفوعة',
              icon: Icons.payments,
              color: AppColors.primary,
              trend: 12.5,
            ),
            StatCard(
              title: 'العملاء',
              value: '${stats['totalCustomers']}',
              subtitle: 'عميل مسجل',
              icon: Icons.people,
              color: AppColors.accentBlue,
              trend: 5.2,
            ),
            StatCard(
              title: 'السيارات',
              value: '${stats['totalVehicles']}',
              subtitle: 'سيارة في النظام',
              icon: Icons.directions_car,
              color: AppColors.secondary,
              trend: 8.1,
            ),
            StatCard(
              title: 'الحجوزات',
              value: '${stats['totalBookings']}',
              subtitle: '${stats['todayBookings']} جديدة اليوم',
              icon: Icons.calendar_today,
              color: AppColors.accentPurple,
              trend: -2.4,
            ),
          ],
        );
      },
    );
  }

  Widget _buildStatsShimmer(bool isWide) {
    final crossAxisCount = isWide ? 4 : 2;
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: crossAxisCount,
      crossAxisSpacing: 20,
      mainAxisSpacing: 20,
      childAspectRatio: 1.6,
      children: List.generate(4, (index) => ShimmerLoading(
        child: Container(
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: AppBorders.radiusLg,
          ),
          height: 140,
        ),
      )),
    );
  }

  Widget _buildError() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: AppBorders.radiusLg,
      ),
      child: Row(
        children: [
          Icon(Icons.error_outline, color: AppColors.error, size: 24),
          const SizedBox(width: 12),
          Text('حدث خطأ في تحميل البيانات', style: AppTypography.bodyLarge.copyWith(color: AppColors.error)),
        ],
      ),
    );
  }

  Widget _buildMainContent(BuildContext context, bool isWide, Map<String, dynamic>? stats) {
    if (isWide) {
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 2,
            child: _buildQuickActions(context),
          ),
          const SizedBox(width: 24),
          Expanded(
            child: _buildRecentActivity(context, stats),
          ),
        ],
      );
    }
    return Column(
      children: [
        _buildQuickActions(context),
        const SizedBox(height: 24),
        _buildRecentActivity(context, stats),
      ],
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    final actions = [
      _QuickAction(
        icon: Icons.people,
        label: 'العملاء',
        description: 'إدارة قائمة العملاء',
        color: AppColors.accentBlue,
        screen: const CustomersScreen(),
      ),
      _QuickAction(
        icon: Icons.directions_car,
        label: 'السيارات',
        description: 'تسجيل وإدارة السيارات',
        color: AppColors.secondary,
        screen: const VehiclesScreen(),
      ),
      _QuickAction(
        icon: Icons.build,
        label: 'الفنيين',
        description: 'إدارة فريق الفنيين',
        color: AppColors.accentOrange,
        screen: const TechniciansScreen(),
      ),
      _QuickAction(
        icon: Icons.calendar_today,
        label: 'الحجوزات',
        description: 'جدولة المواعيد',
        color: AppColors.accentPurple,
        screen: const BookingsScreen(),
      ),
      _QuickAction(
        icon: Icons.receipt,
        label: 'الفواتير',
        description: 'الفواتير والمدفوعات',
        color: AppColors.accentRed,
        screen: const InvoicesScreen(),
      ),
      _QuickAction(
        icon: Icons.inventory_2,
        label: 'المخزون',
        description: 'إدارة قطع الغيار',
        color: AppColors.accentCyan,
        screen: const InventoryScreen(),
      ),
    ];

    return AppCard(
      header: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text('الوصول السريع', style: AppTypography.headingSmall.copyWith(fontSize: 16)),
          AppButton(
            label: 'عرض الكل',
            variant: ButtonVariant.ghost,
            size: ButtonSize.sm,
            onPressed: () {},
          ),
        ],
      ),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 3.5,
        ),
        itemCount: actions.length,
        itemBuilder: (context, index) {
          final action = actions[index];
          return _buildActionTile(context, action);
        },
      ),
    );
  }

  Widget _buildActionTile(BuildContext context, _QuickAction action) {
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: () => Navigator.push(context, slideRightRoute(action.screen)),
        child: AnimatedContainer(
          duration: AppAnimations.fast,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.bgPrimary,
            borderRadius: AppBorders.radiusMd,
            border: Border.all(color: AppColors.border.withOpacity(0.3)),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: action.color.withOpacity(0.1),
                  borderRadius: AppBorders.radiusMd,
                ),
                child: Icon(action.icon, size: 20, color: action.color),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(action.label, style: AppTypography.labelMedium),
                    const SizedBox(height: 2),
                    Text(
                      action.description,
                      style: AppTypography.bodySmall,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              Icon(Icons.arrow_forward_ios, size: 14, color: AppColors.textTertiary),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRecentActivity(BuildContext context, Map<String, dynamic>? stats) {
    return AppCard(
      header: Text('آخر النشاطات', style: AppTypography.headingSmall.copyWith(fontSize: 16)),
      child: Column(
        children: [
          _buildActivityItem(
            icon: Icons.person_add,
            color: AppColors.accentBlue,
            title: 'عميل جديد',
            subtitle: 'تم تسجيل عميل جديد',
            time: 'منذ 5 دقائق',
          ),
          _buildActivityItem(
            icon: Icons.directions_car,
            color: AppColors.secondary,
            title: 'سيارة جديدة',
            subtitle: 'تم إضافة سيارة جديدة',
            time: 'منذ 15 دقيقة',
          ),
          _buildActivityItem(
            icon: Icons.receipt,
            color: AppColors.accentRed,
            title: 'فاتورة مدفوعة',
            subtitle: 'تم دفع فاتورة #1024',
            time: 'منذ ساعة',
          ),
          _buildActivityItem(
            icon: Icons.build,
            color: AppColors.accentOrange,
            title: 'صيانة مكتملة',
            subtitle: 'تم إنجاز صيانة السيارة',
            time: 'منذ 3 ساعات',
          ),
        ],
      ),
    );
  }

  Widget _buildActivityItem({
    required IconData icon,
    required Color color,
    required String title,
    required String subtitle,
    required String time,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: AppBorders.radiusMd,
            ),
            child: Icon(icon, size: 16, color: color),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AppTypography.labelMedium),
                const SizedBox(height: 2),
                Text(subtitle, style: AppTypography.bodySmall),
              ],
            ),
          ),
          Text(time, style: AppTypography.bodySmall),
        ],
      ),
    );
  }
}

class _QuickAction {
  final IconData icon;
  final String label;
  final String description;
  final Color color;
  final Widget screen;
  _QuickAction({required this.icon, required this.label, required this.description, required this.color, required this.screen});
}
