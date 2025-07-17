// API Service - Gerenciamento de chamadas para a API FastAPI
// Base URL da API (ajustar conforme ambiente)
const API_BASE_URL = 'http://localhost:8000';

// Configuração padrão para requisições
const defaultHeaders = {
  'Content-Type': 'application/json',
};

// Função auxiliar para fazer requisições
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: defaultHeaders,
    ...options,
  };

  // Adicionar token de autenticação se existir
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    
    // Verificar se a resposta é bem-sucedida
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
    }

    // Retornar dados JSON se houver conteúdo
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return response;
  } catch (error) {
    console.error('Erro na requisição API:', error);
    throw error;
  }
};

// ======================================
// SERVIÇOS DE AUTENTICAÇÃO
// ======================================

export const authService = {
  /**
   * Registrar novo usuário (cliente ou staff)
   * POST /auth/register
   */
  async cadastrar(userData) {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        nome: userData.nome,
        email: userData.email,
        senha: userData.senha,
        tipo_usuario: userData.tipo_usuario || 'cliente' // Default para cliente
      }),
    });

    // Salvar token se retornado
    if (response.access_token) {
      localStorage.setItem('authToken', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  },

  /**
   * Fazer login universal
   * POST /auth/login
   */
  async login(credentials) {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        identifier: credentials.email,
        senha: credentials.senha
      }),
    });

    // Salvar token e dados do usuário
    if (response.access_token) {
      localStorage.setItem('authToken', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  },

  /**
   * Obter informações do usuário logado
   * GET /auth/me
   */
  async getProfile() {
    return await apiRequest('/auth/me', {
      method: 'GET',
    });
  },

  /**
   * Verificar tipo de usuário
   * GET /auth/user-type
   */
  async getUserType() {
    return await apiRequest('/auth/user-type', {
      method: 'GET',
    });
  },

  /**
   * Renovar token JWT
   * POST /auth/refresh
   */
  async refreshToken() {
    return await apiRequest('/auth/refresh', {
      method: 'POST',
    });
  },

  /**
   * Fazer logout (limpar dados locais)
   */
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
  },

  /**
   * Verificar se o usuário está autenticado
   */
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },

  /**
   * Obter dados do usuário do localStorage
   */
  getCurrentUser() {
    const userString = localStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  },

  /**
   * Verificar se o usuário é staff
   */
  isStaff() {
    const user = this.getCurrentUser();
    return user && (user.tipo_usuario === 'staff' || user.is_staff === true);
  },

  /**
   * Verificar se o usuário é cliente
   */
  isClient() {
    const user = this.getCurrentUser();
    return user && (user.tipo_usuario === 'cliente' || user.is_client === true);
  },

  /**
   * Atualizar dados do usuário no localStorage
   */
  updateUserData(userData) {
    const currentUser = this.getCurrentUser() || {};
    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  }
};

// ======================================
// SERVIÇOS DE PRODUTOS
// ======================================

export const productService = {
  /**
   * Listar todas as bebidas
   * GET /bebidas/
   */
  async getBebidas() {
    return await apiRequest('/bebidas/', {
      method: 'GET',
    });
  },

  /**
   * Obter menu completo com bebidas e tipos
   * GET /bebidas/menu
   */
  async getBebidasMenu() {
    return await apiRequest('/bebidas/menu', {
      method: 'GET',
    });
  },

  /**
   * Obter detalhes de uma bebida específica
   * GET /bebidas/{id}
   */
  async getBebidaById(id) {
    return await apiRequest(`/bebidas/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Listar bebidas por tipo
   * GET /bebidas/types/{tipo}
   */
  async getBebidasByType(tipo) {
    return await apiRequest(`/bebidas/types/${tipo}`, {
      method: 'GET',
    });
  },

  /**
   * Obter todas as personalizações disponíveis
   * GET /personalizacoes
   */
  async getPersonalizacoes() {
    return await apiRequest('/personalizacoes', {
      method: 'GET',
    });
  },

  /**
   * Obter tipos de bebidas disponíveis
   * GET /bebidas/tipos/disponiveis
   */
  async getTiposBebida() {
    return await apiRequest('/bebidas/tipos/disponiveis', {
      method: 'GET',
    });
  }
};

// ======================================
// SERVIÇOS DE CARRINHO
// ======================================

export const cartService = {
  /**
   * Obter itens do carrinho
   * GET /carrinho
   */
  async getCart() {
    return await apiRequest('/carrinho', {
      method: 'GET',
    });
  },

  /**
   * Adicionar item ao carrinho
   * POST /carrinho
   */
  async addToCart(item) {
    return await apiRequest('/carrinho', {
      method: 'POST',
      body: JSON.stringify({
        bebida_id: item.bebida_id,
        quantidade: item.quantidade || 1,
        personalizacoes: item.personalizacoes || [],
        observacoes: item.observacoes || ''
      }),
    });
  },

  /**
   * Obter total do carrinho
   * GET /carrinho/total
   */
  async getCartTotal() {
    return await apiRequest('/carrinho/total', {
      method: 'GET',
    });
  },

  /**
   * Remover item do carrinho
   * DELETE /carrinho/{item_id}
   */
  async removeFromCart(itemId) {
    return await apiRequest(`/carrinho/${itemId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Limpar carrinho
   * DELETE /carrinho
   */
  async clearCart(clienteId) {
    return await apiRequest('/carrinho', {
      method: 'DELETE',
      body: JSON.stringify({
        cliente_id: clienteId
      }),
    });
  }
};

// ======================================
// SERVIÇOS DE PEDIDOS
// ======================================

export const orderService = {
  /**
   * Criar novo pedido
   * POST /orders/
   */
  async createOrder(orderData) {
    return await apiRequest('/pedidos', {
      method: 'POST',
      body: JSON.stringify({
        metodo_pagamento: orderData.metodoPagamento,
        tipo_desconto: orderData.tipoDesconto || 'nenhum',
        observacoes: orderData.observacoes || ''
      }),
    });
  },

  /**
   * Obter histórico de pedidos do usuário logado
   * GET /pedidos
   */
  async getOrders(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.status) {
      params.append('status', filters.status);
    }
    if (filters.skip !== undefined) {
      params.append('skip', filters.skip);
    }
    if (filters.limit !== undefined) {
      params.append('limit', filters.limit);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/pedidos?${queryString}` : '/pedidos';
    
    return await apiRequest(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Obter detalhes de um pedido específico
   * GET /pedidos/{id}
   */
  async getOrderById(id) {
    return await apiRequest(`/pedidos/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Processar pagamento de um pedido
   * POST /api/pedidos/{id}/pagamento
   */
  async processPayment(pedidoId, paymentData) {
    return await apiRequest(`/api/pedidos/${pedidoId}/pagamento`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }
};

// ======================================
// SERVIÇOS DE COZINHA (ADMIN)
// ======================================

export const kitchenService = {
  /**
   * Obter pedidos pendentes na cozinha
   * GET /kitchen/orders
   */
  async getPendingOrders() {
    return await apiRequest('/kitchen/orders', {
      method: 'GET',
    });
  },

  /**
   * Avançar status de um pedido
   * PUT /kitchen/orders/{id}/advance
   */
  async advanceOrderStatus(orderId) {
    return await apiRequest(`/kitchen/orders/${orderId}/advance`, {
      method: 'PUT',
    });
  },

  /**
   * Obter estatísticas da cozinha
   * GET /kitchen/statistics
   */
  async getStatistics() {
    return await apiRequest('/kitchen/statistics', {
      method: 'GET',
    });
  }
};

// ======================================
// UTILITÁRIOS
// ======================================

export const apiUtils = {
  /**
   * Configurar base URL da API
   */
  setBaseURL(url) {
    API_BASE_URL = url;
  },

  /**
   * Obter base URL atual
   */
  getBaseURL() {
    return API_BASE_URL;
  },

  /**
   * Tratar erros de API de forma padronizada
   */
  handleApiError(error) {
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      // Token expirado ou inválido
      authService.logout();
      return 'Sessão expirada. Faça login novamente.';
    }
    
    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      return 'Acesso negado. Você não tem permissão para esta ação.';
    }
    
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      return 'Recurso não encontrado.';
    }
    
    if (error.message.includes('422') || error.message.includes('Unprocessable Entity')) {
      return 'Dados inválidos. Verifique as informações e tente novamente.';
    }
    
    if (error.message.includes('409') || error.message.includes('Conflict')) {
      return 'Este email já está em uso. Tente fazer login ou use outro email.';
    }
    
    if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
      return 'Erro interno do servidor. Tente novamente mais tarde.';
    }
    
    // Erros específicos de validação
    if (error.message.toLowerCase().includes('email')) {
      return 'Email inválido ou já cadastrado.';
    }
    
    if (error.message.toLowerCase().includes('senha') || error.message.toLowerCase().includes('password')) {
      return 'Senha inválida ou muito fraca.';
    }
    
    if (error.message.toLowerCase().includes('credenciais') || error.message.toLowerCase().includes('credentials')) {
      return 'Email ou senha incorretos.';
    }
    
    return error.message || 'Erro desconhecido. Tente novamente.';
  },

  /**
   * Validar se a API está disponível
   */
  async checkApiHealth() {
    try {
      // Tentar primeiro o endpoint de health padrão
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        timeout: 5000
      });
      return response.ok;
    } catch (error) {
      try {
        // Fallback: tentar endpoint raiz
        const response = await fetch(`${API_BASE_URL}/`, {
          method: 'GET', 
          timeout: 5000
        });
        return response.ok;
      } catch (fallbackError) {
        console.warn('API indisponível:', fallbackError);
        return false;
      }
    }
  }
};

// Export default com todos os serviços
export default {
  auth: authService,
  products: productService,
  cart: cartService,
  orders: orderService,
  kitchen: kitchenService,
  utils: apiUtils
};
