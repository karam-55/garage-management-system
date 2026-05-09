import { useState, useEffect } from 'react';
import { authService, LoginCredentials, RegisterCredentials } from '@/lib/auth';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = authService.getToken();
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    authService.setToken(response.token);
    setUser(response.user);
    setIsAuthenticated(true);
    return response;
  };

  const register = async (credentials: RegisterCredentials) => {
    const response = await authService.register(credentials);
    authService.setToken(response.token);
    setUser(response.user);
    setIsAuthenticated(true);
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    loading,
    user,
    login,
    register,
    logout,
  };
}
