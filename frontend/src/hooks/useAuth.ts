import { useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Перевірити токен через API
          const profile = await authService.getProfile();
          setUser(profile.user || profile);
          setIsAuthenticated(true);
        } catch (error) {
          // Токен невалідний або застарілий
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login({ username, password });
      localStorage.setItem('token', response.token);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error: any) {
      console.error('[useAuth] Login failed:', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    // Видалити токен
    localStorage.removeItem('token');
    // Опціонально: видалити збережені дані для входу (для безпеки)
    // localStorage.removeItem('admin_remembered_username');
    // localStorage.removeItem('admin_remembered_password');
    // localStorage.removeItem('admin_remember_me');
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
  };
};

