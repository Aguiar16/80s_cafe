// Hook personalizado para gerenciar estado de autenticação
import { useState, useEffect } from 'react';
import { authService } from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = () => {
    try {
      const isAuthenticated = authService.isAuthenticated();
      const currentUser = authService.getCurrentUser();
      
      setIsLoggedIn(isAuthenticated);
      setUser(currentUser);
      
      return { isAuthenticated, currentUser };
    } catch (error) {
      console.error('Erro ao verificar status de autenticação:', error);
      setIsLoggedIn(false);
      setUser(null);
      return { isAuthenticated: false, currentUser: null };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Verificação inicial
    checkAuthStatus();
    
    // Verificar periodicamente se o status mudou (ex: login/logout em outra aba)
    const authCheckInterval = setInterval(checkAuthStatus, 2000);
    
    // Listener para storage events (mudanças no localStorage)
    const handleStorageChange = (e) => {
      if (e.key === 'authToken' || e.key === 'user') {
        checkAuthStatus();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(authCheckInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const logout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setUser(null);
    console.log('Logout realizado com sucesso');
  };

  const updateUser = (userData) => {
    const updatedUser = authService.updateUserData(userData);
    setUser(updatedUser);
  };

  return {
    user,
    isLoggedIn,
    loading,
    checkAuthStatus,
    logout,
    updateUser,
    isStaff: authService.isStaff(),
    isClient: authService.isClient()
  };
};

export default useAuth;
