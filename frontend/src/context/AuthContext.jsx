import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getSocket } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [lawyerProfile, setLawyerProfile] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('lawshield_token'));
  const [loading, setLoading] = useState(true);
  const [activeSOS, setActiveSOS] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((curr) => (curr && curr.id === curr?.id ? null : curr));
    }, 4500);
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setLawyerProfile(res.data.lawyerProfile || null);
        const socket = getSocket();
        socket.emit('user-online', res.data.user._id);
      }
    } catch (err) {
      console.warn('Session expired or offline token');
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      // Auto-login as demo citizen so the user is never greeted with a blank / blocked screen!
      demoLogin('citizen');
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('lawshield_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        showToast(`Welcome back, ${res.data.user.name}!`, 'success');
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data.success) {
        localStorage.setItem('lawshield_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        showToast('Registration successful! Welcome to LawShield.', 'success');
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const demoLogin = async (persona) => {
    try {
      const res = await api.post('/auth/demo-login', { persona });
      if (res.data.success) {
        localStorage.setItem('lawshield_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        const socket = getSocket();
        socket.emit('user-online', res.data.user._id);
        showToast(`Switched to Demo Persona: ${res.data.user.name} (${res.data.user.role.toUpperCase()})`, 'info');
        setLoading(false);
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      console.error('Demo login failed', err);
      // Fallback offline preset if backend has not loaded yet
      const fallbackUser = {
        _id: persona === 'lawyer' ? 'usr_demo_lawyer_001' : persona === 'admin' ? 'usr_demo_admin_001' : persona === 'teacher' ? 'usr_demo_teacher_001' : 'usr_demo_citizen_001',
        name: persona === 'lawyer' ? 'Adv. Rajesh Verma' : persona === 'admin' ? 'Meera Nair' : persona === 'teacher' ? 'Prof. Vivek Sharma' : 'Ananya Sharma',
        email: persona === 'lawyer' ? 'lawyer@lawshield.org' : persona === 'admin' ? 'admin@lawshield.org' : persona === 'teacher' ? 'teacher@lawshield.org' : 'citizen@lawshield.org',
        role: persona,
        phone: '+91 98765 43210',
        emergencyContacts: [],
      };
      setUser(fallbackUser);
      setLoading(false);
      return { success: true, user: fallbackUser };
    }
  };

  const logout = () => {
    localStorage.removeItem('lawshield_token');
    setToken(null);
    setUser(null);
    setLawyerProfile(null);
    showToast('Logged out safely', 'info');
  };

  const updateProfile = async (data) => {
    try {
      const res = await api.put('/auth/profile', data);
      if (res.data.success) {
        setUser(res.data.user);
        showToast('Profile updated', 'success');
        return { success: true };
      }
    } catch (err) {
      showToast('Profile update failed', 'error');
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        lawyerProfile,
        token,
        loading,
        activeSOS,
        setActiveSOS,
        login,
        register,
        demoLogin,
        logout,
        updateProfile,
        showToast,
        toast,
        setToast,
      }}
    >
      {children}
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 border text-sm font-medium ${
              toast.type === 'error'
                ? 'bg-red-950/90 border-red-500/50 text-red-200'
                : toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : 'bg-slate-900/90 border-blue-500/50 text-blue-200'
            } backdrop-blur-md`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white text-xs ml-2 font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
