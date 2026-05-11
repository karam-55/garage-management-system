import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/app_theme.dart';
import '../models/employee.dart';
import '../services/notification_service.dart';
import '../state/auth_provider.dart';

// Navigation Provider
final currentPageProvider = StateProvider<int>((ref) => 0);
final sidebarExpandedProvider = StateProvider<bool>((ref) => true);

class AppShellNew extends ConsumerWidget {
  const AppShellNew({super.key, required this.pages, this.employee});
  final List<AppPage> pages;
  final Employee? employee;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentPage = ref.watch(currentPageProvider);
    final isExpanded = ref.watch(sidebarExpandedProvider);
    final size = MediaQuery.of(context).size;
    final isDesktop = size.width > 1024;

    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      body: Row(
        children: [
          if (isDesktop)
            _Sidebar(
              pages: pages,
              currentIndex: currentPage,
              isExpanded: isExpanded,
              employee: employee,
              onPageSelected: (index) {
                ref.read(currentPageProvider.notifier).state = index;
              },
              onToggle: () {
                ref.read(sidebarExpandedProvider.notifier).state = !isExpanded;
              },
              onLogout: () => ref.read(authProvider.notifier).logout(),
            ),
          Expanded(
            child: Column(
              children: [
                _TopBar(
                  pageTitle: pages[currentPage].title,
                  pageIcon: pages[currentPage].icon,
                  showMenu: !isDesktop,
                  onMenuPressed: () {
                    _showMobileNav(context, ref, pages, currentPage);
                  },
                ),
                Expanded(
                  child: AnimatedSwitcher(
                    duration: AppAnimations.slow,
                    transitionBuilder: (child, animation) {
                      return FadeTransition(
                        opacity: animation,
                        child: SlideTransition(
                          position: Tween<Offset>(
                            begin: const Offset(0.015, 0),
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
                      child: pages[currentPage].page,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: !isDesktop
          ? _MobileBottomNav(
              pages: pages,
              currentIndex: currentPage,
              onPageSelected: (index) {
                ref.read(currentPageProvider.notifier).state = index;
              },
            )
          : null,
    );
  }

  void _showMobileNav(BuildContext context, WidgetRef ref, List<AppPage> pages, int currentPage) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.bgSecondary,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: pages.asMap().entries.map((entry) {
              final index = entry.key;
              final page = entry.value;
              final isActive = index == currentPage;
              return ListTile(
                leading: Icon(
                  isActive ? page.activeIcon ?? page.icon : page.icon,
                  color: isActive ? AppColors.primary : AppColors.textTertiary,
                ),
                title: Text(
                  page.title,
                  style: AppTypography.labelMedium.copyWith(
                    color: isActive ? AppColors.primary : AppColors.textSecondary,
                  ),
                ),
                onTap: () {
                  ref.read(currentPageProvider.notifier).state = index;
                  Navigator.pop(context);
                },
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}

// ============================================================
// SIDEBAR
// ============================================================
class _Sidebar extends StatefulWidget {
  final List<AppPage> pages;
  final int currentIndex;
  final bool isExpanded;
  final Employee? employee;
  final Function(int) onPageSelected;
  final VoidCallback onToggle;
  final VoidCallback onLogout;

  const _Sidebar({
    required this.pages,
    required this.currentIndex,
    required this.isExpanded,
    this.employee,
    required this.onPageSelected,
    required this.onToggle,
    required this.onLogout,
  });

  @override
  State<_Sidebar> createState() => _SidebarState();
}

class _SidebarState extends State<_Sidebar> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: AppAnimations.slow,
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final width = widget.isExpanded ? 260.0 : 72.0;

    return AnimatedContainer(
      duration: AppAnimations.slow,
      curve: AppAnimations.easeOut,
      width: width,
      decoration: BoxDecoration(
        color: AppColors.bgSecondary,
        border: Border(
          left: BorderSide(color: AppColors.border.withOpacity(0.3)),
        ),
      ),
      child: Column(
        children: [
          // Brand Header
          _buildBrandHeader(),
          const Divider(height: 1, color: AppColors.border),
          const SizedBox(height: 12),
          // Navigation Items
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 10),
              itemCount: widget.pages.length,
              itemBuilder: (context, index) {
                return _NavItem(
                  page: widget.pages[index],
                  isActive: index == widget.currentIndex,
                  isExpanded: widget.isExpanded,
                  onTap: () => widget.onPageSelected(index),
                );
              },
            ),
          ),
          const Divider(height: 1, color: AppColors.border),
          // Toggle Button
          _buildToggleButton(),
          const SizedBox(height: 12),
          // User Profile
          if (widget.isExpanded) _buildUserProfile(),
          if (widget.isExpanded) const SizedBox(height: 8),
          if (widget.isExpanded) _buildLogoutButton(),
          const SizedBox(height: 12),
        ],
      ),
    );
  }

  Widget _buildBrandHeader() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Row(
        mainAxisAlignment: widget.isExpanded ? MainAxisAlignment.start : MainAxisAlignment.center,
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: AppColors.gradientPrimary,
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: AppBorders.radiusMd,
              boxShadow: [AppShadows.glow(AppColors.primary)],
            ),
            child: const Icon(Icons.directions_car, color: Colors.white, size: 22),
          ),
          if (widget.isExpanded) ...[
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'AUTO RENEW',
                    style: AppTypography.labelLarge.copyWith(
                      fontSize: 16,
                      letterSpacing: 1.5,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'نظام إدارة الكراج',
                    style: AppTypography.labelSmall.copyWith(
                      fontSize: 10,
                      color: AppColors.textMuted,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildToggleButton() {
    return GestureDetector(
      onTap: widget.onToggle,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 12),
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: AppColors.bgTertiary,
          borderRadius: AppBorders.radiusMd,
        ),
        child: Icon(
          widget.isExpanded ? Icons.chevron_right : Icons.chevron_left,
          color: AppColors.textTertiary,
          size: 20,
        ),
      ),
    );
  }

  Widget _buildUserProfile() {
    final name = widget.employee?.name ?? 'مدير النظام';
    final roleLabel = widget.employee?.role.label ?? 'مدير';
    final initial = name.isNotEmpty ? name[0] : 'م';
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.accentPurple, AppColors.primary],
              ),
              borderRadius: AppBorders.radiusFull,
            ),
            child: Center(
              child: Text(
                initial,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: AppTypography.labelMedium.copyWith(fontSize: 13)),
                Text(roleLabel, style: AppTypography.bodySmall.copyWith(fontSize: 11, color: AppColors.textMuted)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLogoutButton() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: GestureDetector(
        onTap: widget.onLogout,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
          decoration: BoxDecoration(
            color: AppColors.error.withOpacity(0.08),
            borderRadius: AppBorders.radiusMd,
            border: Border.all(color: AppColors.error.withOpacity(0.2)),
          ),
          child: Row(
            children: [
              Icon(Icons.logout, size: 18, color: AppColors.error),
              const SizedBox(width: 10),
              Text('تسجيل الخروج', style: AppTypography.labelSmall.copyWith(
                color: AppColors.error, fontSize: 12)),
            ],
          ),
        ),
      ),
    );
  }
}

// ============================================================
// NAV ITEM
// ============================================================
class _NavItem extends StatefulWidget {
  final AppPage page;
  final bool isActive;
  final bool isExpanded;
  final VoidCallback onTap;

  const _NavItem({
    required this.page,
    required this.isActive,
    required this.isExpanded,
    required this.onTap,
  });

  @override
  State<_NavItem> createState() => _NavItemState();
}

class _NavItemState extends State<_NavItem> {
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
          padding: EdgeInsets.symmetric(
            horizontal: widget.isExpanded ? 14 : 10,
            vertical: 10,
          ),
          decoration: BoxDecoration(
            color: widget.isActive
                ? AppColors.primary.withOpacity(0.12)
                : _hovered
                    ? AppColors.surfaceHover.withOpacity(0.5)
                    : Colors.transparent,
            borderRadius: AppBorders.radiusMd,
            border: widget.isActive
                ? Border.all(color: AppColors.primary.withOpacity(0.25))
                : null,
          ),
          child: Row(
            mainAxisAlignment: widget.isExpanded
                ? MainAxisAlignment.start
                : MainAxisAlignment.center,
            children: [
              AnimatedSwitcher(
                duration: AppAnimations.fast,
                child: Icon(
                  widget.isActive
                      ? widget.page.activeIcon ?? widget.page.icon
                      : widget.page.icon,
                  key: ValueKey(widget.isActive),
                  color: widget.isActive
                      ? AppColors.primary
                      : AppColors.textTertiary,
                  size: 22,
                ),
              ),
              if (widget.isExpanded) ...[
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    widget.page.title,
                    style: AppTypography.labelMedium.copyWith(
                      fontSize: 13,
                      color: widget.isActive
                          ? AppColors.primary
                          : AppColors.textSecondary,
                    ),
                  ),
                ),
                if (widget.isActive)
                  Container(
                    width: 6,
                    height: 6,
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withOpacity(0.5),
                          blurRadius: 8,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                  ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

// ============================================================
// TOP BAR
// ============================================================
class _TopBar extends StatelessWidget {
  final String pageTitle;
  final IconData pageIcon;
  final bool showMenu;
  final VoidCallback onMenuPressed;

  const _TopBar({
    required this.pageTitle,
    required this.pageIcon,
    required this.showMenu,
    required this.onMenuPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 72,
      padding: const EdgeInsets.symmetric(horizontal: 28),
      decoration: BoxDecoration(
        color: AppColors.bgPrimary,
        border: Border(
          bottom: BorderSide(color: AppColors.border.withOpacity(0.3)),
        ),
      ),
      child: Row(
        children: [
          if (showMenu)
            GestureDetector(
              onTap: onMenuPressed,
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.bgSecondary,
                  borderRadius: AppBorders.radiusMd,
                ),
                child: Icon(Icons.menu, color: AppColors.textSecondary, size: 22),
              ),
            ),
          if (showMenu) const SizedBox(width: 16),
          Icon(pageIcon, size: 20, color: AppColors.primary),
          const SizedBox(width: 12),
          Text(
            pageTitle,
            style: AppTypography.headingSmall.copyWith(fontSize: 20),
          ),
          const Spacer(),
          // Search
          Container(
            width: 320,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: AppColors.bgSecondary,
              borderRadius: AppBorders.radiusLg,
              border: Border.all(color: AppColors.border.withOpacity(0.4)),
            ),
            child: Row(
              children: [
                Icon(Icons.search, size: 18, color: AppColors.textMuted),
                const SizedBox(width: 10),
                Text(
                  'بحث...',
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textMuted,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          // Notification
          _TopBarAction(
            icon: Icons.notifications_outlined,
            badge: 3,
            onTap: () => showInfoToast(context, 'لا يوجد إشعارات جديدة'),
          ),
          const SizedBox(width: 8),
          _TopBarAction(
            icon: Icons.mail_outline,
            onTap: () => showInfoToast(context, 'صندوق البريد فارغ'),
          ),
        ],
      ),
    );
  }
}

class _TopBarAction extends StatelessWidget {
  final IconData icon;
  final int? badge;
  final VoidCallback onTap;

  const _TopBarAction({required this.icon, this.badge, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        GestureDetector(
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.bgSecondary,
              borderRadius: AppBorders.radiusMd,
              border: Border.all(color: AppColors.border.withOpacity(0.3)),
            ),
            child: Icon(icon, size: 20, color: AppColors.textSecondary),
          ),
        ),
        if (badge != null && badge! > 0)
          Positioned(
            top: 6,
            right: 6,
            child: Container(
              width: 16,
              height: 16,
              decoration: const BoxDecoration(
                color: AppColors.error,
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(
                  '$badge',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}

// ============================================================
// MOBILE BOTTOM NAV
// ============================================================
class _MobileBottomNav extends StatelessWidget {
  final List<AppPage> pages;
  final int currentIndex;
  final Function(int) onPageSelected;

  const _MobileBottomNav({
    required this.pages,
    required this.currentIndex,
    required this.onPageSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.bgSecondary,
        border: Border(
          top: BorderSide(color: AppColors.border.withOpacity(0.3)),
        ),
        boxShadow: [AppShadows.lg],
      ),
      child: SafeArea(
        child: SizedBox(
          height: 68,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: pages.take(5).toList().asMap().entries.map((entry) {
              final index = entry.key;
              final page = entry.value;
              final isActive = index == currentIndex;
              return GestureDetector(
                onTap: () => onPageSelected(index),
                child: AnimatedContainer(
                  duration: AppAnimations.normal,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: isActive
                        ? AppColors.primary.withOpacity(0.12)
                        : Colors.transparent,
                    borderRadius: AppBorders.radiusMd,
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        isActive ? page.activeIcon ?? page.icon : page.icon,
                        color: isActive ? AppColors.primary : AppColors.textTertiary,
                        size: 22,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        page.title,
                        style: AppTypography.labelSmall.copyWith(
                          color: isActive ? AppColors.primary : AppColors.textTertiary,
                          fontSize: 10,
                          fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
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
}

// ============================================================
// APP PAGE MODEL
// ============================================================
class AppPage {
  final String title;
  final IconData icon;
  final IconData? activeIcon;
  final Widget page;

  const AppPage({
    required this.title,
    required this.icon,
    this.activeIcon,
    required this.page,
  });
}
