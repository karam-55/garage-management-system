import 'package:flutter/material.dart';
import '../core/design_system.dart';
import 'app_button.dart';

class AppModal {
  static Future<T?> show<T>({
    required BuildContext context,
    required String title,
    required Widget content,
    double maxWidth = 520,
    Widget? footer,
    bool dismissible = true,
  }) {
    return showDialog<T>(
      context: context,
      barrierDismissible: dismissible,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
        child: Center(
          child: ConstrainedBox(
            constraints: BoxConstraints(maxWidth: maxWidth),
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: AppBorders.radiusXl,
                border: Border.all(color: AppColors.border.withOpacity(0.5)),
                boxShadow: [AppShadows.xl],
              ),
              child: ClipRRect(
                borderRadius: AppBorders.radiusXl,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Header
                    Container(
                      padding: const EdgeInsets.fromLTRB(24, 20, 16, 12),
                      decoration: BoxDecoration(
                        color: AppColors.bgSecondary,
                        border: Border(
                          bottom: BorderSide(color: AppColors.border.withOpacity(0.3)),
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(title, style: AppTypography.headingSmall.copyWith(fontSize: 16)),
                          AppIconButton(
                            icon: Icons.close,
                            color: AppColors.textTertiary,
                            onPressed: () => Navigator.pop(context),
                          ),
                        ],
                      ),
                    ),
                    // Content
                    Flexible(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.all(24),
                        child: content,
                      ),
                    ),
                    // Footer
                    if (footer != null)
                      Container(
                        padding: const EdgeInsets.fromLTRB(24, 0, 24, 20),
                        child: footer,
                      ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  static Future<bool?> confirm({
    required BuildContext context,
    required String title,
    required String message,
    String confirmText = 'تأكيد',
    String cancelText = 'إلغاء',
    ButtonVariant confirmVariant = ButtonVariant.danger,
  }) {
    return show<bool>(
      context: context,
      title: title,
      maxWidth: 400,
      content: Text(message, style: AppTypography.bodyMedium),
      footer: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          AppButton(
            label: cancelText,
            variant: ButtonVariant.ghost,
            onPressed: () => Navigator.pop(context, false),
          ),
          const SizedBox(width: 8),
          AppButton(
            label: confirmText,
            variant: confirmVariant,
            onPressed: () => Navigator.pop(context, true),
          ),
        ],
      ),
    );
  }
}

class AppIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onPressed;
  final Color? color;
  final double size;
  final String? tooltip;

  const AppIconButton({
    super.key,
    required this.icon,
    this.onPressed,
    this.color,
    this.size = 20,
    this.tooltip,
  });

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: Icon(icon, size: size, color: color),
      onPressed: onPressed,
      tooltip: tooltip,
      splashRadius: 20,
    );
  }
}
