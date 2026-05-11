import 'package:flutter/material.dart';
import '../core/design_system.dart';
import '../core/transitions.dart';

// Enterprise App Layout with Sidebar + Topbar
class AppLayout extends StatefulWidget {
  final String title;
  final Widget body;
  final List<Widget>? actions;
  final int currentIndex;
  final bool showBack;
  final VoidCallback? onBack;

  const AppLayout({
    super.key,
    required this.title,
    required this.body,
    this.actions,
    this.currentIndex = 0,
    this.showBack = false,
    this.onBack,
  });

  @override
  State<AppLayout> createState() => _AppLayoutState();
}

class _AppLayoutState extends State<AppLayout> {
  bool _sidebarCollapsed = false;

  final List<_NavItem> _navItems = [
    _NavItem(icon: Icons.dashboard_outlined, activeIcon: Icons.dashboard, label: 'لوحة التحكم', route: '/dashboard'),
    _NavItem(icon: Icons.people_outline, activeIcon: Icons.people, label: 'العملاء', route: '/customers'),
    _NavItem(icon: Icons.directions_car_outlined, activeIcon: Icons.directions_car, label: 'السيارات', route: '/vehicles'),
    _NavItem(icon: Icons.build_outlined, activeIcon: Icons.build, label: 'الفنيين', route: '/technicians'),
    _NavItem(icon: Icons.calendar_today_outlined, activeIcon: Icons.calendar_today, label: 'الحجوزات', route: '/bookings'),
    _NavItem(icon: Icons.receipt_outlined, activeIcon: Icons.receipt, label: 'الفواتير', route: '/invoices'),
    _NavItem(icon: Icons.inventory_2_outlined, activeIcon: Icons.inventory_2, label: 'المخزون', route: '/inventory'),
    _NavItem(icon: Icons.qr_code_outlined, activeIcon: Icons.qr_code, label: 'تتبع السيارة', route: '/tracking'),
  ];

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 900;

    if (isMobile) {
      return Scaffold(
        backgroundColor: AppColors.bgPrimary,
        drawer: _buildSidebar(true),
        appBar: _buildTopbar(isMobile: true),
        body: widget.body,
      );
    }

    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      body: Row(
        children: [
          AnimatedContainer(
            duration: AppAnimations.slow,
            curve: AppAnimations.easeOut,
            width: _sidebarCollapsed ? 72 : 260,
            child: _buildSidebar(false),
          ),
          Expanded(
            child: Column(
              children: [
                _buildTopbar(isMobile: false),
                Expanded(child: widget.body),
              ],
            ),
          ),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildTopbar({required bool isMobile}) {
    return AppBar(
      elevation: 0,
      backgroundColor: AppColors.bgPrimary,
      surfaceTintColor: Colors.transparent,
      leading: isMobile
          ? IconButton(
              icon: const Icon(Icons.menu, color: AppColors.textSecondary),
              onPressed: () => Scaffold.of(context).openDrawer(),
            )
          : widget.showBack
              ? IconButton(
                  icon: const Icon(Icons.arrow_back_ios_new, color: AppColors.textSecondary, size: 18),
                  onPressed: widget.onBack ?? () => Navigator.pop(context),
                )
              : const SizedBox(width: 16),
      title: Text(
        widget.title,
        style: AppTypography.headingMedium.copyWith(fontSize: 18),
      ),
      actions: [
        if (widget.actions != null) ...widget.actions!,
        const SizedBox(width: 16),
      ],
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(1),
        child: Container(height: 1, color: AppColors.border.withOpacity(0.3)),
      ),
    );
  }

  Widget _buildSidebar(bool isDrawer) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.bgSecondary,
        border: isDrawer
            ? null
            : Border(
                left: BorderSide(color: AppColors.border.withOpacity(0.3)),
              ),
      ),
      child: Column(
        children: [
          // Logo
          Padding(
            padding: const EdgeInsets.all(20),
            child: _sidebarCollapsed && !isDrawer
                ? Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: AppColors.gradientPrimary),
                      borderRadius: AppBorders.radiusMd,
                    ),
                    child: const Icon(Icons.directions_car, color: Colors.white, size: 20),
                  )
                : Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
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
                            Text('AUTO RENEW', style: AppTypography.labelLarge.copyWith(fontSize: 16)),
                            Text('نظام إدارة الكراج', style: AppTypography.labelSmall),
                          ],
                        ),
                      ),
                    ],
                  ),
          ),
          // Toggle
          if (!isDrawer)
            InkWell(
              onTap: () => setState(() => _sidebarCollapsed = !_sidebarCollapsed),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 8),
                alignment: Alignment.center,
                child: Icon(
                  _sidebarCollapsed ? Icons.chevron_left : Icons.chevron_right,
                  color: AppColors.textTertiary,
                  size: 18,
                ),
              ),
            ),
          const Divider(height: 1, color: AppColors.border),
          const SizedBox(height: 8),
          // Navigation
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              itemCount: _navItems.length,
              itemBuilder: (context, index) {
                final item = _navItems[index];
                final isActive = index == widget.currentIndex;
                return _buildNavItem(item, isActive, isDrawer);
              },
            ),
          ),
          const Divider(height: 1, color: AppColors.border),
          // Bottom
          Padding(
            padding: const EdgeInsets.all(16),
            child: _sidebarCollapsed && !isDrawer
                ? const CircleAvatar(
                    radius: 16,
                    backgroundColor: AppColors.surface,
                    child: Icon(Icons.person, size: 18, color: AppColors.textSecondary),
                  )
                : Row(
                    children: [
                      const CircleAvatar(
                        radius: 18,
                        backgroundColor: AppColors.surface,
                        child: Icon(Icons.person, size: 20, color: AppColors.textSecondary),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('المستخدم', style: AppTypography.labelMedium),
                            Text('مدير النظام', style: AppTypography.bodySmall),
                          ],
                        ),
                      ),
                    ],
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem(_NavItem item, bool isActive, bool isDrawer) {
    return AnimatedContainer(
      duration: AppAnimations.normal,
      margin: const EdgeInsets.only(bottom: 4),
      decoration: BoxDecoration(
        color: isActive ? AppColors.primary.withOpacity(0.15) : Colors.transparent,
        borderRadius: AppBorders.radiusMd,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            if (isDrawer) Navigator.pop(context);
            // Navigation handled by parent
          },
          borderRadius: AppBorders.radiusMd,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            child: _sidebarCollapsed && !isDrawer
                ? Icon(
                    isActive ? item.activeIcon : item.icon,
                    color: isActive ? AppColors.primary : AppColors.textTertiary,
                    size: 22,
                  )
                : Row(
                    children: [
                      Icon(
                        isActive ? item.activeIcon : item.icon,
                        color: isActive ? AppColors.primary : AppColors.textTertiary,
                        size: 20,
                      ),
                      const SizedBox(width: 12),
                      Text(
                        item.label,
                        style: AppTypography.labelMedium.copyWith(
                          color: isActive ? AppColors.primary : AppColors.textSecondary,
                        ),
                      ),
                      if (isActive) ...[
                        const Spacer(),
                        Container(
                          width: 6,
                          height: 6,
                          decoration: const BoxDecoration(
                            color: AppColors.primary,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ],
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}

class _NavItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final String route;
  _NavItem({required this.icon, required this.activeIcon, required this.label, required this.route});
}
