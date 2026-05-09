import 'package:flutter/material.dart';

class StatusBadge extends StatelessWidget {
  final String status;
  final double? fontSize;
  final EdgeInsetsGeometry? padding;

  const StatusBadge({
    Key? key,
    required this.status,
    this.fontSize,
    this.padding,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final (Color color, String text) = _getStatusInfo(status);

    return Container(
      padding: padding ?? const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color, width: 1),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: fontSize ?? 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  (Color, String) _getStatusInfo(String status) {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return (Colors.orange, 'قيد الانتظار');
      case 'IN_PROGRESS':
        return (Colors.blue, 'قيد التنفيذ');
      case 'COMPLETED':
        return (Colors.green, 'مكتمل');
      case 'CANCELLED':
        return (Colors.red, 'ملغي');
      case 'LOW':
        return (Colors.orange, 'منخفض');
      case 'CRITICAL':
        return (Colors.red, 'حرج');
      case 'NORMAL':
        return (Colors.green, 'متوفر');
      default:
        return (Colors.grey, status);
    }
  }
}
