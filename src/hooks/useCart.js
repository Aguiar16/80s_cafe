import { useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/api';

export const useCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carregar itens do carrinho
  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar se o usuário está logado
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('Usuário não está logado, carrinho vazio');
        setCartItems([]);
        setCartTotal(0);
        return;
      }
      
      const cartResponse = await cartService.getCart();
      console.log('Cart response:', cartResponse); // Debug
      
      // Usar a estrutura de resposta do backend
      setCartItems(cartResponse?.itens || []);
      setCartTotal(cartResponse?.total_valor || 0);
    } catch (err) {
      console.error('Erro ao carregar carrinho:', err);
      setError('Erro ao carregar carrinho: ' + (err.message || 'Erro desconhecido'));
      // Set valores padrão em caso de erro
      setCartItems([]);
      setCartTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Adicionar item ao carrinho
  const addToCart = async (drink, customizations, quantity = 1, observacoes = '') => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar se o usuário está logado
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Faça login para adicionar itens ao carrinho');
        return false;
      }
      
      const item = {
        bebida_id: drink.id,
        quantidade: quantity,
        personalizacoes: customizations.map(c => c.id),
        observacoes: observacoes
      };

      console.log('Enviando item para carrinho:', item); // Debug
      await cartService.addToCart(item);
      await loadCart(); // Recarregar carrinho após adicionar
      
      return true;
    } catch (err) {
      console.error('Erro ao adicionar ao carrinho:', err);
      setError('Erro ao adicionar item ao carrinho: ' + (err.message || 'Erro desconhecido'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remover item do carrinho
  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      setError(null);
      
      await cartService.removeFromCart(itemId);
      await loadCart(); // Recarregar carrinho após remover
      
      return true;
    } catch (err) {
      console.error('Erro ao remover do carrinho:', err);
      setError('Erro ao remover item do carrinho');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Limpar carrinho
  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await cartService.clearCart(user.id);
      await loadCart(); // Recarregar carrinho após limpar
      
      return true;
    } catch (err) {
      console.error('Erro ao limpar carrinho:', err);
      setError('Erro ao limpar carrinho');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Calcular total local (para feedback imediato)
  const calculateLocalTotal = (items) => {
    return items.reduce((total, item) => {
      // Usar subtotal se disponível, senão calcular
      return total + (item.subtotal || 
        ((item.preco_unitario || 0) * (item.quantidade || 1)));
    }, 0);
  };

  // Carregar carrinho ao inicializar
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  return {
    cartItems,
    cartTotal,
    loading,
    error,
    addToCart,
    removeFromCart,
    clearCart,
    loadCart,
    calculateLocalTotal,
    itemCount: cartItems.length,
    totalItems: cartItems.reduce((sum, item) => sum + (item.quantidade || 0), 0)
  };
};