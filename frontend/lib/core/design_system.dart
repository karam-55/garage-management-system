import 'package:flutter/material.dart';

// ============================================
// AUTO RENEW - Enterprise Design System
// Inspired by: Linear, Stripe, Notion, Vercel
// ============================================

class AppColors {
  // Primary Palette
  static const Color primary = Color(0xFF6366F1);
  static const Color primaryDark = Color(0xFF4F46E5);
  static const Color primaryLight = Color(0xFF818CF8);
  
  // Secondary
  static const Color secondary = Color(0xFF10B981);
  static const Color secondaryDark = Color(0xFF059669);
  
  // Accent Colors
  static const Color accentOrange = Color(0xFFF59E0B);
  static const Color accentRed = Color(0xFFEF4444);
  static const Color accentBlue = Color(0xFF3B82F6);
  static const Color accentPurple = Color(0xFF8B5CF6);
  static const Color accentCyan = Color(0xFF06B6D4);
  
  // Background Colors
  static const Color bgPrimary = Color(0xFF0F172A);
  static const Color bgSecondary = Color(0xFF1E293B);
  static const Color bgTertiary = Color(0xFF334155);
  static const Color bgElevated = Color(0xFF1E293B);
  
  // Surface
  static const Color surface = Color(0xFF1E293B);
  static const Color surfaceHover = Color(0xFF334155);
  static const Color surfacePressed = Color(0xFF475569);
  
  // Text Colors
  static const Color textPrimary = Color(0xFFF1F5F9);
  static const Color textSecondary = Color(0xFF94A3B8);
  static const Color textTertiary = Color(0xFF64748B);
  static const Color textInverse = Color(0xFF0F172A);
  
  // Border Colors
  static const Color border = Color(0xFF334155);
  static const Color borderLight = Color(0xFF475569);
  
  // Status Colors
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);
  
  // Gradient Pairs
  static const List<Color> gradientPrimary = [Color(0xFF6366F1), Color(0xFF8B5CF6)];
  static const List<Color> gradientSuccess = [Color(0xFF10B981), Color(0xFF06B6D4)];
  static const List<Color> gradientWarning = [Color(0xFFF59E0B), Color(0xFFF97316)];
  static const List<Color> gradientDanger = [Color(0xFFEF4444), Color(0xFFEC4899)];
  static const List<Color> gradientDark = [Color(0xFF1E293B), Color(0xFF0F172A)];
}

class AppTypography {
  static const String fontFamily = 'Inter';
  
  // Display
  static TextStyle displayLarge = const TextStyle(
    fontSize: 48,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.02,
    color: AppColors.textPrimary,
    height: 1.1,
  );
  
  static TextStyle displayMedium = const TextStyle(
    fontSize: 36,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.02,
    color: AppColors.textPrimary,
    height: 1.2,
  );
  
  static TextStyle displaySmall = const TextStyle(
    fontSize: 28,
    fontWeight: FontWeight.w600,
    letterSpacing: -0.01,
    color: AppColors.textPrimary,
    height: 1.3,
  );
  
  // Headings
  static TextStyle headingLarge = const TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.w600,
    letterSpacing: -0.01,
    color: AppColors.textPrimary,
    height: 1.3,
  );
  
  static TextStyle headingMedium = const TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
    height: 1.4,
  );
  
  static TextStyle headingSmall = const TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
    height: 1.4,
  );
  
  // Body
  static TextStyle bodyLarge = const TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w400,
    color: AppColors.textSecondary,
    height: 1.5,
  );
  
  static TextStyle bodyMedium = const TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: AppColors.textSecondary,
    height: 1.5,
  );
  
  static TextStyle bodySmall = const TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: AppColors.textTertiary,
    height: 1.5,
  );
  
  // Labels & Buttons
  static TextStyle labelLarge = const TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.01,
    color: AppColors.textPrimary,
  );
  
  static TextStyle labelMedium = const TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.01,
    color: AppColors.textPrimary,
  );
  
  static TextStyle labelSmall = const TextStyle(
    fontSize: 11,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.02,
    color: AppColors.textTertiary,
  );
  
  // Mono (for numbers, codes)
  static TextStyle monoLarge = const TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w500,
    fontFamily: 'monospace',
    color: AppColors.textPrimary,
  );
  
  static TextStyle monoMedium = const TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    fontFamily: 'monospace',
    color: AppColors.textSecondary,
  );
}

class AppShadows {
  static BoxShadow get sm => BoxShadow(
    color: Colors.black.withOpacity(0.1),
    blurRadius: 2,
    offset: const Offset(0, 1),
  );
  
  static BoxShadow get md => BoxShadow(
    color: Colors.black.withOpacity(0.15),
    blurRadius: 8,
    offset: const Offset(0, 4),
  );
  
  static BoxShadow get lg => BoxShadow(
    color: Colors.black.withOpacity(0.2),
    blurRadius: 16,
    offset: const Offset(0, 8),
  );
  
  static BoxShadow get xl => BoxShadow(
    color: Colors.black.withOpacity(0.25),
    blurRadius: 24,
    offset: const Offset(0, 12),
  );
  
  static BoxShadow get glow => BoxShadow(
    color: AppColors.primary.withOpacity(0.3),
    blurRadius: 20,
    spreadRadius: -5,
  );
  
  static BoxShadow get glowSuccess => BoxShadow(
    color: AppColors.success.withOpacity(0.3),
    blurRadius: 20,
    spreadRadius: -5,
  );
}

class AppBorders {
  static BorderRadius get radiusSm => BorderRadius.circular(6);
  static BorderRadius get radiusMd => BorderRadius.circular(8);
  static BorderRadius get radiusLg => BorderRadius.circular(12);
  static BorderRadius get radiusXl => BorderRadius.circular(16);
  static BorderRadius get radius2xl => BorderRadius.circular(20);
  static BorderRadius get radiusFull => BorderRadius.circular(9999);
  
  static OutlineInputBorder get inputBorder => OutlineInputBorder(
    borderRadius: radiusMd,
    borderSide: const BorderSide(color: AppColors.border),
  );
  
  static OutlineInputBorder get inputFocused => OutlineInputBorder(
    borderRadius: radiusMd,
    borderSide: const BorderSide(color: AppColors.primary, width: 2),
  );
}

class AppSpacing {
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 16;
  static const double lg = 24;
  static const double xl = 32;
  static const double xxl = 48;
}

class AppAnimations {
  static const Duration fast = Duration(milliseconds: 150);
  static const Duration normal = Duration(milliseconds: 250);
  static const Duration slow = Duration(milliseconds: 400);
  
  static const Curve easeOut = Curves.easeOutCubic;
  static const Curve easeIn = Curves.easeInCubic;
  static const Curve elastic = Curves.elasticOut;
  static const Curve bounce = Curves.bounceOut;
}
