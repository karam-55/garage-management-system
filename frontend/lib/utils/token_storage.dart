import 'package:shared_preferences/shared_preferences.dart';

class TokenStorage {
  static const _tokenKey = 'auth_token';

  static String? _cachedToken;

  static void setToken(String token) {
    _cachedToken = token;
    SharedPreferences.getInstance().then((prefs) => prefs.setString(_tokenKey, token));
  }

  static String? getToken() => _cachedToken;

  static Future<String?> loadToken() async {
    if (_cachedToken != null) return _cachedToken;
    final prefs = await SharedPreferences.getInstance();
    _cachedToken = prefs.getString(_tokenKey);
    return _cachedToken;
  }

  static Future<void> clearToken() async {
    _cachedToken = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
  }
}
