
import React, { useState, useEffect } from 'react';
import './CustomerOrders.css';
import { useAuth } from '../hooks/useAuth';
import { orderService } from '../services/api';

const CustomerOrders = ({ onNavigateToHome, onNavigateToMenu, onNavigateToLogin }) => {
  const { isLoggedIn, loading: authLoading } = useAuth();

  // Verificação de autenticação
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      // Redirecionar para login se não estiver autenticado
      if (onNavigateToLogin) {
        onNavigateToLogin();
      } else if (onNavigateToHome) {
        onNavigateToHome();
      }
    }
  }, [isLoggedIn, authLoading, onNavigateToLogin, onNavigateToHome]);

  // Estados para gerenciar pedidos
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);

  // Filtros para a API
  const [filters, setFilters] = useState({
    status: undefined,
    skip: 0,
    limit: 100
  });

  // Função para carregar pedidos da API
  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderService.getOrders(filters);
      const formattedOrders = formatOrdersFromApi(response || []);
      setOrders(formattedOrders);
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err);
      setError('Erro ao carregar pedidos. Tente novamente.');
      // Em caso de erro, pode manter uma lista vazia ou dados de fallback
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Função para formatar data da API para exibição
  const formatOrderDate = (apiDate) => {
    try {
      const date = new Date(apiDate);
      if (isNaN(date.getTime())) {
        return { date: 'Data inválida', time: '--:--' };
      }
      return {
        date: date.toLocaleDateString('pt-BR'),
        time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return { date: 'Data inválida', time: '--:--' };
    }
  };

  // Função para obter tempo estimado baseado no status
  const getEstimatedTime = (status) => {
    switch (status) {
      case 'pendente':
        return 'Aguardando confirmação';
      case 'recebido':
      case 'em_preparo':
        return '15-20 min';
      case 'pronto':
        return 'Pronto para retirada';
      case 'entregue':
        return 'Entregue';
      case 'cancelado':
        return 'Cancelado';
      default:
        return 'Verificando...';
    }
  };

  // Função para mapear status da API para status interno
  const mapApiStatus = (apiStatus) => {
    const statusMap = {
      'pendente': 'pendente',
      'recebido': 'recebido',
      'em_preparo': 'em_preparo',
      'pronto': 'pronto',
      'entregue': 'entregue',
      'cancelado': 'cancelado'
    };
    return statusMap[apiStatus] || 'pendente';
  };

  // Função para formatar pedidos da API para o formato do componente
  const formatOrdersFromApi = (apiOrders) => {
    if (!Array.isArray(apiOrders)) {
      console.warn('Dados de pedidos inválidos recebidos da API:', apiOrders);
      return [];
    }

    return apiOrders.map(order => {
      try {
        const { date, time } = formatOrderDate(order.data_pedido);
        const internalStatus = mapApiStatus(order.status);
        
        return {
          id: `#${(order.id || 0).toString().padStart(3, '0')}`,
          date,
          time,
          items: [],
          total: order.total_final || order.total || 0,
          status: internalStatus,
          estimatedTime: getEstimatedTime(order.status),
          apiData: order // Manter dados originais da API para referência
        };
      } catch (error) {
        console.error('Erro ao formatar pedido:', error, order);
        // Retornar um pedido padrão em caso de erro
        return {
          id: '#000',
          date: 'Data inválida',
          time: '--:--',
          items: [],
          total: 0,
          status: 'pendente',
          estimatedTime: 'Erro',
          apiData: order
        };
      }
    });
  };

  // Carregar pedidos quando o componente montar ou os filtros mudarem
  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      loadOrders();
    }
  }, [isLoggedIn, authLoading, filters]);

  // Função para buscar detalhes de um pedido específico
  const fetchOrderDetails = async (orderId) => {
    const numericId = parseInt(orderId.replace('#', ''), 10);
    
    // Se já temos os detalhes deste pedido, não precisamos buscar novamente
    if (orderDetails[orderId]) {
      return orderDetails[orderId];
    }

    setLoadingOrderDetails(true);
    try {
      const details = await orderService.getOrderById(numericId);
      
      // Armazenar os detalhes no estado
      setOrderDetails(prev => ({
        ...prev,
        [orderId]: details
      }));
      
      return details;
    } catch (error) {
      console.error('Erro ao buscar detalhes do pedido:', error);
      setError('Erro ao carregar detalhes do pedido. Tente novamente.');
      return null;
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  // Função para obter os itens de um pedido (detalhados se disponíveis, senão placeholder)
  const getOrderItems = (order) => {
    const details = orderDetails[order.id];
    
    if (details && details.itens && details.itens.length > 0) {
      // Retorna os itens detalhados da API
      return details.itens.map(item => ({
        name: item.produto_nome || item.nome || 'Item',
        quantity: item.quantidade || 1,
        price: item.preco_unitario || item.preco || 0,
        total: (item.quantidade || 1) * (item.preco_unitario || item.preco || 0),
        customizations: item.personalizacoes || [],
        isPlaceholder: false
      }));
    }
    
    // Retorna o placeholder padrão
    return [{
      name: `${order.apiData?.itens_count || 0} ${order.apiData?.itens_count === 1 ? 'item' : 'itens'}`,
      isPlaceholder: true
    }];
  };

  // Função para atualizar filtros
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente':
        return 'var(--neon-orange, #ffb347)';
      case 'recebido':
        return 'var(--neon-blue, #4fc3f7)';
      case 'em_preparo':
        return 'var(--neon-yellow)';
      case 'pronto':
        return 'var(--neon-cyan)';
      case 'entregue':
        return 'var(--neon-green)';
      case 'cancelado':
        return 'var(--neon-red, #ff6b6b)';
      default:
        return 'var(--text-secondary)';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pendente':
        return 'PENDENTE';
      case 'recebido':
        return 'RECEBIDO';
      case 'em_preparo':
        return 'PREPARANDO';
      case 'pronto':
        return 'PRONTO';
      case 'entregue':
        return 'ENTREGUE';
      case 'cancelado':
        return 'CANCELADO';
      default:
        return 'DESCONHECIDO';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pendente':
        return '🕓';
      case 'recebido':
        return '📨';
      case 'em_preparo':
        return '⏳';
      case 'pronto':
        return '✅';
      case 'entregue':
        return '🎉';
      case 'cancelado':
        return '❌';
      default:
        return '❓';
    }
  };

  const handleRefresh = () => {
    loadOrders();
  };

  const handleBackToHome = () => {
    if (onNavigateToHome) {
      onNavigateToHome();
    }
  };

  const handleNewOrder = () => {
    if (onNavigateToMenu) {
      onNavigateToMenu();
    }
  };

  return (
    <div className="customer-orders-container">
      {/* Header */}
      <header className="orders-header">
        <div className="header-content">
          <button className="back-btn" onClick={handleBackToHome}>
            <span className="back-icon">←</span>
            INÍCIO
          </button>
          <div className="orders-logo">
            <span className="logo-text">MEUS PEDIDOS</span>
            <span className="logo-subtitle">HISTÓRICO & STATUS</span>
          </div>
          <div className="header-actions">
            <button className="refresh-btn" onClick={handleRefresh} disabled={loading}>
              <span className="refresh-icon">🔄</span>
              {loading ? 'CARREGANDO...' : 'ATUALIZAR'}
            </button>
            <button className="new-order-btn" onClick={handleNewOrder}>
              <span className="new-order-icon">+</span>
              NOVO PEDIDO
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="orders-main">
        <div className="orders-content">
          {/* Orders List */}
          <section className="orders-section">
            <h2 className="section-title">
              <span className="title-icon">📋</span>
              SEUS PEDIDOS
            </h2>
            
            <div className="orders-list">
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Carregando seus pedidos...</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <div className="error-icon">⚠️</div>
                  <p>{error}</p>
                  <button className="retry-btn" onClick={loadOrders}>
                    Tentar Novamente
                  </button>
                </div>
              ) : orders.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <p>Você ainda não fez nenhum pedido</p>
                  <button className="new-order-btn-inline" onClick={handleNewOrder}>
                    Fazer Primeiro Pedido
                  </button>
                </div>
              ) : (
                orders.map(order => (
                <div 
                  key={order.id} 
                  className={`order-card ${selectedOrder?.id === order.id ? 'selected' : ''}`}
                  onClick={async () => {
                    setSelectedOrder(order);
                    await fetchOrderDetails(order.id);
                  }}
                >
                  <div className="order-header">
                    <div className="order-id-date">
                      <span className="order-id">Pedido {order.id}</span>
                      <span className="order-date">{order.date} às {order.time}</span>
                    </div>
                    <div className="order-status" style={{ color: getStatusColor(order.status) }}>
                      <span className="status-icon">{getStatusIcon(order.status)}</span>
                      <span className="status-text">{getStatusText(order.status)}</span>
                    </div>
                  </div>
                  
                  <div className="order-items-preview">
                    {getOrderItems(order).map((item, index) => (
                      <span key={index} className="item-preview">
                        {item.isPlaceholder ? item.name : `${item.quantity}x ${item.name}`}
                        {index < getOrderItems(order).length - 1 && ', '}
                      </span>
                    ))}
                  </div>
                  
                  <div className="order-footer">
                    <span className="order-total">R$ {order.total.toFixed(2)}</span>
                    <span className="order-time">{order.estimatedTime}</span>
                  </div>
                </div>
              ))
              )}
            </div>
          </section>

          {/* Order Details Panel */}
          {selectedOrder && (
            <aside className="order-details">
              <div className="details-content">
                <div className="details-header">
                  <h3 className="details-title">DETALHES DO PEDIDO</h3>
                  <button className="close-details-btn" onClick={() => setSelectedOrder(null)} title="Fechar detalhes">×</button>
                </div>
                <div className="order-info">
                  <div className="order-summary">
                    <h4 className="summary-title">Pedido {selectedOrder.id}</h4>
                    <p className="summary-date">{selectedOrder.date} às {selectedOrder.time}</p>
                    <div className="summary-status" style={{ color: getStatusColor(selectedOrder.status) }}>
                      <span className="status-icon-large">{getStatusIcon(selectedOrder.status)}</span>
                      <div className="status-info">
                        <span className="status-text-large">{getStatusText(selectedOrder.status)}</span>
                        <span className="status-time">{selectedOrder.estimatedTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="order-items-detail">
                    <h5 className="items-title">Itens do Pedido:</h5>
                    {loadingOrderDetails ? (
                      <div className="loading-items">
                        <span>🔄 Carregando itens...</span>
                      </div>
                    ) : (
                      <div className="items-list">
                        {getOrderItems(selectedOrder).map((item, index) => (
                          <div key={index} className="item-detail">
                            <div className="item-name">
                              {item.isPlaceholder ? (
                                `Total de itens: ${selectedOrder.apiData?.itens_count || 'N/A'}`
                              ) : (
                                <>
                                  <span className="item-quantity">{item.quantity}x</span>
                                  <span className="item-name-text">{item.name}</span>
                                  <span className="item-price">R$ {item.total.toFixed(2)}</span>
                                </>
                              )}
                            </div>
                            {!item.isPlaceholder && item.customizations && item.customizations.length > 0 && (
                              <div className="item-customizations">
                                <span className="customizations-label">Personalizações:</span>
                                <div className="customizations-list">
                                  {item.customizations.map((custom, customIndex) => (
                                    <span key={customIndex} className="customization-tag">
                                      {custom}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="order-additional-info">
                      {selectedOrder.apiData?.metodo_pagamento && (
                        <div className="info-item">
                          <span className="info-label">Método de pagamento:</span>
                          <span className="info-value">{selectedOrder.apiData.metodo_pagamento}</span>
                        </div>
                      )}
                      {selectedOrder.apiData?.tipo_desconto && selectedOrder.apiData.tipo_desconto !== 'nenhum' && (
                        <div className="info-item">
                          <span className="info-label">Desconto:</span>
                          <span className="info-value">{selectedOrder.apiData.tipo_desconto}</span>
                        </div>
                      )}
                      {selectedOrder.apiData?.observacoes && (
                        <div className="info-item">
                          <span className="info-label">Observações:</span>
                          <span className="info-value">{selectedOrder.apiData.observacoes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="order-total-detail">
                    {selectedOrder.apiData?.desconto > 0 && (
                      <div className="total-line subtotal">
                        <span className="total-label">Subtotal:</span>
                        <span className="total-value">R$ {selectedOrder.apiData.total.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedOrder.apiData?.desconto > 0 && (
                      <div className="total-line discount">
                        <span className="total-label">Desconto:</span>
                        <span className="total-value">- R$ {selectedOrder.apiData.desconto.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="total-line">
                      <span className="total-label">TOTAL:</span>
                      <span className="total-value">R$ {selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Etapas de progresso ajustadas para incluir todos os status */}
                  {(['pendente', 'recebido', 'em_preparo'].includes(selectedOrder.status)) && (
                    <div className="order-progress">
                      <h5 className="progress-title">Acompanhe seu pedido:</h5>
                      <div className="progress-steps">
                        <div className={`step${['pendente', 'recebido', 'em_preparo', 'pronto', 'entregue'].includes(selectedOrder.status) ? ' completed' : ''}`}>
                          <div className="step-icon">📋</div>
                          <div className="step-text">Pedido Enviado</div>
                        </div>
                        <div className={`step${['recebido', 'em_preparo', 'pronto', 'entregue'].includes(selectedOrder.status) ? ' completed' : selectedOrder.status === 'pendente' ? '' : ''}`}>
                          <div className="step-icon">📨</div>
                          <div className="step-text">Pedido Recebido</div>
                        </div>
                        <div className={`step${selectedOrder.status === 'em_preparo' ? ' active' : ['pronto', 'entregue'].includes(selectedOrder.status) ? ' completed' : ''}`}> 
                          <div className="step-icon">⏳</div>
                          <div className="step-text">Preparando</div>
                        </div>
                        <div className={`step${selectedOrder.status === 'pronto' ? ' active' : selectedOrder.status === 'entregue' ? ' completed' : ''}`}>
                          <div className="step-icon">🎯</div>
                          <div className="step-text">Pronto</div>
                        </div>
                        <div className={`step${selectedOrder.status === 'entregue' ? ' completed' : ''}`}>
                          <div className="step-icon">🎉</div>
                          <div className="step-text">Entregue</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* Background Effects */}
      <div className="orders-background">
        <div className="grid-pattern"></div>
        <div className="neon-effects">
          <div className="neon-circle neon-circle-1"></div>
          <div className="neon-circle neon-circle-2"></div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrders;
