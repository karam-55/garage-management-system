import 'package:flutter/material.dart';
import '../core/design_system.dart';

class AppTable extends StatelessWidget {
  final List<String> columns;
  final List<List<Widget>> rows;
  final List<double>? columnWidths;
  final Widget? headerActions;
  final String? title;
  final String? subtitle;

  const AppTable({
    super.key,
    required this.columns,
    required this.rows,
    this.columnWidths,
    this.headerActions,
    this.title,
    this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: AppBorders.radiusLg,
        border: Border.all(color: AppColors.border.withOpacity(0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (title != null || headerActions != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (title != null)
                        Text(title!, style: AppTypography.headingSmall.copyWith(fontSize: 16)),
                      if (subtitle != null)
                        Text(subtitle!, style: AppTypography.bodySmall),
                    ],
                  ),
                  if (headerActions != null) headerActions!,
                ],
              ),
            ),
          // Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.bgSecondary,
              border: Border(
                bottom: BorderSide(color: AppColors.border.withOpacity(0.3)),
              ),
            ),
            child: Row(
              children: columns.asMap().entries.map((entry) {
                final index = entry.key;
                final col = entry.value;
                return Expanded(
                  flex: columnWidths != null && index < columnWidths!.length
                      ? (columnWidths![index] * 10).toInt()
                      : 1,
                  child: Text(
                    col,
                    style: AppTypography.labelSmall.copyWith(
                      color: AppColors.textTertiary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          // Rows
          ...rows.asMap().entries.map((entry) {
            final index = entry.key;
            final row = entry.value;
            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              decoration: BoxDecoration(
                border: Border(
                  bottom: BorderSide(
                    color: AppColors.border.withOpacity(0.2),
                  ),
                ),
                color: index % 2 == 0 ? Colors.transparent : AppColors.bgPrimary.withOpacity(0.3),
              ),
              child: Row(
                children: row.asMap().entries.map((cellEntry) {
                  final cellIndex = cellEntry.key;
                  final cell = cellEntry.value;
                  return Expanded(
                    flex: columnWidths != null && cellIndex < columnWidths!.length
                        ? (columnWidths![cellIndex] * 10).toInt()
                        : 1,
                    child: cell,
                  );
                }).toList(),
              ),
            );
          }).toList(),
        ],
      ),
    );
  }
}

class StatusBadge extends StatelessWidget {
  final String label;
  final Color color;

  const StatusBadge({
    super.key,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: AppBorders.radiusFull,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 6),
          Text(
            label,
            style: AppTypography.labelSmall.copyWith(color: color),
          ),
        ],
      ),
    );
  }
}
