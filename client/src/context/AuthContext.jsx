import React, { createContext, useContext, useState, useEffect } from 'react';
import adminApi from '../services/adminApi';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem('adminUser');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const profile = await adminApi.getProfile();
          if (profile) {
            setAdmin(profile);
            localStorage.setItem('adminUser', JSON.stringify(profile));
          }
        } catch (err) {
          if (err.response?.status === 401 || err.response?.status === 403) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (identifier, password) => {
    const email = (identifier || '').trim().toLowerCase();
    const pass = (password || '').trim();

    try {
      const res = await adminApi.login(email, pass);
      if (res && res.success && res.data?.token) {
        const { token: jwtToken, admin: adminData } = res.data;
        setToken(jwtToken);
        setAdmin(adminData);
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('adminUser', JSON.stringify(adminData));
        return { success: true };
      }
      return {
        success: false,
        message: res?.message || 'Authentication failed. Please check credentials.',
      };
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid email or password. Please try again.';
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await adminApi.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      setToken(null);
      setAdmin(null);
      localStorage.removeItem('token');
      localStorage.removeItem('adminUser');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        admin,
        user: admin,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
