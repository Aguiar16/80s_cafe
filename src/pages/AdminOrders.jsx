import React, { useState, useEffect } from 'react';
import './AdminOrders.css';

const AdminOrders = ({ onNavigateToHome }) => {
  // Mock data - substituir por API no futuro
  // Função para obter pedidos (mock, substituir por API futuramente)
  const getInitialOrders = () => ([
    {
      id: '#001',
      customerName: 'João Silva',
      date: '2025-07-16',
      time: '14:30',
      items: [
        {
          name: 'DeLorean Express',
          customizations: ['Leite de Amêndoa', 'Sem Açúcar', 'Canela'],
          price: 14.50
        }
      ],
      total: 14.50,
      status: 'fazendo'
    },
    {
      id: '#002',
      customerName: 'Maria Santos',
      date: '2025-07-16',
      time: '14:45',
      items: [
        {
          name: 'Chá de Neon',
          customizations: ['Mel', 'Limão'],
          price: 9.50
        },
        {
          name: 'Sonho de Verão',
          customizations: ['Chantilly'],
          price: 12.50
        }
      ],
      total: 22.00,
      status: 'pendente'
    },
    {
      id: '#003',
      customerName: 'Pedro Costa',
      date: '2025-07-16',
      time: '15:00',
      items: [
        {
          name: 'DeLorean Express',
          customizations: ['Dose Extra'],
          price: 15.00
        }
      ],
      total: 15.00,
      status: 'completo'
    },
    {
      id: '#004',
      customerName: 'Ana Oliveira',
      date: '2025-07-16',
      time: '15:15',
      items: [
        {
          name: 'Sonho de Verão',
          customizations: ['Marshmallows', 'Chocolate 70%'],
          price: 15.80
        }
      ],
      total: 15.80,
      status: 'entregue'
    },
    {
      id: '#005',
      customerName: 'Carlos Lima',
      date: '2025-07-16',
      time: '15:30',
      items: [
        {
          name: 'DeLorean Express',
          customizations: ['Leite Integral'],
          price: 12.00
        }
      ],
      total: 12.00,
      status: 'cancelado'
    }
  ]);

  const [orders, setOrders] = useState(getInitialOrders());

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('todos');

  const updateOrderStatus = (orderId, newStatus) => {
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
            <button className="reload-btn" onClick={() => setOrders(getInitialOrders())} title="Recarregar pedidos">
              <span className="reload-icon">🔄</span> RECARREGAR
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
          {/* Orders List */}
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
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="admin-item-detail">
                        <div className="admin-item-name">{item.name}</div>
                        {item.customizations.length > 0 && (
                          <div className="admin-item-customizations">
                            <span className="admin-customizations-label">Personalizações:</span>
                            <div className="admin-customizations-list">
                              {item.customizations.map((customization, idx) => (
                                <span key={idx} className="admin-customization-tag">
                                  {customization}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="admin-item-price">R$ {item.price.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="admin-order-total-detail">
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
                        >
                          ➡️ Avançar para {getStatusText(getNextStatus(selectedOrder.status))}
                        </button>
                      )}
                      {canCancel(selectedOrder.status) && (
                        <button 
                          className="status-btn cancel"
                          onClick={() => updateOrderStatus(selectedOrder.id, 'cancelado')}
                        >
                          ❌ Cancelar Pedido
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
