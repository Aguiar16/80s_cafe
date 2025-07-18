// Hook personalizado para gerenciar estado de autenticação
import { useState, useEffect } from 'react';
import { authService } from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      const hasToken = authService.isAuthenticated();
      const currentUser = authService.getCurrentUser();
      
      if (!hasToken) {
        // Não há token, usuário não está logado
        setIsLoggedIn(false);
        setUser(null);
        setLoading(false);
        return { isAuthenticated: false, currentUser: null };
      }

      // Verificar se o token é válido fazendo uma requisição para o perfil
      try {
        const profileData = await authService.getProfile();
        
        // Token válido, atualizar dados do usuário
        if (profileData) {
          const updatedUser = { ...currentUser, ...profileData };
          authService.updateUserData(updatedUser);
          setUser(updatedUser);
          setIsLoggedIn(true);
        }
        
        return { isAuthenticated: true, currentUser: profileData || currentUser };
      } catch (tokenError) {
        // Token inválido ou expirado
        console.warn('Token inválido ou expirado, fazendo logout automático:', tokenError);
        authService.logout();
        setIsLoggedIn(false);
        setUser(null);
        return { isAuthenticated: false, currentUser: null };
      }
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
    // Verificação inicial assíncrona
    const initialCheck = async () => {
      await checkAuthStatus();
    };
    
    initialCheck();
    
    // Verificar periodicamente se o status mudou (ex: login/logout em outra aba)
    // Usar intervalo menor para verificações subsequentes (sem requisição HTTP)
    const authCheckInterval = setInterval(async () => {
      const hasToken = authService.isAuthenticated();
      const currentUser = authService.getCurrentUser();
      
      // Verificação rápida apenas do localStorage
      if (!hasToken && isLoggedIn) {
        // Token foi removido, fazer logout
        setIsLoggedIn(false);
        setUser(null);
      } else if (hasToken && !isLoggedIn) {
        // Token foi adicionado, verificar validade
        await checkAuthStatus();
      }
    }, 2000);
    
    // Listener para storage events (mudanças no localStorage)
    const handleStorageChange = async (e) => {
      if (e.key === 'authToken' || e.key === 'user') {
        await checkAuthStatus();
      }
    };
    
    // Listener para logout automático por token inválido
    const handleAuthLogout = (e) => {
      console.log('Logout automático detectado:', e.detail?.reason);
      setIsLoggedIn(false);
      setUser(null);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-logout', handleAuthLogout);
    
    return () => {
      clearInterval(authCheckInterval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-logout', handleAuthLogout);
    };
  }, [isLoggedIn]); // Adicionar isLoggedIn como dependência

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
