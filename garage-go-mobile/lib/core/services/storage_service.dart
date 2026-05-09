import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../constants/app_constants.dart';
import '../utils/logger.dart';

class StorageService {
  static const FlutterSecureStorage _secureStorage = FlutterSecureStorage();
  static SharedPreferences? _prefs;

  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
    Logger.info('Storage service initialized');
  }

  // Secure Storage Methods (for sensitive data)
  static Future<void> setToken(String token) async {
    try {
      await _secureStorage.write(key: AppConstants.tokenKey, value: token);
      Logger.auth('Token saved securely');
    } catch (e) {
      Logger.error('Failed to save token', e);
    }
  }

  static Future<String?> getToken() async {
    try {
      final token = await _secureStorage.read(key: AppConstants.tokenKey);
      Logger.auth('Token retrieved from secure storage');
      return token;
    } catch (e) {
      Logger.error('Failed to retrieve token', e);
      return null;
    }
  }

  static Future<void> setRefreshToken(String refreshToken) async {
    try {
      await _secureStorage.write(key: AppConstants.refreshTokenKey, value: refreshToken);
      Logger.auth('Refresh token saved securely');
    } catch (e) {
      Logger.error('Failed to save refresh token', e);
    }
  }

  static Future<String?> getRefreshToken() async {
    try {
      final refreshToken = await _secureStorage.read(key: AppConstants.refreshTokenKey);
      Logger.auth('Refresh token retrieved from secure storage');
      return refreshToken;
    } catch (e) {
      Logger.error('Failed to retrieve refresh token', e);
      return null;
    }
  }

  static Future<void> setFCMToken(String fcmToken) async {
    try {
      await _secureStorage.write(key: AppConstants.fcmTokenKey, value: fcmToken);
      Logger.notification('FCM token saved securely');
    } catch (e) {
      Logger.error('Failed to save FCM token', e);
    }
  }

  static Future<String?> getFCMToken() async {
    try {
      final fcmToken = await _secureStorage.read(key: AppConstants.fcmTokenKey);
      Logger.notification('FCM token retrieved from secure storage');
      return fcmToken;
    } catch (e) {
      Logger.error('Failed to retrieve FCM token', e);
      return null;
    }
  }

  // Regular Storage Methods (for non-sensitive data)
  static Future<void> setUser(Map<String, dynamic> userData) async {
    try {
      await _prefs?.setString(AppConstants.userKey, jsonEncode(userData));
      Logger.storage('User data saved');
    } catch (e) {
      Logger.error('Failed to save user data', e);
    }
  }

  static Future<Map<String, dynamic>?> getUser() async {
    try {
      final userData = _prefs?.getString(AppConstants.userKey);
      if (userData != null) {
        final userMap = jsonDecode(userData) as Map<String, dynamic>;
        Logger.storage('User data retrieved');
        return userMap;
      }
      return null;
    } catch (e) {
      Logger.error('Failed to retrieve user data', e);
      return null;
    }
  }

  static Future<void> setThemeMode(String themeMode) async {
    try {
      await _prefs?.setString(AppConstants.themeKey, themeMode);
      Logger.storage('Theme mode saved: $themeMode');
    } catch (e) {
      Logger.error('Failed to save theme mode', e);
    }
  }

  static Future<String> getThemeMode() async {
    try {
      final themeMode = _prefs?.getString(AppConstants.themeKey) ?? 'system';
      Logger.storage('Theme mode retrieved: $themeMode');
      return themeMode;
    } catch (e) {
      Logger.error('Failed to retrieve theme mode', e);
      return 'system';
    }
  }

  static Future<void> setLanguage(String language) async {
    try {
      await _prefs?.setString(AppConstants.languageKey, language);
      Logger.storage('Language saved: $language');
    } catch (e) {
      Logger.error('Failed to save language', e);
    }
  }

  static Future<String> getLanguage() async {
    try {
      final language = _prefs?.getString(AppConstants.languageKey) ?? 'en';
      Logger.storage('Language retrieved: $language');
      return language;
    } catch (e) {
      Logger.error('Failed to retrieve language', e);
      return 'en';
    }
  }

  // Generic storage methods
  static Future<void> setString(String key, String value) async {
    try {
      await _prefs?.setString(key, value);
      Logger.storage('String saved: $key');
    } catch (e) {
      Logger.error('Failed to save string: $key', e);
    }
  }

  static Future<String?> getString(String key) async {
    try {
      final value = _prefs?.getString(key);
      Logger.storage('String retrieved: $key');
      return value;
    } catch (e) {
      Logger.error('Failed to retrieve string: $key', e);
      return null;
    }
  }

  static Future<void> setBool(String key, bool value) async {
    try {
      await _prefs?.setBool(key, value);
      Logger.storage('Bool saved: $key');
    } catch (e) {
      Logger.error('Failed to save bool: $key', e);
    }
  }

  static Future<bool> getBool(String key, {bool defaultValue = false}) async {
    try {
      final value = _prefs?.getBool(key) ?? defaultValue;
      Logger.storage('Bool retrieved: $key');
      return value;
    } catch (e) {
      Logger.error('Failed to retrieve bool: $key', e);
      return defaultValue;
    }
  }

  static Future<void> setInt(String key, int value) async {
    try {
      await _prefs?.setInt(key, value);
      Logger.storage('Int saved: $key');
    } catch (e) {
      Logger.error('Failed to save int: $key', e);
    }
  }

  static Future<int> getInt(String key, {int defaultValue = 0}) async {
    try {
      final value = _prefs?.getInt(key) ?? defaultValue;
      Logger.storage('Int retrieved: $key');
      return value;
    } catch (e) {
      Logger.error('Failed to retrieve int: $key', e);
      return defaultValue;
    }
  }

  static Future<void> setDouble(String key, double value) async {
    try {
      await _prefs?.setDouble(key, value);
      Logger.storage('Double saved: $key');
    } catch (e) {
      Logger.error('Failed to save double: $key', e);
    }
  }

  static Future<double> getDouble(String key, {double defaultValue = 0.0}) async {
    try {
      final value = _prefs?.getDouble(key) ?? defaultValue;
      Logger.storage('Double retrieved: $key');
      return value;
    } catch (e) {
      Logger.error('Failed to retrieve double: $key', e);
      return defaultValue;
    }
  }

  static Future<void> setStringList(String key, List<String> value) async {
    try {
      await _prefs?.setStringList(key, value);
      Logger.storage('String list saved: $key');
    } catch (e) {
      Logger.error('Failed to save string list: $key', e);
    }
  }

  static Future<List<String>> getStringList(String key) async {
    try {
      final value = _prefs?.getStringList(key) ?? [];
      Logger.storage('String list retrieved: $key');
      return value;
    } catch (e) {
      Logger.error('Failed to retrieve string list: $key', e);
      return [];
    }
  }

  // Remove methods
  static Future<void> remove(String key) async {
    try {
      await _prefs?.remove(key);
      await _secureStorage.delete(key: key);
      Logger.storage('Key removed: $key');
    } catch (e) {
      Logger.error('Failed to remove key: $key', e);
    }
  }

  static Future<void> clearAll() async {
    try {
      await _prefs?.clear();
      await _secureStorage.deleteAll();
      Logger.storage('All storage cleared');
    } catch (e) {
      Logger.error('Failed to clear storage', e);
    }
  }

  // Check if key exists
  static Future<bool> containsKey(String key) async {
    try {
      final exists = _prefs?.containsKey(key) ?? false;
      final secureExists = await _secureStorage.containsKey(key: key);
      Logger.storage('Key exists check: $key (${exists || secureExists})');
      return exists || secureExists;
    } catch (e) {
      Logger.error('Failed to check key existence: $key', e);
      return false;
    }
  }

  // Get all keys
  static Future<Set<String>> getKeys() async {
    try {
      final prefsKeys = _prefs?.getKeys() ?? <String>{};
      Logger.storage('Retrieved ${prefsKeys.length} keys from preferences');
      return prefsKeys;
    } catch (e) {
      Logger.error('Failed to get keys', e);
      return <String>{};
    }
  }
}
