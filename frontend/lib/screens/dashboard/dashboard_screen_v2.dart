import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/app_theme.dart';
import '../../state/dashboard_provider.dart';
import '../../services/notification_service.dart';
import '../../widgets/app_shell_new.dart';
import '../../widgets/shimmer_loading.dart';

class DashboardScreenV2 extends ConsumerStatefulWidget {
  const DashboardScreenV2({super.key});

  @override
  ConsumerState<DashboardScreenV2> createState() => _DashboardScreenV2State();
}

class _DashboardScreenV2State extends ConsumerState<DashboardScreenV2> {
  @override
  Widget build(BuildContext context) {
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
            // Welcome Section
            _buildWelcomeSection(),
            const SizedBox(height: 32),

            // Stats Grid
            statsAsync.when(
              data: (stats) => _buildStatsGrid(stats, isWide),
              loading: () => _buildStatsShimmer(isWide),
              error: (_, __) => _buildErrorState(),
            ),
            const SizedBox(height: 32),

            // Main Content
            isWide
                ? Row(
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
                            _buildPerformanceMetrics(),
                          ],
                        ),
                      ),
                    ],
                  )
                : Column(
                    children: [
                      _buildRevenueChart(),
                      const SizedBox(height: 24),
                      _buildQuickActions(context),
                      const SizedBox(height: 24),
                      _buildRecentActivity(),
                      const SizedBox(height: 24),
                      _buildPerformanceMetrics(),
                    ],
                  ),
          ],
        ),
      ),
    );
  }

  Widget _buildWelcomeSection() {
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
                  _buildStatusBadge(),
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
        _buildReportButton(),
      ],
    );
  }

  Widget _buildStatusBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.success.withOpacity(0.12),
        borderRadius: AppBorders.radiusFull,
        border: Border.all(color: AppColors.success.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _AnimatedDot(),
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
    );
  }

  Widget _buildReportButton() {
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: () => showInfoToast(context, 'سيتوفر قريباً!'),
        child: AnimatedContainer(
          duration: AppAnimations.normal,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            color: AppColors.bgSecondary,
            borderRadius: AppBorders.radiusLg,
            border: Border.all(color: AppColors.border.withOpacity(0.4)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.download_outlined, size: 18, color: AppColors.textSecondary),
              const SizedBox(width: 8),
              Text(
                'تقرير اليوم',
                style: AppTypography.labelMedium.copyWith(fontSize: 13),
              ),
              const SizedBox(width: 8),
              Icon(Icons.arrow_forward_ios, size: 12, color: AppColors.textTertiary),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatsGrid(Map<String, dynamic> stats, bool isWide) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: isWide ? 4 : 2,
      crossAxisSpacing: 20,
      mainAxisSpacing: 20,
      childAspectRatio: isWide ? 1.6 : 1.4,
      children: [
        _StatCard(
          title: 'إجمالي الإيرادات',
          value: '\$${stats['totalRevenue'].toStringAsFixed(0)}',
          subtitle: '${stats['paidInvoices']} فاتورة مدفوعة',
          icon: Icons.payments_outlined,
          gradientColors: AppColors.gradientPrimary,
          trend: 12.5,
          delay: 0,
        ),
        _StatCard(
          title: 'العملاء',
          value: '${stats['totalCustomers']}',
          subtitle: 'عميل مسجل',
          icon: Icons.people_outlined,
          gradientColors: [AppColors.accentBlue, AppColors.accentCyan],
          trend: 5.2,
          delay: 100,
        ),
        _StatCard(
          title: 'السيارات',
          value: '${stats['totalVehicles']}',
          subtitle: 'سيارة في النظام',
          icon: Icons.directions_car_outlined,
          gradientColors: AppColors.gradientSuccess,
          trend: 8.1,
          delay: 200,
        ),
        _StatCard(
          title: 'الحجوزات',
          value: '${stats['totalBookings']}',
          subtitle: '${stats['todayBookings']} جديدة اليوم',
          icon: Icons.calendar_today_outlined,
          gradientColors: [AppColors.accentPurple, AppColors.accentPink],
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
      childAspectRatio: isWide ? 1.6 : 1.4,
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
        ],
      ),
    );
  }

  Widget _buildRevenueChart() {
    return _GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'الإيرادات',
                    style: AppTypography.headingSmall.copyWith(fontSize: 16),
                  ),
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
          const SizedBox(height: 24),
          _buildAnimatedBarChart(),
        ],
      ),
    );
  }

  Widget _buildChartFilter(String label, bool active) {
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: () => showInfoToast(context, 'سيتوفر قريباً!'),
        child: AnimatedContainer(
          duration: AppAnimations.fast,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
          decoration: BoxDecoration(
            color: active
                ? AppColors.primary.withOpacity(0.15)
                : Colors.transparent,
            borderRadius: AppBorders.radiusSm,
            border: active
                ? Border.all(color: AppColors.primary.withOpacity(0.3))
                : null,
          ),
          child: Text(
            label,
            style: AppTypography.labelSmall.copyWith(
              color: active ? AppColors.primary : AppColors.textTertiary,
              fontWeight: active ? FontWeight.w600 : FontWeight.w400,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAnimatedBarChart() {
    final data = [0.3, 0.5, 0.4, 0.7, 0.6, 0.9, 0.8];
    final labels = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];

    return SizedBox(
      height: 180,
      child: Row(
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
                  _AnimatedBar(
                    value: value,
                    delay: Duration(milliseconds: 400 + index * 100),
                  ),
                  const SizedBox(height: 10),
                  Text(labels[index], style: AppTypography.bodySmall.copyWith(fontSize: 11)),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return _GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'الوصول السريع',
                style: AppTypography.headingSmall.copyWith(fontSize: 16),
              ),
            ],
          ),
          const SizedBox(height: 20),
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 3,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 3.2,
            children: [
              _QuickActionTile(
                icon: Icons.person_add_outlined,
                label: 'عميل جديد',
                color: AppColors.accentBlue,
                onTap: () => ref.read(currentPageProvider.notifier).state = 1,
              ),
              _QuickActionTile(
                icon: Icons.directions_car_outlined,
                label: 'سيارة جديدة',
                color: AppColors.secondary,
                onTap: () => ref.read(currentPageProvider.notifier).state = 2,
              ),
              _QuickActionTile(
                icon: Icons.build_outlined,
                label: 'حجز صيانة',
                color: AppColors.accentOrange,
                onTap: () => ref.read(currentPageProvider.notifier).state = 4,
              ),
              _QuickActionTile(
                icon: Icons.receipt_outlined,
                label: 'فاتورة جديدة',
                color: AppColors.accentRed,
                onTap: () => ref.read(currentPageProvider.notifier).state = 5,
              ),
              _QuickActionTile(
                icon: Icons.inventory_2_outlined,
                label: 'قطعة غيار',
                color: AppColors.accentCyan,
                onTap: () => ref.read(currentPageProvider.notifier).state = 6,
              ),
              _QuickActionTile(
                icon: Icons.qr_code_outlined,
                label: 'تتبع السيارة',
                color: AppColors.accentPurple,
                onTap: () => _showTrackDialog(context),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRecentActivity() {
    return _GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'آخر النشاطات',
            style: AppTypography.headingSmall.copyWith(fontSize: 16),
          ),
          const SizedBox(height: 20),
          _buildActivityItem(
            Icons.person_add,
            AppColors.accentBlue,
            'عميل جديد',
            'أحمد محمد',
            'منذ 5 دقائق',
          ),
          _buildActivityItem(
            Icons.directions_car,
            AppColors.secondary,
            'سيارة جديدة',
            'BMW X5 - ABC123',
            'منذ 15 دقيقة',
          ),
          _buildActivityItem(
            Icons.receipt,
            AppColors.accentRed,
            'فاتورة مدفوعة',
            '#1024 - \$450',
            'منذ ساعة',
          ),
          _buildActivityItem(
            Icons.build,
            AppColors.accentOrange,
            'صيانة مكتملة',
            'كيا سيراتو',
            'منذ 3 ساعات',
          ),
          _buildActivityItem(
            Icons.check_circle,
            AppColors.success,
            'حجز مؤكد',
            'غدًا 10:00 ص',
            'منذ 5 ساعات',
          ),
        ],
      ),
    );
  }

  Widget _buildActivityItem(
    IconData icon,
    Color color,
    String title,
    String subtitle,
    String time,
  ) {
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

  Widget _buildPerformanceMetrics() {
    return _GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'أداء الكراج',
            style: AppTypography.headingSmall.copyWith(fontSize: 16),
          ),
          const SizedBox(height: 20),
          _buildMetricRow('إشغال الفنيين', 0.75, AppColors.accentBlue),
          const SizedBox(height: 16),
          _buildMetricRow('إشغال الفتحات', 0.60, AppColors.secondary),
          const SizedBox(height: 16),
          _buildMetricRow('رضا العملاء', 0.92, AppColors.accentPurple),
          const SizedBox(height: 16),
          _buildMetricRow('المخزون', 0.45, AppColors.warning),
        ],
      ),
    );
  }

  Widget _buildMetricRow(String label, double value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: AppTypography.labelMedium.copyWith(fontSize: 12)),
            Text(
              '${(value * 100).toStringAsFixed(0)}%',
              style: AppTypography.labelMedium.copyWith(
                color: color,
                fontSize: 12,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: AppBorders.radiusFull,
          child: LinearProgressIndicator(
            value: value,
            backgroundColor: AppColors.bgTertiary,
            valueColor: AlwaysStoppedAnimation<Color>(color.withOpacity(0.8)),
            minHeight: 6,
          ),
        ),
      ],
    );
  }

  void _showTrackDialog(BuildContext context) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        child: Container(
          constraints: const BoxConstraints(maxWidth: 440),
          decoration: BoxDecoration(
            color: AppColors.bgSecondary,
            borderRadius: AppBorders.radiusXl,
            border: Border.all(color: AppColors.border.withOpacity(0.4)),
            boxShadow: [AppShadows.xl],
          ),
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('تتبع السيارة', style: AppTypography.headingSmall.copyWith(fontSize: 18)),
              const SizedBox(height: 8),
              Text('أدخل معرف السيارة أو رقم اللوحة', style: AppTypography.bodyMedium),
              const SizedBox(height: 20),
              TextField(
                controller: controller,
                style: AppTypography.bodyMedium,
                decoration: InputDecoration(
                  hintText: 'معرف السيارة...',
                  hintStyle: AppTypography.bodyMedium.copyWith(color: AppColors.textMuted),
                  prefixIcon: Icon(Icons.qr_code, size: 20, color: AppColors.textMuted),
                  filled: true,
                  fillColor: AppColors.bgPrimary,
                  border: OutlineInputBorder(
                    borderRadius: AppBorders.radiusMd,
                    borderSide: BorderSide(color: AppColors.border.withOpacity(0.4)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: AppBorders.radiusMd,
                    borderSide: const BorderSide(color: AppColors.primary, width: 2),
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                ),
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: Text('إلغاء', style: AppTypography.labelMedium.copyWith(
                        color: AppColors.textTertiary)),
                  ),
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: () {
                      if (controller.text.isNotEmpty) {
                        Navigator.pop(context);
                        Navigator.pushNamed(context, '/track/${controller.text}');
                      }
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: AppColors.gradientPrimary),
                        borderRadius: AppBorders.radiusMd,
                        boxShadow: [AppShadows.glow(AppColors.primary)],
                      ),
                      child: Text('تتبع', style: AppTypography.labelLarge.copyWith(
                        color: Colors.white, fontSize: 13)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ============================================================
// GLASS CARD
// ============================================================
class _GlassCard extends StatelessWidget {
  final Widget child;
  const _GlassCard({required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.bgCard.withOpacity(0.8),
        borderRadius: AppBorders.radiusXl,
        border: Border.all(
          color: AppColors.border.withOpacity(0.3),
        ),
        boxShadow: [AppShadows.md],
      ),
      child: child,
    );
  }
}

// ============================================================
// STAT CARD
// ============================================================
class _StatCard extends StatefulWidget {
  final String title;
  final String value;
  final String subtitle;
  final IconData icon;
  final List<Color> gradientColors;
  final double trend;
  final int delay;

  const _StatCard({
    required this.title,
    required this.value,
    required this.subtitle,
    required this.icon,
    required this.gradientColors,
    required this.trend,
    required this.delay,
  });

  @override
  State<_StatCard> createState() => _StatCardState();
}

class _StatCardState extends State<_StatCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnim;
  late Animation<Offset> _slideAnim;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _fadeAnim = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _controller, curve: AppAnimations.easeOut),
    );
    _slideAnim = Tween<Offset>(
      begin: const Offset(0, 0.3),
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
    return FadeTransition(
      opacity: _fadeAnim,
      child: SlideTransition(
        position: _slideAnim,
        child: MouseRegion(
          cursor: SystemMouseCursors.click,
          child: GestureDetector(
            onTap: () => showInfoToast(context, widget.title),
            child: AnimatedContainer(
              duration: AppAnimations.normal,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.bgCard,
                borderRadius: AppBorders.radiusLg,
                border: Border.all(
                  color: AppColors.border.withOpacity(0.3),
                ),
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
                          gradient: LinearGradient(
                            colors: widget.gradientColors,
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: AppBorders.radiusMd,
                          boxShadow: [
                            AppShadows.glow(widget.gradientColors[0]),
                          ],
                        ),
                        child: Icon(widget.icon, color: Colors.white, size: 20),
                      ),
                      if (widget.trend != 0)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: (widget.trend >= 0
                                    ? AppColors.success
                                    : AppColors.error)
                                .withOpacity(0.1),
                            borderRadius: AppBorders.radiusSm,
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                widget.trend >= 0
                                    ? Icons.arrow_upward
                                    : Icons.arrow_downward,
                                size: 12,
                                color: widget.trend >= 0
                                    ? AppColors.success
                                    : AppColors.error,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                '${widget.trend.abs().toStringAsFixed(1)}%',
                                style: AppTypography.labelSmall.copyWith(
                                  color: widget.trend >= 0
                                      ? AppColors.success
                                      : AppColors.error,
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
                    style: AppTypography.displaySmall.copyWith(
                      fontSize: 26,
                      fontWeight: FontWeight.w700,
                    ),
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
        ),
      ),
    );
  }
}

// ============================================================
// ANIMATED BAR
// ============================================================
class _AnimatedBar extends StatefulWidget {
  final double value;
  final Duration delay;

  const _AnimatedBar({required this.value, required this.delay});

  @override
  State<_AnimatedBar> createState() => _AnimatedBarState();
}

class _AnimatedBarState extends State<_AnimatedBar>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _heightAnim;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _heightAnim = Tween<double>(begin: 0, end: widget.value).animate(
      CurvedAnimation(parent: _controller, curve: AppAnimations.easeOut),
    );
    Future.delayed(widget.delay, () {
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
    return AnimatedBuilder(
      animation: _heightAnim,
      builder: (context, child) {
        return Container(
          width: 32,
          height: 140 * _heightAnim.value,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                AppColors.primary.withOpacity(0.9),
                AppColors.primary.withOpacity(0.3),
              ],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
            borderRadius: const BorderRadius.vertical(
              top: Radius.circular(6),
            ),
          ),
        );
      },
    );
  }
}

// ============================================================
// ANIMATED DOT
// ============================================================
class _AnimatedDot extends StatefulWidget {
  @override
  State<_AnimatedDot> createState() => _AnimatedDotState();
}

class _AnimatedDotState extends State<_AnimatedDot>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _opacityAnim;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
    _opacityAnim = Tween<double>(begin: 0.4, end: 1).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _opacityAnim,
      child: Container(
        width: 7,
        height: 7,
        decoration: const BoxDecoration(
          color: AppColors.success,
          shape: BoxShape.circle,
        ),
      ),
    );
  }
}

// ============================================================
// QUICK ACTION TILE
// ============================================================
class _QuickActionTile extends StatefulWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _QuickActionTile({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  State<_QuickActionTile> createState() => _QuickActionTileState();
}

class _QuickActionTileState extends State<_QuickActionTile> {
  bool _hovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _hovered = true),
      onExit: (_) => setState(() => _hovered = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: AppAnimations.fast,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: _hovered
                ? widget.color.withOpacity(0.08)
                : AppColors.bgPrimary,
            borderRadius: AppBorders.radiusMd,
            border: Border.all(
              color: _hovered
                  ? widget.color.withOpacity(0.3)
                  : AppColors.border.withOpacity(0.2),
            ),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: widget.color.withOpacity(0.1),
                  borderRadius: AppBorders.radiusMd,
                ),
                child: Icon(widget.icon, size: 20, color: widget.color),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  widget.label,
                  style: AppTypography.labelMedium,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Icon(
                Icons.arrow_forward_ios,
                size: 14,
                color: _hovered ? widget.color : AppColors.textTertiary,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
