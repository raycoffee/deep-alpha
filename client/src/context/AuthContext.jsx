import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const checkAuth = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/auth/me', {
        withCredentials: true
      });
      
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };


  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email,
        password
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        setUser(response.data.user);
        setError(null);
      }
      return response.data;
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed');
      throw error;
    }
  };


  const register = async (name, email, password) => {
    try {
      const response = await axios.post('http://localhost:3001/api/auth/register', {
        name,
        email,
        password
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        setUser(response.data.user);
        setError(null);
      }
      return response.data;
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed');
      throw error;
    }
  };


  const logout = async () => {
    try {
      await axios.post('http://localhost:3001/api/auth/logout', {}, {
        withCredentials: true
      });
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Logout failed:', error);
      setError(error.response?.data?.error || 'Logout failed');
    }
  };


  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      register,
      logout,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};