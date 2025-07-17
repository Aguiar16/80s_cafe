import React, { useState, useEffect } from 'react';
import './CustomerOrders.css';

const CustomerOrders = ({ onNavigateToHome, onNavigateToMenu }) => {
  // Mock data - substituir por API no futuro
  const [orders] = useState([
    {
      id: '#001',
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
      status: 'fazendo',
      estimatedTime: '15 min'
    },
    {
      id: '#002',
      date: '2025-07-15',
      time: '16:45',
      items: [
        {
          name: 'Chá de Neon',
          customizations: ['Mel', 'Limão'],
          price: 9.50
        },
        {
          name: 'Sonho de Verão',
          customizations: ['Chantilly', 'Marshmallows'],
          price: 14.30
        }
      ],
      total: 23.80,
      status: 'entregue',
      estimatedTime: 'Entregue'
    },
    {
      id: '#003',
      date: '2025-07-14',
      time: '10:15',
      items: [
        {
          name: 'DeLorean Express',
          customizations: ['Leite Integral', 'Açúcar Demerara'],
          price: 12.30
        }
      ],
      total: 12.30,
      status: 'completo',
      estimatedTime: 'Pronto para retirada'
    }
  ]);

  const [selectedOrder, setSelectedOrder] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'fazendo':
        return 'var(--neon-yellow)';
      case 'completo':
        return 'var(--neon-cyan)';
      case 'entregue':
        return 'var(--neon-green)';
      default:
        return 'var(--text-secondary)';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'fazendo':
        return 'PREPARANDO';
      case 'completo':
        return 'PRONTO';
      case 'entregue':
        return 'ENTREGUE';
      default:
        return 'DESCONHECIDO';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'fazendo':
        return '⏳';
      case 'completo':
        return '✅';
      case 'entregue':
        return '🎉';
      default:
        return '❓';
    }
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
          <button className="new-order-btn" onClick={handleNewOrder}>
            <span className="new-order-icon">+</span>
            NOVO PEDIDO
          </button>
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
              {orders.map(order => (
                <div 
                  key={order.id} 
                  className={`order-card ${selectedOrder?.id === order.id ? 'selected' : ''}`}
                  onClick={() => setSelectedOrder(order)}
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
                    {order.items.map((item, index) => (
                      <span key={index} className="item-preview">
                        {item.name}
                        {index < order.items.length - 1 && ', '}
                      </span>
                    ))}
                  </div>
                  
                  <div className="order-footer">
                    <span className="order-total">R$ {order.total.toFixed(2)}</span>
                    <span className="order-time">{order.estimatedTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Order Details Panel */}
          {selectedOrder && (
            <aside className="order-details">
              <div className="details-content">
                <h3 className="details-title">DETALHES DO PEDIDO</h3>
                
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
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="item-detail">
                        <div className="item-name">{item.name}</div>
                        {item.customizations.length > 0 && (
                          <div className="item-customizations">
                            <span className="customizations-label">Personalizações:</span>
                            <div className="customizations-list">
                              {item.customizations.map((customization, idx) => (
                                <span key={idx} className="customization-tag">
                                  {customization}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="item-price">R$ {item.price.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="order-total-detail">
                    <div className="total-line">
                      <span className="total-label">TOTAL:</span>
                      <span className="total-value">R$ {selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {selectedOrder.status === 'fazendo' && (
                    <div className="order-progress">
                      <h5 className="progress-title">Acompanhe seu pedido:</h5>
                      <div className="progress-steps">
                        <div className="step completed">
                          <div className="step-icon">✓</div>
                          <div className="step-text">Pedido Recebido</div>
                        </div>
                        <div className="step active">
                          <div className="step-icon">⏳</div>
                          <div className="step-text">Preparando</div>
                        </div>
                        <div className="step">
                          <div className="step-icon">🎯</div>
                          <div className="step-text">Pronto</div>
                        </div>
                        <div className="step">
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
