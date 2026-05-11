import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/design_system.dart';
import '../screens/customers/customers_screen_new.dart';
import '../screens/vehicles/vehicles_screen_new.dart';
import '../screens/technicians/technicians_screen.dart';
import '../screens/bookings/bookings_screen.dart';
import '../screens/invoices/invoices_screen.dart';
import '../screens/inventory/inventory_screen.dart';
import '../screens/dashboard/dashboard_screen_new.dart';

final currentPageProvider = StateProvider<int>((ref) => 0);

class AppShell extends ConsumerWidget {
  const AppShell({super.key});

  final List<_NavItem> _navItems = const [
    _NavItem(icon: Icons.dashboard_outlined, activeIcon: Icons.dashboard, label: 'لوحة التحكم'),
    _NavItem(icon: Icons.people_outline, activeIcon: Icons.people, label: 'العملاء'),
    _NavItem(icon: Icons.directions_car_outlined, activeIcon: Icons.directions_car, label: 'السيارات'),
    _NavItem(icon: Icons.build_outlined, activeIcon: Icons.build, label: 'الفنيين'),
    _NavItem(icon: Icons.calendar_today_outlined, activeIcon: Icons.calendar_today, label: 'الحجوزات'),
    _NavItem(icon: Icons.receipt_outlined, activeIcon: Icons.receipt, label: 'الفواتير'),
    _NavItem(icon: Icons.inventory_2_outlined, activeIcon: Icons.inventory_2, label: 'المخزون'),
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentPage = ref.watch(currentPageProvider);
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth > 1024;

    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      body: Row(
        children: [
          if (isDesktop) _buildSidebar(context, ref, currentPage),
          Expanded(
            child: Column(
              children: [
                _buildTopBar(context, isDesktop),
                Expanded(
                  child: AnimatedSwitcher(
                    duration: AppAnimations.slow,
                    transitionBuilder: (child, animation) {
                      return FadeTransition(
                        opacity: animation,
                        child: SlideTransition(
                          position: Tween<Offset>(
                            begin: const Offset(0.02, 0),
                            end: Offset.zero,
                          ).animate(CurvedAnimation(
                            parent: animation,
                            curve: AppAnimations.easeOut,
                          )),
                          child: child,
                        ),
                      );
                    },
                    child: KeyedSubtree(
                      key: ValueKey(currentPage),
                      child: _getPage(currentPage),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: !isDesktop ? _buildBottomNav(ref, currentPage) : null,
    );
  }

  Widget _buildSidebar(BuildContext context, WidgetRef ref, int currentPage) {
    return Container(
      width: 260,
      decoration: BoxDecoration(
        color: AppColors.bgSecondary,
        border: Border(
          left: BorderSide(color: AppColors.border.withOpacity(0.3)),
        ),
      ),
      child: Column(
        children: [
          // Brand
          Padding(
            padding: const EdgeInsets.all(24),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: AppColors.gradientPrimary,
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: AppBorders.radiusLg,
                    boxShadow: [AppShadows.glow],
                  ),
                  child: const Icon(Icons.directions_car, color: Colors.white, size: 24),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'AUTO RENEW',
                        style: AppTypography.labelLarge.copyWith(
                          fontSize: 18,
                          letterSpacing: 1,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'نظام إدارة الكراج',
                        style: AppTypography.bodySmall.copyWith(fontSize: 11),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.border),
          const SizedBox(height: 12),
          // Navigation
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              itemCount: _navItems.length,
              itemBuilder: (context, index) {
                final item = _navItems[index];
                final isActive = index == currentPage;
                return _NavItemWidget(
                  item: item,
                  isActive: isActive,
                  onTap: () => ref.read(currentPageProvider.notifier).state = index,
                );
              },
            ),
          ),
          const Divider(height: 1, color: AppColors.border),
          // User
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [Color(0xFF8B5CF6), Color(0xFF6366F1)]),
                    borderRadius: AppBorders.radiusFull,
                  ),
                  child: const Center(
                    child: Text('م', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('مدير النظام', style: AppTypography.labelMedium),
                      Text('مدير', style: AppTypography.bodySmall),
                    ],
                  ),
                ),
                Icon(Icons.settings_outlined, size: 18, color: AppColors.textTertiary),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTopBar(BuildContext context, bool isDesktop) {
    return Container(
      height: 70,
      padding: const EdgeInsets.symmetric(horizontal: 32),
      decoration: BoxDecoration(
        color: AppColors.bgPrimary,
        border: Border(
          bottom: BorderSide(color: AppColors.border.withOpacity(0.3)),
        ),
      ),
      child: Row(
        children: [
          if (!isDesktop)
            Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Icon(Icons.menu, color: AppColors.textSecondary),
            ),
          Expanded(
            child: TextField(
              style: AppTypography.bodyMedium,
              decoration: InputDecoration(
                hintText: 'بحث...',
                hintStyle: AppTypography.bodyMedium.copyWith(color: AppColors.textTertiary),
                prefixIcon: Icon(Icons.search, color: AppColors.textTertiary, size: 20),
                filled: true,
                fillColor: AppColors.bgSecondary,
                border: OutlineInputBorder(
                  borderRadius: AppBorders.radiusLg,
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
            ),
          ),
          const SizedBox(width: 16),
          _TopBarIcon(icon: Icons.notifications_outlined, badge: 3),
          const SizedBox(width: 8),
          _TopBarIcon(icon: Icons.mail_outline),
        ],
      ),
    );
  }

  Widget? _buildBottomNav(WidgetRef ref, int currentPage) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.bgSecondary,
        border: Border(
          top: BorderSide(color: AppColors.border.withOpacity(0.3)),
        ),
      ),
      child: SafeArea(
        child: SizedBox(
          height: 64,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: _navItems.take(5).toList().asMap().entries.map((entry) {
              final index = entry.key;
              final item = entry.value;
              final isActive = index == currentPage;
              return GestureDetector(
                onTap: () => ref.read(currentPageProvider.notifier).state = index,
                child: AnimatedContainer(
                  duration: AppAnimations.normal,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: isActive ? AppColors.primary.withOpacity(0.15) : Colors.transparent,
                    borderRadius: AppBorders.radiusMd,
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        isActive ? item.activeIcon : item.icon,
                        color: isActive ? AppColors.primary : AppColors.textTertiary,
                        size: 22,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        item.label,
                        style: AppTypography.labelSmall.copyWith(
                          color: isActive ? AppColors.primary : AppColors.textTertiary,
                          fontSize: 10,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }

  Widget _getPage(int index) {
    switch (index) {
      case 0: return const DashboardScreenNew();
      case 1: return const CustomersScreenNew();
      case 2: return const VehiclesScreenNew();
      case 3: return const TechniciansScreen();
      case 4: return const BookingsScreen();
      case 5: return const InvoicesScreen();
      case 6: return const InventoryScreen();
      default: return const DashboardScreenNew();
    }
  }
}

class _NavItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  const _NavItem({required this.icon, required this.activeIcon, required this.label});
}

class _NavItemWidget extends StatefulWidget {
  final _NavItem item;
  final bool isActive;
  final VoidCallback onTap;
  const _NavItemWidget({required this.item, required this.isActive, required this.onTap});

  @override
  State<_NavItemWidget> createState() => _NavItemWidgetState();
}

class _NavItemWidgetState extends State<_NavItemWidget> {
  bool _hovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _hovered = true),
      onExit: (_) => setState(() => _hovered = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: AppAnimations.normal,
          margin: const EdgeInsets.only(bottom: 4),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: widget.isActive
                ? AppColors.primary.withOpacity(0.12)
                : _hovered
                    ? AppColors.surfaceHover.withOpacity(0.5)
                    : Colors.transparent,
            borderRadius: AppBorders.radiusMd,
            border: widget.isActive
                ? Border.all(color: AppColors.primary.withOpacity(0.3))
                : null,
          ),
          child: Row(
            children: [
              AnimatedSwitcher(
                duration: AppAnimations.fast,
                child: Icon(
                  widget.isActive ? widget.item.activeIcon : widget.item.icon,
                  key: ValueKey(widget.isActive),
                  color: widget.isActive ? AppColors.primary : AppColors.textTertiary,
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  widget.item.label,
                  style: AppTypography.labelMedium.copyWith(
                    color: widget.isActive ? AppColors.primary : AppColors.textSecondary,
                  ),
                ),
              ),
              if (widget.isActive)
                Container(
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(
                    color: AppColors.primary,
                    shape: BoxShape.circle,
                    boxShadow: [BoxShadow(color: AppColors.primary, blurRadius: 6, spreadRadius: 1)],
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _TopBarIcon extends StatelessWidget {
  final IconData icon;
  final int? badge;
  const _TopBarIcon({required this.icon, this.badge});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: AppColors.bgSecondary,
            borderRadius: AppBorders.radiusMd,
          ),
          child: Icon(icon, size: 20, color: AppColors.textSecondary),
        ),
        if (badge != null)
          Positioned(
            top: 6,
            right: 6,
            child: Container(
              width: 16,
              height: 16,
              decoration: const BoxDecoration(
                color: AppColors.accentRed,
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(
                  '$badge',
                  style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ),
      ],
    );
  }
}
