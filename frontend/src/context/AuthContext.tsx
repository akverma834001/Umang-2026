import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

interface AdminUser {
  username: string;
  role: string;
  email?: string;
}

interface AuthContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('sbu_admin_token');
    if (token) {
      api.getMe()
        .then((data: any) => {
          setAdmin(data);
        })
        .catch(() => {
          localStorage.removeItem('sbu_admin_token');
          setAdmin(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    const res = await api.login(credentials);
    localStorage.setItem('sbu_admin_token', res.access_token);
    setAdmin({
      username: res.username,
      role: res.role,
    });
  };

  const logout = () => {
    api.logout().catch(() => {});
    localStorage.removeItem('sbu_admin_token');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, isAuthenticated: !!admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
