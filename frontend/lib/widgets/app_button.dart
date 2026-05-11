import 'package:flutter/material.dart';
import '../core/design_system.dart';

enum ButtonVariant { primary, secondary, outline, ghost, danger }
enum ButtonSize { sm, md, lg }

class AppButton extends StatefulWidget {
  final String label;
  final IconData? icon;
  final IconData? trailingIcon;
  final VoidCallback? onPressed;
  final ButtonVariant variant;
  final ButtonSize size;
  final bool isLoading;
  final bool isFullWidth;
  final double? width;

  const AppButton({
    super.key,
    required this.label,
    this.icon,
    this.trailingIcon,
    this.onPressed,
    this.variant = ButtonVariant.primary,
    this.size = ButtonSize.md,
    this.isLoading = false,
    this.isFullWidth = false,
    this.width,
  });

  @override
  State<AppButton> createState() => _AppButtonState();
}

class _AppButtonState extends State<AppButton> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final size = _getSize();
    final colors = _getColors();

    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: AnimatedContainer(
        duration: AppAnimations.fast,
        width: widget.isFullWidth ? double.infinity : widget.width,
        height: size.height,
        decoration: BoxDecoration(
          gradient: widget.variant == ButtonVariant.primary && !_isHovered
              ? const LinearGradient(colors: AppColors.gradientPrimary)
              : null,
          color: widget.variant == ButtonVariant.primary && !_isHovered
              ? null
              : _isHovered
                  ? colors.hoverColor
                  : colors.backgroundColor,
          borderRadius: AppBorders.radiusMd,
          border: widget.variant == ButtonVariant.outline
              ? Border.all(color: colors.borderColor!)
              : null,
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: widget.isLoading ? null : widget.onPressed,
            borderRadius: AppBorders.radiusMd,
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: size.paddingHorizontal),
              child: widget.isLoading
                  ? Center(
                      child: SizedBox(
                        width: size.iconSize,
                        height: size.iconSize,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(colors.textColor),
                        ),
                      ),
                    )
                  : Row(
                      mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        if (widget.icon != null) ...[
                          Icon(widget.icon!, size: size.iconSize, color: colors.textColor),
                          SizedBox(width: size.spacing),
                        ],
                        Text(
                          widget.label,
                          style: AppTypography.labelLarge.copyWith(
                            fontSize: size.fontSize,
                            color: colors.textColor,
                          ),
                        ),
                        if (widget.trailingIcon != null) ...[
                          SizedBox(width: size.spacing),
                          Icon(widget.trailingIcon!, size: size.iconSize, color: colors.textColor),
                        ],
                      ],
                    ),
            ),
          ),
        ),
      ),
    );
  }

  _ButtonSize _getSize() {
    switch (widget.size) {
      case ButtonSize.sm:
        return _ButtonSize(height: 32, paddingHorizontal: 12, fontSize: 12, iconSize: 14, spacing: 6);
      case ButtonSize.lg:
        return _ButtonSize(height: 48, paddingHorizontal: 24, fontSize: 16, iconSize: 20, spacing: 10);
      case ButtonSize.md:
      default:
        return _ButtonSize(height: 40, paddingHorizontal: 16, fontSize: 14, iconSize: 16, spacing: 8);
    }
  }

  _ButtonColors _getColors() {
    switch (widget.variant) {
      case ButtonVariant.secondary:
        return _ButtonColors(
          backgroundColor: AppColors.secondary.withOpacity(0.1),
          hoverColor: AppColors.secondary.withOpacity(0.2),
          textColor: AppColors.secondary,
        );
      case ButtonVariant.outline:
        return _ButtonColors(
          backgroundColor: Colors.transparent,
          hoverColor: AppColors.primary.withOpacity(0.1),
          textColor: AppColors.primary,
          borderColor: AppColors.border,
        );
      case ButtonVariant.ghost:
        return _ButtonColors(
          backgroundColor: Colors.transparent,
          hoverColor: AppColors.surfaceHover,
          textColor: AppColors.textSecondary,
        );
      case ButtonVariant.danger:
        return _ButtonColors(
          backgroundColor: AppColors.error.withOpacity(0.1),
          hoverColor: AppColors.error.withOpacity(0.2),
          textColor: AppColors.error,
        );
      case ButtonVariant.primary:
      default:
        return _ButtonColors(
          backgroundColor: AppColors.primary,
          hoverColor: AppColors.primaryLight,
          textColor: Colors.white,
        );
    }
  }
}

class _ButtonSize {
  final double height;
  final double paddingHorizontal;
  final double fontSize;
  final double iconSize;
  final double spacing;
  _ButtonSize({required this.height, required this.paddingHorizontal, required this.fontSize, required this.iconSize, required this.spacing});
}

class _ButtonColors {
  final Color backgroundColor;
  final Color hoverColor;
  final Color textColor;
  final Color? borderColor;
  _ButtonColors({required this.backgroundColor, required this.hoverColor, required this.textColor, this.borderColor});
}

// Icon Button
class AppIconButton extends StatefulWidget {
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
  State<AppIconButton> createState() => _AppIconButtonState();
}

class _AppIconButtonState extends State<AppIconButton> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: widget.tooltip ?? '',
      child: MouseRegion(
        onEnter: (_) => setState(() => _isHovered = true),
        onExit: (_) => setState(() => _isHovered = false),
        child: AnimatedContainer(
          duration: AppAnimations.fast,
          decoration: BoxDecoration(
            color: _isHovered ? AppColors.surfaceHover : Colors.transparent,
            borderRadius: AppBorders.radiusMd,
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: widget.onPressed,
              borderRadius: AppBorders.radiusMd,
              child: Padding(
                padding: const EdgeInsets.all(8),
                child: Icon(
                  widget.icon,
                  size: widget.size,
                  color: widget.color ?? AppColors.textSecondary,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
