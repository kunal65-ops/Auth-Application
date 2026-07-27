import React, { createContext, useContext, useState, useEffect } from 'react';
import { refreshApi, logoutApi } from '../api/authApi';
import { setMemoryToken } from '../api/axiosInstance';
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessTokenState] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const updateAccessToken = (token) => {
    setAccessTokenState(token);
    setMemoryToken(token);
  };
  const setAuth = (userData, token) => {
    setUser(userData);
    updateAccessToken(token);
    setIsAuthenticated(true);
    setIsLoading(false);
  };
  const logout = async () => {
    try {
      await logoutApi();
    } catch (err) {
    } finally {
      setUser(null);
      updateAccessToken(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    let isMounted = true;
    const initializeAuth = async () => {
      try {
        const response = await refreshApi();
        if (isMounted && response?.success && response?.data?.accessToken) {
          setUser(response.data.user);
          updateAccessToken(response.data.accessToken);
          setIsAuthenticated(true);
        } else if (isMounted) {
          setUser(null);
          updateAccessToken(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        if (isMounted) {
          setUser(null);
          updateAccessToken(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    initializeAuth();
    return () => {
      isMounted = false;
    };
  }, []);
  const value = {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    setAuth,
    setUser,
    setAccessToken: updateAccessToken,
    logout
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export default AuthContext;