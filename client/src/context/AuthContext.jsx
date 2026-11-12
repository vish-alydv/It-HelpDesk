import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('helpdesk_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('helpdesk_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          if (res.data?.user) {
            // Merge verified info
            setUser((prev) => {
              const updated = { ...prev, ...res.data.user };
              localStorage.setItem('helpdesk_user', JSON.stringify(updated));
              return updated;
            });
          }
        } catch (err) {
          console.warn('Session verification failed:', err);
          logout();
        }
      }
      setLoading(false);
    }
    verifyAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.token && res.data?.user) {
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('helpdesk_token', newToken);
      localStorage.setItem('helpdesk_user', JSON.stringify(newUser));
      return newUser;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data?.user_id) {
      // Auto-login after registration
      return await login(userData.email, userData.password);
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('helpdesk_token');
    localStorage.removeItem('helpdesk_user');
  };

  const isAdmin = user?.role_id === 5 || user?.role_name === 'Administrator';
  const isManager = user?.role_id === 4 || user?.role_name === 'IT Manager';
  const isTechnician = user?.role_id === 3 || user?.role_name === 'Technician';
  const isHelpdeskAgent = user?.role_id === 2 || user?.role_name === 'Helpdesk Agent';
  const isEmployee = user?.role_id === 1 || user?.role_name === 'Employee';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAdmin,
        isManager,
        isTechnician,
        isHelpdeskAgent,
        isEmployee
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
