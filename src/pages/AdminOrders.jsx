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
            customizations: order.observacoes ? [order.observacoes] : [],
            price: order.total_final || order.total
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
      case 'em_preparo':
        return 'fazendo';
      case 'pronto':
        return 'completo';
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
        // Chamar a API para avançar o estado do pedido
        await orderService.advanceOrderStatus(numericId);
        
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
        return 'fazendo';
      case 'fazendo':
        return 'completo';
      case 'completo':
        return 'entregue';
      default:
        return null;
    }
  };

  const canAdvance = (status) => {
    return ['pendente', 'fazendo', 'completo'].includes(status);
  };

  const canCancel = (status) => {
    return ['pendente', 'fazendo', 'completo'].includes(status);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente':
        return 'var(--neon-pink)';
      case 'fazendo':
        return 'var(--neon-yellow)';
      case 'completo':
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
      case 'fazendo':
        return 'PREPARANDO';
      case 'completo':
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
      case 'fazendo':
        return '⏳';
      case 'completo':
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
      fazendo: orders.filter(o => o.status === 'fazendo').length,
      completo: orders.filter(o => o.status === 'completo').length,
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
              className={`filter-btn ${filterStatus === 'fazendo' ? 'active' : ''}`}
              onClick={() => setFilterStatus('fazendo')}
            >
              Preparando ({orderCounts.fazendo})
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'completo' ? 'active' : ''}`}
              onClick={() => setFilterStatus('completo')}
            >
              Prontos ({orderCounts.completo})
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
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="admin-order-header">
                    <div className="order-id-customer">
                      <span className="admin-order-id">Pedido {order.id}</span>
                      <span className="customer-name">{order.customerName}</span>
                    </div>

                  </div>
                  
                  <div className="admin-order-time">{order.date} às {order.time}</div>
                  
                  <div className="admin-order-items">
                    {order.items.map((item, index) => (
                      <span key={index} className="admin-item-preview">
                        {item.name}
                        {index < order.items.length - 1 && ', '}
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
                    <h5 className="admin-items-title">Informações do Pedido:</h5>
                    <div className="admin-item-detail">
                      <div className="admin-item-name">Total de itens: {selectedOrder.originalApiData?.itens_count || 'N/A'}</div>
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
