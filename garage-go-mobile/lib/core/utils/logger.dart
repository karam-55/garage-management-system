import 'dart:developer';

class Logger {
  static const String _tag = 'GarageGo';

  static void debug(String message, [Object? error, StackTrace? stackTrace]) {
    if (_isDebugMode) {
      log('🔍 DEBUG: $message', name: _tag, error: error, stackTrace: stackTrace);
    }
  }

  static void info(String message, [Object? error, StackTrace? stackTrace]) {
    log('ℹ️ INFO: $message', name: _tag, error: error, stackTrace: stackTrace);
  }

  static void warning(String message, [Object? error, StackTrace? stackTrace]) {
    log('⚠️ WARNING: $message', name: _tag, error: error, stackTrace: stackTrace);
  }

  static void error(String message, [Object? error, StackTrace? stackTrace]) {
    log('❌ ERROR: $message', name: _tag, error: error, stackTrace: stackTrace);
  }

  static void success(String message) {
    log('✅ SUCCESS: $message', name: _tag);
  }

  static void network(String message) {
    log('🌐 NETWORK: $message', name: _tag);
  }

  static void auth(String message) {
    log('🔐 AUTH: $message', name: _tag);
  }

  static void database(String message) {
    log('💾 DATABASE: $message', name: _tag);
  }

  static void ui(String message) {
    log('🎨 UI: $message', name: _tag);
  }

  static void navigation(String message) {
    log('🧭 NAVIGATION: $message', name: _tag);
  }

  static void api(String message, {int statusCode = 0, dynamic data}) {
    String status = '';
    if (statusCode > 0) {
      status = ' [$statusCode]';
    }
    log('📡 API$status: $message', name: _tag);
    if (data != null) {
      log('📡 DATA: $data', name: _tag);
    }
  }

  static void storage(String message) {
    log('💾 STORAGE: $message', name: _tag);
  }

  static void notification(String message) {
    log('🔔 NOTIFICATION: $message', name: _tag);
  }

  static void performance(String operation, Duration duration) {
    log('⏱️ PERFORMANCE: $operation took ${duration.inMilliseconds}ms', name: _tag);
  }

  static bool get _isDebugMode {
    bool inDebugMode = false;
    assert(inDebugMode = true);
    return inDebugMode;
  }
}
