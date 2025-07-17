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
   * Cadastrar novo cliente
   * POST /api/clientes/cadastro
   */
  async cadastrar(userData) {
    const response = await apiRequest('/api/clientes/cadastro', {
      method: 'POST',
      body: JSON.stringify({
        nome: userData.nome,
        email: userData.email,
        senha: userData.senha
      }),
    });

    // Salvar token se retornado
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  },

  /**
   * Fazer login
   * POST /api/clientes/login
   */
  async login(credentials) {
    const response = await apiRequest('/api/clientes/login', {
      method: 'POST',
      body: JSON.stringify({
        email: credentials.email,
        senha: credentials.senha
      }),
    });

    // Salvar token e dados do usuário
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  },

  /**
   * Obter dados do usuário logado
   * GET /api/clientes/me
   */
  async getProfile() {
    return await apiRequest('/api/clientes/me', {
      method: 'GET',
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
  }
};

// ======================================
// SERVIÇOS DE PRODUTOS
// ======================================

export const productService = {
  /**
   * Listar todas as bebidas
   * GET /products/
   */
  async getBebidas() {
    return await apiRequest('/products/', {
      method: 'GET',
    });
  },

  /**
   * Obter detalhes de uma bebida específica
   * GET /products/{id}
   */
  async getBebidaById(id) {
    return await apiRequest(`/products/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Listar bebidas por tipo
   * GET /products/types/{tipo}
   */
  async getBebidasByType(tipo) {
    return await apiRequest(`/products/types/${tipo}`, {
      method: 'GET',
    });
  },

  /**
   * Obter personalizações disponíveis para uma bebida
   * GET /products/{id}/personalizations
   */
  async getPersonalizacoes(bebidaId) {
    return await apiRequest(`/products/${bebidaId}/personalizations`, {
      method: 'GET',
    });
  },

  /**
   * Obter tipos de bebidas disponíveis
   * GET /api/produtos/tipos-bebida
   */
  async getTiposBebida() {
    return await apiRequest('/api/produtos/tipos-bebida', {
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
   * GET /cart/
   */
  async getCart() {
    return await apiRequest('/cart/', {
      method: 'GET',
    });
  },

  /**
   * Adicionar item ao carrinho
   * POST /cart/add
   */
  async addToCart(item) {
    return await apiRequest('/cart/add', {
      method: 'POST',
      body: JSON.stringify({
        bebida_id: item.bebidaId,
        quantidade: item.quantidade,
        personalizacoes: item.personalizacoes || []
      }),
    });
  },

  /**
   * Atualizar quantidade de um item
   * PUT /cart/item/{id}
   */
  async updateCartItem(itemId, quantidade) {
    return await apiRequest(`/cart/item/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantidade }),
    });
  },

  /**
   * Remover item do carrinho
   * DELETE /cart/item/{id}
   */
  async removeFromCart(itemId) {
    return await apiRequest(`/cart/item/${itemId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Limpar carrinho
   * DELETE /cart/clear
   */
  async clearCart() {
    return await apiRequest('/cart/clear', {
      method: 'DELETE',
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
    return await apiRequest('/orders/', {
      method: 'POST',
      body: JSON.stringify({
        metodo_pagamento: orderData.metodoPagamento,
        observacoes: orderData.observacoes || ''
      }),
    });
  },

  /**
   * Obter histórico de pedidos
   * GET /orders/
   */
  async getOrders() {
    return await apiRequest('/orders/', {
      method: 'GET',
    });
  },

  /**
   * Obter detalhes de um pedido específico
   * GET /orders/{id}
   */
  async getOrderById(id) {
    return await apiRequest(`/orders/${id}`, {
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
    if (error.message.includes('401')) {
      // Token expirado ou inválido
      authService.logout();
      window.location.href = '/login';
      return 'Sessão expirada. Faça login novamente.';
    }
    
    if (error.message.includes('403')) {
      return 'Acesso negado. Você não tem permissão para esta ação.';
    }
    
    if (error.message.includes('404')) {
      return 'Recurso não encontrado.';
    }
    
    if (error.message.includes('500')) {
      return 'Erro interno do servidor. Tente novamente mais tarde.';
    }
    
    return error.message || 'Erro desconhecido. Tente novamente.';
  },

  /**
   * Validar se a API está disponível
   */
  async checkApiHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      return false;
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
