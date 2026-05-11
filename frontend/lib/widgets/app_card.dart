import 'package:flutter/material.dart';
import '../core/design_system.dart';

// Enterprise Card Component
class AppCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final VoidCallback? onTap;
  final Color? backgroundColor;
  final BorderRadius? borderRadius;
  final List<BoxShadow>? shadows;
  final Widget? header;
  final Widget? footer;
  final double? width;
  final double? height;

  const AppCard({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.onTap,
    this.backgroundColor,
    this.borderRadius,
    this.shadows,
    this.header,
    this.footer,
    this.width,
    this.height,
  });

  @override
  Widget build(BuildContext context) {
    Widget content = Container(
      width: width,
      height: height,
      margin: margin ?? const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: backgroundColor ?? AppColors.surface,
        borderRadius: borderRadius ?? AppBorders.radiusLg,
        border: Border.all(color: AppColors.border.withOpacity(0.5)),
        boxShadow: shadows ?? [AppShadows.md],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (header != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: header!,
            ),
          Padding(
            padding: padding ?? const EdgeInsets.all(20),
            child: child,
          ),
          if (footer != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
              child: footer!,
            ),
        ],
      ),
    );

    if (onTap != null) {
      content = MouseRegion(
        cursor: SystemMouseCursors.click,
        child: GestureDetector(
          onTap: onTap,
          child: AnimatedContainer(
            duration: AppAnimations.fast,
            child: content,
          ),
        ),
      );
    }

    return content;
  }
}

// Stat Card for Dashboard
class StatCard extends StatelessWidget {
  final String title;
  final String value;
  final String? subtitle;
  final IconData icon;
  final Color color;
  final double? trend;
  final VoidCallback? onTap;

  const StatCard({
    super.key,
    required this.title,
    required this.value,
    this.subtitle,
    required this.icon,
    required this.color,
    this.trend,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: AppBorders.radiusMd,
                ),
                child: Icon(icon, color: color, size: 22),
              ),
              if (trend != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: (trend! >= 0 ? AppColors.success : AppColors.error).withOpacity(0.1),
                    borderRadius: AppBorders.radiusSm,
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        trend! >= 0 ? Icons.arrow_upward : Icons.arrow_downward,
                        size: 12,
                        color: trend! >= 0 ? AppColors.success : AppColors.error,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${trend!.abs().toStringAsFixed(1)}%',
                        style: AppTypography.labelSmall.copyWith(
                          color: trend! >= 0 ? AppColors.success : AppColors.error,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          Text(value, style: AppTypography.displaySmall.copyWith(fontSize: 28)),
          const SizedBox(height: 4),
          Text(title, style: AppTypography.bodyMedium),
          if (subtitle != null) ...[
            const SizedBox(height: 4),
            Text(subtitle!, style: AppTypography.bodySmall),
          ],
        ],
      ),
    );
  }
}

// Chart Container
class ChartCard extends StatelessWidget {
  final String title;
  final Widget chart;
  final List<Widget>? actions;

  const ChartCard({
    super.key,
    required this.title,
    required this.chart,
    this.actions,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard(
      header: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: AppTypography.headingSmall.copyWith(fontSize: 16)),
          if (actions != null) Row(children: actions!),
        ],
      ),
      child: chart,
    );
  }
}
