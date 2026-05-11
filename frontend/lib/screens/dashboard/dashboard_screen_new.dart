import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/design_system.dart';
import '../../state/dashboard_provider.dart';
import '../../widgets/app_button.dart';
import '../../widgets/app_card.dart';
import '../../widgets/shimmer_loading.dart';

class DashboardScreenNew extends ConsumerWidget {
  const DashboardScreenNew({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(dashboardStatsProvider);
    final size = MediaQuery.of(context).size;
    final isWide = size.width > 1200;

    return Container(
      color: AppColors.bgPrimary,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            _buildHeader(context),
            const SizedBox(height: 32),
            
            // Stats Cards
            statsAsync.when(
              data: (stats) => _buildStatsSection(stats, isWide),
              loading: () => _buildStatsShimmer(isWide),
              error: (_, __) => _buildErrorState(),
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
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    'لوحة التحكم',
                    style: AppTypography.displaySmall.copyWith(fontSize: 32),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.success.withOpacity(0.15),
                      borderRadius: AppBorders.radiusFull,
                      border: Border.all(color: AppColors.success.withOpacity(0.3)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 6,
                          height: 6,
                          decoration: const BoxDecoration(
                            color: AppColors.success,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          'النظام يعمل',
                          style: AppTypography.labelSmall.copyWith(
                            color: AppColors.success,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                'نظرة عامة شاملة على أداء الكراج والنشاطات',
                style: AppTypography.bodyLarge,
              ),
            ],
          ),
        ),
        AppButton(
          label: 'تقرير اليوم',
          icon: Icons.download_outlined,
          trailingIcon: Icons.arrow_forward_ios,
          variant: ButtonVariant.outline,
          size: ButtonSize.sm,
          onPressed: () {},
        ),
      ],
    );
  }

  Widget _buildStatsSection(Map<String, dynamic> stats, bool isWide) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: isWide ? 4 : 2,
      crossAxisSpacing: 20,
      mainAxisSpacing: 20,
      childAspectRatio: isWide ? 1.7 : 1.5,
      children: [
        _AnimatedStatCard(
          title: 'إجمالي الإيرادات',
          value: '\$${stats['totalRevenue'].toStringAsFixed(0)}',
          subtitle: '${stats['paidInvoices']} فاتورة مدفوعة',
          icon: Icons.payments_outlined,
          color: AppColors.primary,
          gradientColors: AppColors.gradientPrimary,
          trend: 12.5,
          delay: 0,
        ),
        _AnimatedStatCard(
          title: 'العملاء',
          value: '${stats['totalCustomers']}',
          subtitle: 'عميل مسجل',
          icon: Icons.people_outlined,
          color: AppColors.accentBlue,
          gradientColors: [AppColors.accentBlue, const Color(0xFF06B6D4)],
          trend: 5.2,
          delay: 100,
        ),
        _AnimatedStatCard(
          title: 'السيارات',
          value: '${stats['totalVehicles']}',
          subtitle: 'سيارة في النظام',
          icon: Icons.directions_car_outlined,
          color: AppColors.secondary,
          gradientColors: AppColors.gradientSuccess,
          trend: 8.1,
          delay: 200,
        ),
        _AnimatedStatCard(
          title: 'الحجوزات',
          value: '${stats['totalBookings']}',
          subtitle: '${stats['todayBookings']} جديدة اليوم',
          icon: Icons.calendar_today_outlined,
          color: AppColors.accentPurple,
          gradientColors: [AppColors.accentPurple, const Color(0xFFEC4899)],
          trend: -2.4,
          delay: 300,
        ),
      ],
    );
  }

  Widget _buildStatsShimmer(bool isWide) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: isWide ? 4 : 2,
      crossAxisSpacing: 20,
      mainAxisSpacing: 20,
      childAspectRatio: isWide ? 1.7 : 1.5,
      children: List.generate(4, (index) => ShimmerLoading(
        child: Container(
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: AppBorders.radiusLg,
            border: Border.all(color: AppColors.border.withOpacity(0.5)),
          ),
        ),
      )),
    );
  }

  Widget _buildErrorState() {
    return Container(
      padding: const EdgeInsets.all(40),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: AppBorders.radiusLg,
        border: Border.all(color: AppColors.error.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, color: AppColors.error, size: 28),
          const SizedBox(width: 16),
          Text(
            'حدث خطأ في تحميل البيانات',
            style: AppTypography.bodyLarge.copyWith(color: AppColors.error),
          ),
          const SizedBox(width: 16),
          AppButton(
            label: 'إعادة المحاولة',
            variant: ButtonVariant.outline,
            size: ButtonSize.sm,
            onPressed: () {},
          ),
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
            flex: 3,
            child: Column(
              children: [
                _buildRevenueChart(),
                const SizedBox(height: 24),
                _buildQuickActions(context),
              ],
            ),
          ),
          const SizedBox(width: 24),
          Expanded(
            flex: 2,
            child: Column(
              children: [
                _buildRecentActivity(),
                const SizedBox(height: 24),
                _buildTopVehicles(),
              ],
            ),
          ),
        ],
      );
    }
    return Column(
      children: [
        _buildRevenueChart(),
        const SizedBox(height: 24),
        _buildQuickActions(context),
        const SizedBox(height: 24),
        _buildRecentActivity(),
        const SizedBox(height: 24),
        _buildTopVehicles(),
      ],
    );
  }

  Widget _buildRevenueChart() {
    return AppCard(
      header: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('الإيرادات', style: AppTypography.headingSmall.copyWith(fontSize: 16)),
              const SizedBox(height: 4),
              Text('آخر 7 أيام', style: AppTypography.bodySmall),
            ],
          ),
          Row(
            children: [
              _buildChartFilter('يوم', true),
              const SizedBox(width: 8),
              _buildChartFilter('أسبوع', false),
              const SizedBox(width: 8),
              _buildChartFilter('شهر', false),
            ],
          ),
        ],
      ),
      child: Container(
        height: 200,
        padding: const EdgeInsets.only(top: 16),
        child: _buildMiniChart(),
      ),
    );
  }

  Widget _buildChartFilter(String label, bool active) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: active ? AppColors.primary.withOpacity(0.15) : Colors.transparent,
        borderRadius: AppBorders.radiusSm,
        border: active ? Border.all(color: AppColors.primary.withOpacity(0.3)) : null,
      ),
      child: Text(
        label,
        style: AppTypography.labelSmall.copyWith(
          color: active ? AppColors.primary : AppColors.textTertiary,
        ),
      ),
    );
  }

  Widget _buildMiniChart() {
    final data = [0.3, 0.5, 0.4, 0.7, 0.6, 0.9, 0.8];
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: data.asMap().entries.map((entry) {
        final index = entry.key;
        final value = entry.value;
        return Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 6),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                AnimatedContainer(
                  duration: Duration(milliseconds: 800 + index * 100),
                  curve: AppAnimations.easeOut,
                  height: 140 * value,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [AppColors.primary.withOpacity(0.8), AppColors.primary.withOpacity(0.3)],
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                    ),
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(6)),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'][index],
                  style: AppTypography.bodySmall.copyWith(fontSize: 11),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
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
      child: GridView.count(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisCount: 3,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 3,
        children: [
          _buildActionCard(Icons.person_add_outlined, 'عميل جديد', AppColors.accentBlue),
          _buildActionCard(Icons.directions_car_outlined, 'سيارة جديدة', AppColors.secondary),
          _buildActionCard(Icons.build_outlined, 'حجز صيانة', AppColors.accentOrange),
          _buildActionCard(Icons.receipt_outlined, 'فاتورة جديدة', AppColors.accentRed),
          _buildActionCard(Icons.inventory_2_outlined, 'قطعة غيار', AppColors.accentCyan),
          _buildActionCard(Icons.qr_code_outlined, 'تتبع السيارة', AppColors.accentPurple),
        ],
      ),
    );
  }

  Widget _buildActionCard(IconData icon, String label, Color color) {
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: () {},
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
                  color: color.withOpacity(0.1),
                  borderRadius: AppBorders.radiusMd,
                ),
                child: Icon(icon, size: 20, color: color),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  label,
                  style: AppTypography.labelMedium,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Icon(Icons.arrow_forward_ios, size: 14, color: AppColors.textTertiary),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRecentActivity() {
    return AppCard(
      header: Text('آخر النشاطات', style: AppTypography.headingSmall.copyWith(fontSize: 16)),
      child: Column(
        children: [
          _buildActivityItem(Icons.person_add, AppColors.accentBlue, 'عميل جديد', 'أحمد محمد', 'منذ 5 دقائق'),
          _buildActivityItem(Icons.directions_car, AppColors.secondary, 'سيارة جديدة', 'BMW X5 - ABC123', 'منذ 15 دقيقة'),
          _buildActivityItem(Icons.receipt, AppColors.accentRed, 'فاتورة مدفوعة', '#1024 - \$450', 'منذ ساعة'),
          _buildActivityItem(Icons.build, AppColors.accentOrange, 'صيانة مكتملة', 'كيا سيراتو', 'منذ 3 ساعات'),
          _buildActivityItem(Icons.check_circle, AppColors.success, 'حجز مؤكد', 'غدًا 10:00 ص', 'منذ 5 ساعات'),
        ],
      ),
    );
  }

  Widget _buildActivityItem(IconData icon, Color color, String title, String subtitle, String time) {
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
          Text(time, style: AppTypography.bodySmall.copyWith(fontSize: 10)),
        ],
      ),
    );
  }

  Widget _buildTopVehicles() {
    return AppCard(
      header: Text('أكثر السيارات', style: AppTypography.headingSmall.copyWith(fontSize: 16)),
      child: Column(
        children: [
          _buildVehicleRow('BMW X5', 'ABC123', '12 زيارة', 0.85),
          _buildVehicleRow('مرسيدس C200', 'XYZ789', '10 زيارات', 0.72),
          _buildVehicleRow('كيا سيراتو', 'KIA555', '8 زيارات', 0.58),
          _buildVehicleRow('تويوتا كامري', 'TOY999', '6 زيارات', 0.42),
        ],
      ),
    );
  }

  Widget _buildVehicleRow(String model, String plate, String visits, double progress) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.1),
                        borderRadius: AppBorders.radiusSm,
                      ),
                      child: const Icon(Icons.directions_car, size: 16, color: AppColors.primary),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(model, style: AppTypography.labelMedium),
                          Text(plate, style: AppTypography.bodySmall),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              Text(visits, style: AppTypography.bodySmall),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: AppBorders.radiusFull,
            child: LinearProgressIndicator(
              value: progress,
              backgroundColor: AppColors.border.withOpacity(0.3),
              valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary.withOpacity(0.8)),
              minHeight: 4,
            ),
          ),
        ],
      ),
    );
  }
}

class _AnimatedStatCard extends StatefulWidget {
  final String title;
  final String value;
  final String subtitle;
  final IconData icon;
  final Color color;
  final List<Color> gradientColors;
  final double trend;
  final int delay;

  const _AnimatedStatCard({
    required this.title,
    required this.value,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.gradientColors,
    required this.trend,
    required this.delay,
  });

  @override
  State<_AnimatedStatCard> createState() => _AnimatedStatCardState();
}

class _AnimatedStatCardState extends State<_AnimatedStatCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _fadeAnimation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _controller, curve: AppAnimations.easeOut),
    );
    _slideAnimation = Tween<Offset>(begin: const Offset(0, 0.3), end: Offset.zero).animate(
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
    return FadeTransition(
      opacity: _fadeAnimation,
      child: SlideTransition(
        position: _slideAnimation,
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: AppBorders.radiusLg,
            border: Border.all(color: AppColors.border.withOpacity(0.5)),
            boxShadow: [AppShadows.md],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(colors: widget.gradientColors),
                      borderRadius: AppBorders.radiusMd,
                    ),
                    child: Icon(widget.icon, color: Colors.white, size: 20),
                  ),
                  if (widget.trend != 0)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: (widget.trend >= 0 ? AppColors.success : AppColors.error).withOpacity(0.1),
                        borderRadius: AppBorders.radiusSm,
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            widget.trend >= 0 ? Icons.arrow_upward : Icons.arrow_downward,
                            size: 12,
                            color: widget.trend >= 0 ? AppColors.success : AppColors.error,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '${widget.trend.abs().toStringAsFixed(1)}%',
                            style: AppTypography.labelSmall.copyWith(
                              color: widget.trend >= 0 ? AppColors.success : AppColors.error,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                widget.value,
                style: AppTypography.displaySmall.copyWith(fontSize: 28, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 4),
              Text(widget.title, style: AppTypography.bodyMedium),
              if (widget.subtitle.isNotEmpty) ...[
                const SizedBox(height: 4),
                Text(widget.subtitle, style: AppTypography.bodySmall),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
