import React, { useState, useEffect } from 'react';
import './AdminOrders.css';
import { useAuth } from '../hooks/useAuth';
import { authService, kitchenService, orderService } from '../services/api';

const AdminOrders = ({ onNavigateToHome, onNavigateToLogin }) => {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('todos');
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [advancingOrderId, setAdvancingOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);

  // Verificação de autenticação e permissão
  useEffect(() => {
    if (!authLoading) {
      if (!isLoggedIn) {
        // Redirecionar para login se não estiver autenticado
        if (onNavigateToLogin) {
          onNavigateToLogin();
        } else if (onNavigateToHome) {
          onNavigateToHome();
        }
      } else if (!authService.isStaff()) {
        // Redirecionar para home se não for staff/admin
        if (onNavigateToHome) {
          onNavigateToHome();
        }
      }
    }
  }, [isLoggedIn, authLoading, onNavigateToLogin, onNavigateToHome]);



  // Função para buscar pedidos da API
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await kitchenService.getKitchenOrders();
      
      // Transformar dados da API para o formato esperado pelo componente
      const transformedOrders = response.map(order => ({
        id: `#${order.id.toString().padStart(3, '0')}`,
        customerName: order.cliente_nome,
        date: new Date(order.data_pedido).toLocaleDateString('pt-BR'),
        time: new Date(order.data_pedido).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        items: [
          {
            name: `${order.itens_count} itens`,
            price: order.total_final || order.total,
            isPlaceholder: true // Indica que este é apenas um placeholder
          }
        ],
        total: order.total_final || order.total,
        status: mapApiStatusToLocalStatus(order.status),
        originalApiData: order,
        metodoPagamento: order.metodo_pagamento,
        desconto: order.desconto,
        observacoes: order.observacoes
      }));
      
      setOrders(transformedOrders);
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
      setError('Erro ao carregar pedidos. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para mapear status da API para status local
  const mapApiStatusToLocalStatus = (apiStatus) => {
    switch (apiStatus) {
      case 'pendente':
        return 'pendente';
      case 'recebido':
        return 'recebido';
      case 'em_preparo':
        return 'em_preparo';
      case 'pronto':
        return 'pronto';
      case 'entregue':
        return 'entregue';
      case 'cancelado':
        return 'cancelado';
      default:
        return 'pendente';
    }
  };

  // Carregar pedidos quando o componente monta e a autenticação está carregada
  useEffect(() => {
    if (!authLoading && isLoggedIn && authService.isStaff()) {
      fetchOrders();
    }
  }, [isLoggedIn, authLoading]);

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
    return order.items;
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    // Extrair o ID numérico do pedido (remover o # e zeros à esquerda)
    const numericId = parseInt(orderId.replace('#', ''), 10);
    
    // Se for cancelamento, usar a API DELETE
    if (newStatus === 'cancelado') {
      setCancellingOrderId(orderId);
      try {
        // Chamar a API para cancelar o pedido
        await orderService.cancelOrder(numericId);
        
        // Atualizar o estado local após sucesso da API
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, status: newStatus }
              : order
          )
        );

        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        }
        
        // Recarregar os pedidos para sincronizar com o servidor
        await fetchOrders();
        
      } catch (error) {
        console.error('Erro ao cancelar pedido:', error);
        setError('Erro ao cancelar pedido. Tente novamente.');
      } finally {
        setCancellingOrderId(null);
      }
    } else {
      // Para avançar status, usar a API POST /pedidos/{pedido_id}/avancar-estado
      setAdvancingOrderId(orderId);
      try {
        // Log para debug
        console.log('Avançando status do pedido:', { orderId, numericId, newStatus });
        
        // Chamar a API para avançar o estado do pedido
        await kitchenService.advanceOrderStatus(numericId);
        
        // Recarregar os pedidos para sincronizar com o servidor
        await fetchOrders();
        
        // Atualizar o pedido selecionado se for o mesmo que foi alterado
        if (selectedOrder?.id === orderId) {
          const updatedOrder = orders.find(order => order.id === orderId);
          if (updatedOrder) {
            setSelectedOrder({ ...updatedOrder, status: newStatus });
          }
        }
        
      } catch (error) {
        console.error('Erro ao avançar status do pedido:', error);
        setError('Erro ao avançar status do pedido. Tente novamente.');
      } finally {
        setAdvancingOrderId(null);
      }
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'pendente':
        return 'recebido';
      case 'recebido':
        return 'em_preparo';
      case 'em_preparo':
        return 'pronto';
      case 'pronto':
        return 'entregue';
      default:
        return null;
    }
  };

  const canAdvance = (status) => {
    return ['pendente', 'recebido', 'em_preparo', 'pronto'].includes(status);
  };

  const canCancel = (status) => {
    return ['pendente', 'recebido', 'em_preparo', 'pronto'].includes(status);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente':
        return 'var(--neon-pink)';
      case 'recebido':
        return 'var(--neon-blue)';
      case 'em_preparo':
        return 'var(--neon-yellow)';
      case 'pronto':
        return 'var(--neon-cyan)';
      case 'entregue':
        return 'var(--neon-green)';
      case 'cancelado':
        return 'var(--text-secondary)';
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
        return '📋';
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



  const filteredOrders = orders.filter(order => 
    filterStatus === 'todos' || order.status === filterStatus
  );

  const getOrderCounts = () => {
    return {
      todos: orders.length,
      pendente: orders.filter(o => o.status === 'pendente').length,
      recebido: orders.filter(o => o.status === 'recebido').length,
      em_preparo: orders.filter(o => o.status === 'em_preparo').length,
      pronto: orders.filter(o => o.status === 'pronto').length,
      entregue: orders.filter(o => o.status === 'entregue').length,
      cancelado: orders.filter(o => o.status === 'cancelado').length
    };
  };

  const orderCounts = getOrderCounts();

  const handleBackToHome = () => {
    if (onNavigateToHome) {
      onNavigateToHome();
    }
  };

  return (
    <div className="admin-orders-container">
      {/* Header */}
      <header className="admin-header">
        <div className="header-content">
          <button className="back-btn" onClick={handleBackToHome}>
            <span className="back-icon">←</span>
            INÍCIO
          </button>
          <div className="admin-logo">
            <span className="logo-text">GESTÃO DE PEDIDOS</span>
            <span className="logo-subtitle">PAINEL ADMINISTRATIVO</span>
          </div>
          <div className="admin-stats">
            <span className="stat-item">
              <span className="stat-label">Total:</span>
              <span className="stat-value">{orderCounts.todos}</span>
            </span>
            <button className="reload-btn" onClick={fetchOrders} title="Recarregar pedidos" disabled={loading}>
              <span className="reload-icon">🔄</span> {loading ? 'CARREGANDO...' : 'RECARREGAR'}
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <section className="filters-section">
        <div className="filters-content">
          <h3 className="filters-title">FILTROS:</h3>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filterStatus === 'todos' ? 'active' : ''}`}
              onClick={() => setFilterStatus('todos')}
            >
              Todos ({orderCounts.todos})
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'pendente' ? 'active' : ''}`}
              onClick={() => setFilterStatus('pendente')}
            >
              Pendentes ({orderCounts.pendente})
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'recebido' ? 'active' : ''}`}
              onClick={() => setFilterStatus('recebido')}
            >
              Recebidos ({orderCounts.recebido})
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'em_preparo' ? 'active' : ''}`}
              onClick={() => setFilterStatus('em_preparo')}
            >
              Preparando ({orderCounts.em_preparo})
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'pronto' ? 'active' : ''}`}
              onClick={() => setFilterStatus('pronto')}
            >
              Prontos ({orderCounts.pronto})
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'entregue' ? 'active' : ''}`}
              onClick={() => setFilterStatus('entregue')}
            >
              Entregues ({orderCounts.entregue})
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'cancelado' ? 'active' : ''}`}
              onClick={() => setFilterStatus('cancelado')}
            >
              Cancelados ({orderCounts.cancelado})
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-content">
          {/* Loading e Error States */}
          {loading && (
            <div className="admin-loading">
              <div className="loading-spinner">🔄</div>
              <p>Carregando pedidos...</p>
            </div>
          )}
          
          {error && !loading && (
            <div className="admin-error">
              <div className="error-icon">⚠️</div>
              <p>{error}</p>
              <button className="retry-btn" onClick={fetchOrders}>
                Tentar Novamente
              </button>
            </div>
          )}

          {/* Orders List */}
          {!loading && !error && (
            <section className="admin-orders-section">
            <div className="orders-grid">
              {filteredOrders.map(order => (
                <div 
                  key={order.id} 
                  className={`admin-order-card ${selectedOrder?.id === order.id ? 'selected' : ''}`}
                  onClick={async () => {
                    setSelectedOrder(order);
                    await fetchOrderDetails(order.id);
                  }}
                >
                  <div className="admin-order-header">
                    <div className="order-id-customer">
                      <span className="admin-order-id">Pedido {order.id}</span>
                      <span className="customer-name">{order.customerName}</span>
                    </div>

                  </div>
                  
                  <div className="admin-order-time">{order.date} às {order.time}</div>
                  
                  <div className="admin-order-items">
                    {getOrderItems(order).map((item, index) => (
                      <span key={index} className="admin-item-preview">
                        {item.isPlaceholder ? item.name : `${item.quantity}x ${item.name}`}
                        {index < getOrderItems(order).length - 1 && ', '}
                      </span>
                    ))}
                  </div>
                  
                  <div className="admin-order-footer">
                    <span className="admin-order-total">R$ {order.total.toFixed(2)}</span>
                    <div className="admin-order-status" style={{ color: getStatusColor(order.status) }}>
                      <span className="admin-status-icon">{getStatusIcon(order.status)}</span>
                      <span className="admin-status-text">{getStatusText(order.status)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          )}

          {/* Order Management Panel */}
          {selectedOrder && (
            <aside className="admin-order-details">
              <div className="admin-details-content">
                <h3 className="admin-details-title">GERENCIAR PEDIDO</h3>
                
                <div className="admin-order-info">
                  <div className="admin-order-summary">
                    <h4 className="admin-summary-title">Pedido {selectedOrder.id}</h4>
                    <p className="admin-customer-name">Cliente: {selectedOrder.customerName}</p>
                    <p className="admin-summary-date">{selectedOrder.date} às {selectedOrder.time}</p>
                    
                    <div className="current-status" style={{ color: getStatusColor(selectedOrder.status) }}>
                      <span className="current-status-icon">{getStatusIcon(selectedOrder.status)}</span>
                      <span className="current-status-text">{getStatusText(selectedOrder.status)}</span>
                    </div>
                  </div>

                  <div className="admin-order-items-detail">
                    <h5 className="admin-items-title">Itens do Pedido:</h5>
                    {loadingOrderDetails ? (
                      <div className="loading-items">
                        <span>🔄 Carregando itens...</span>
                      </div>
                    ) : (
                      <div className="items-list">
                        {getOrderItems(selectedOrder).map((item, index) => (
                          <div key={index} className="admin-item-detail">
                            <div className="admin-item-name">
                              {item.isPlaceholder ? (
                                `Total de itens: ${selectedOrder.originalApiData?.itens_count || 'N/A'}`
                              ) : (
                                <>
                                  <span className="item-quantity">{item.quantity}x</span>
                                  <span className="item-name">{item.name}</span>
                                  <span className="item-price">R$ {item.total.toFixed(2)}</span>
                                </>
                              )}
                            </div>
                            {!item.isPlaceholder && item.customizations && item.customizations.length > 0 && (
                              <div className="admin-item-customizations">
                                <span className="admin-customizations-label">Personalizações:</span>
                                <div className="admin-customizations-list">
                                  {item.customizations.map((custom, customIndex) => (
                                    <span key={customIndex} className="admin-customization-tag">
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
                      {selectedOrder.metodoPagamento && (
                        <div className="admin-item-name">Método de pagamento: {selectedOrder.metodoPagamento}</div>
                      )}
                      {selectedOrder.desconto > 0 && (
                        <div className="admin-item-name">Desconto: R$ {selectedOrder.desconto.toFixed(2)}</div>
                      )}
                      {selectedOrder.observacoes && (
                        <div className="admin-item-customizations">
                          <span className="admin-customizations-label">Observações:</span>
                          <div className="admin-customizations-list">
                            <span className="admin-customization-tag">
                              {selectedOrder.observacoes}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="admin-order-total-detail">
                    {selectedOrder.desconto > 0 && (
                      <div className="admin-total-line">
                        <span className="admin-total-label">SUBTOTAL:</span>
                        <span className="admin-total-value">R$ {(selectedOrder.originalApiData?.total || selectedOrder.total).toFixed(2)}</span>
                      </div>
                    )}
                    {selectedOrder.desconto > 0 && (
                      <div className="admin-total-line">
                        <span className="admin-total-label">DESCONTO:</span>
                        <span className="admin-total-value" style={{ color: 'var(--neon-green)' }}>- R$ {selectedOrder.desconto.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="admin-total-line">
                      <span className="admin-total-label">TOTAL:</span>
                      <span className="admin-total-value">R$ {selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="status-management">
                    <h5 className="status-management-title">Gerenciar Pedido:</h5>
                    <div className="status-buttons">
                      {canAdvance(selectedOrder.status) && (
                        <button 
                          className="status-btn advance"
                          onClick={() => updateOrderStatus(selectedOrder.id, getNextStatus(selectedOrder.status))}
                          disabled={advancingOrderId === selectedOrder.id}
                        >
                          {advancingOrderId === selectedOrder.id ? '⏳ Avançando...' : `➡️ Avançar para ${getStatusText(getNextStatus(selectedOrder.status))}`}
                        </button>
                      )}
                      {canCancel(selectedOrder.status) && (
                        <button 
                          className="status-btn cancel"
                          onClick={() => updateOrderStatus(selectedOrder.id, 'cancelado')}
                          disabled={cancellingOrderId === selectedOrder.id}
                        >
                          {cancellingOrderId === selectedOrder.id ? '⏳ Cancelando...' : '❌ Cancelar Pedido'}
                        </button>
                      )}
                      {selectedOrder.status === 'entregue' && (
                        <div className="status-completed">
                          <span className="completed-icon">🎉</span>
                          <span className="completed-text">Pedido Finalizado</span>
                        </div>
                      )}
                      {selectedOrder.status === 'cancelado' && (
                        <div className="status-cancelled">
                          <span className="cancelled-icon">❌</span>
                          <span className="cancelled-text">Pedido Cancelado</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* Background Effects */}
      <div className="admin-background">
        <div className="grid-pattern"></div>
        <div className="neon-effects">
          <div className="neon-circle neon-circle-1"></div>
          <div className="neon-circle neon-circle-2"></div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
