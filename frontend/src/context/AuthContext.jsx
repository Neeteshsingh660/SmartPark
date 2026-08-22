import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { websocketService } from '../services/websocketService';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('smartpark_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [token, setToken] = useState(() => localStorage.getItem('smartpark_token') || null);
  const [activeRole, setActiveRole] = useState(() => user?.role || 'DRIVER');

  const { addToast } = useToast();

  useEffect(() => {
    if (user?.role) {
      setActiveRole(user.role);
    }
  }, [user]);

  // Connect WebSocket when user is logged in
  useEffect(() => {
    if (token && user?.email) {
      websocketService.connect();
      websocketService.subscribeUser(user.role, user.email, (notification) => {
        addToast(notification.message || 'New notification received', 'realtime');
        window.dispatchEvent(new CustomEvent('smartpark_notification', { detail: notification }));
      });
    }

    return () => {
      // Cleanup on unmount or user change
    };
  }, [token, user, addToast]);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.success && res.data) {
      const { token: jwtToken, userId, name, role } = res.data;
      const userData = { userId, name, email, role };
      
      localStorage.setItem('smartpark_token', jwtToken);
      localStorage.setItem('smartpark_user', JSON.stringify(userData));

      setToken(jwtToken);
      setUser(userData);
      setActiveRole(role);

      addToast(`Welcome back, ${name}! Logged in as ${role}.`, 'success');
      return res.data;
    }
  };

  const register = async (registerData) => {
    const res = await authService.register(registerData);
    if (res.success && res.data) {
      const { token: jwtToken, userId, name, email, role } = res.data;
      const userData = { userId, name, email, role };

      localStorage.setItem('smartpark_token', jwtToken);
      localStorage.setItem('smartpark_user', JSON.stringify(userData));

      setToken(jwtToken);
      setUser(userData);
      setActiveRole(role);

      addToast(`Account created successfully! Welcome, ${name}.`, 'success');
      return res.data;
    }
  };

  const sendOtp = async (email) => {
    const res = await authService.sendOtp(email);
    addToast(res.message || `OTP sent to ${email}`, 'info');
    return res;
  };

  const logout = () => {
    localStorage.removeItem('smartpark_token');
    localStorage.removeItem('smartpark_user');
    setToken(null);
    setUser(null);
    websocketService.disconnect();
    addToast('Logged out successfully', 'info');
    setTimeout(() => {
      window.location.href = '/';
    }, 400);
  };

  const switchRole = (newRole) => {
    setActiveRole(newRole);
    addToast(`Switched active view to ${newRole}`, 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        activeRole,
        login,
        register,
        sendOtp,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
