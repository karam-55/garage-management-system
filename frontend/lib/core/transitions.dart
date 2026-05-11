import 'package:flutter/material.dart';

Route<T> fadeRoute<T>(Widget page, {Duration duration = const Duration(milliseconds: 400)}) {
  return PageRouteBuilder<T>(
    pageBuilder: (context, animation, secondaryAnimation) => page,
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      return FadeTransition(opacity: animation, child: child);
    },
    transitionDuration: duration,
  );
}

Route<T> slideRightRoute<T>(Widget page, {Duration duration = const Duration(milliseconds: 400)}) {
  return PageRouteBuilder<T>(
    pageBuilder: (context, animation, secondaryAnimation) => page,
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      const begin = Offset(1.0, 0.0);
      const end = Offset.zero;
      final tween = Tween(begin: begin, end: end).chain(CurveTween(curve: Curves.easeOutCubic));
      return SlideTransition(
        position: animation.drive(tween),
        child: child,
      );
    },
    transitionDuration: duration,
  );
}

Route<T> slideUpRoute<T>(Widget page, {Duration duration = const Duration(milliseconds: 400)}) {
  return PageRouteBuilder<T>(
    pageBuilder: (context, animation, secondaryAnimation) => page,
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      const begin = Offset(0.0, 1.0);
      const end = Offset.zero;
      final tween = Tween(begin: begin, end: end).chain(CurveTween(curve: Curves.easeOutCubic));
      return SlideTransition(
        position: animation.drive(tween),
        child: child,
      );
    },
    transitionDuration: duration,
  );
}

Route<T> scaleRoute<T>(Widget page, {Duration duration = const Duration(milliseconds: 350)}) {
  return PageRouteBuilder<T>(
    pageBuilder: (context, animation, secondaryAnimation) => page,
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      final tween = Tween(begin: 0.85, end: 1.0).chain(CurveTween(curve: Curves.easeOutBack));
      return ScaleTransition(
        scale: animation.drive(tween),
        child: FadeTransition(opacity: animation, child: child),
      );
    },
    transitionDuration: duration,
  );
}

void navigateWithTransition(BuildContext context, Widget page, {String type = 'slideRight'}) {
  switch (type) {
    case 'fade':
      Navigator.push(context, fadeRoute(page));
      break;
    case 'slideUp':
      Navigator.push(context, slideUpRoute(page));
      break;
    case 'scale':
      Navigator.push(context, scaleRoute(page));
      break;
    case 'slideRight':
    default:
      Navigator.push(context, slideRightRoute(page));
      break;
  }
}
