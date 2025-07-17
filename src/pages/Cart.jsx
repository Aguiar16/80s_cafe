import React, { useState, useEffect } from 'react';
import './Cart.css';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';

const Cart = ({ onNavigateToHome, onNavigateToMenu, onNavigateToPayment, onNavigateToLogin }) => {
  const { 
    cartItems, 
    cartTotal, 
    loading, 
    error, 
    removeFromCart, 
    clearCart 
  } = useCart();
  
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [processingItemId, setProcessingItemId] = useState(null);
  const [isClearing, setIsClearing] = useState(false);

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

  const handleRemoveItem = async (itemId) => {
    setProcessingItemId(itemId);
    const success = await removeFromCart(itemId);
    if (success) {
      // Item removido com sucesso
    }
    setProcessingItemId(null);
  };

  const handleClearCart = async () => {
    if (window.confirm('Tem certeza que deseja remover todos os itens do carrinho?')) {
      setIsClearing(true);
      const success = await clearCart();
      if (success) {
        // Carrinho limpo com sucesso
      }
      setIsClearing(false);
    }
  };

  const handleProceedToPayment = () => {
    if (cartItems.length === 0) {
      alert('Adicione itens ao carrinho antes de prosseguir para o pagamento.');
      return;
    }

    const orderData = {
      items: cartItems,
      totalPrice: cartTotal
    };

    // Sempre redireciona para a página de pagamento
    if (onNavigateToPayment) {
      onNavigateToPayment(orderData);
    } else {
      window.location.href = '/payment'; // fallback para rota padrão
    }
  };

  const handleBackToMenu = () => {
    if (onNavigateToMenu) {
      onNavigateToMenu();
    }
  };

  const handleBackToHome = () => {
    if (onNavigateToHome) {
      onNavigateToHome();
    }
  };

  const formatPersonalizacoes = (personalizacoes) => {
    if (!personalizacoes || personalizacoes.length === 0) {
      return 'Sem personalizações';
    }
    return personalizacoes.map(p => p.nome || p.name).join(', ');
  };

  if (!isLoggedIn) {
    return (
      <div className="cart-container">
        <header className="cart-header">
          <div className="header-content">
            <button className="back-btn" onClick={handleBackToHome}>
              <span className="back-icon">←</span>
              VOLTAR
            </button>
            <div className="cart-logo">
              <span className="logo-text">CARRINHO</span>
              <span className="logo-subtitle">SUAS BEBIDAS</span>
            </div>
          </div>
        </header>

        <main className="cart-main">
          <div className="login-required">
            <div className="login-message">
              <span className="login-icon">🔒</span>
              <h2>Login Necessário</h2>
              <p>Faça login para visualizar e gerenciar seu carrinho de compras.</p>
              <button className="login-btn" onClick={handleBackToHome}>
                IR PARA LOGIN
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="cart-container">
      {/* Header */}
      <header className="cart-header">
        <div className="header-content">
          <button className="back-btn" onClick={handleBackToMenu}>
            <span className="back-icon">←</span>
            MENU
          </button>
          <div className="cart-logo">
            <span className="logo-text">CARRINHO</span>
            <span className="logo-subtitle">SUAS BEBIDAS</span>
          </div>
          <button className="home-btn" onClick={handleBackToHome}>
            <span className="home-icon">🏠</span>
            HOME
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="cart-main">
        <div className="cart-content">
          {/* Loading State */}
          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Carregando carrinho...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="error-container">
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                <p>{error}</p>
                <button 
                  className="retry-btn"
                  onClick={() => window.location.reload()}
                >
                  Tentar Novamente
                </button>
              </div>
            </div>
          )}

          {/* Empty Cart */}
          {!loading && !error && cartItems.length === 0 && (
            <div className="empty-cart">
              <div className="empty-message">
                <span className="empty-icon">🛒</span>
                <h2>Carrinho Vazio</h2>
                <p>Adicione algumas bebidas incríveis ao seu carrinho!</p>
                <button className="shop-btn" onClick={handleBackToMenu}>
                  <span className="shop-icon">🥤</span>
                  EXPLORAR MENU
                </button>
              </div>
            </div>
          )}

          {/* Cart Items with Two Column Layout */}
          {!loading && !error && cartItems.length > 0 && (
            <div className="cart-layout">
              {/* Left Column - Cart Items */}
              <div className="cart-left-column">
                <section className="cart-items">
                  <div className="cart-header-section">
                    <h2 className="section-title">
                      <span className="title-icon">🛒</span>
                      SEUS ITENS ({cartItems.length})
                    </h2>
                    <button 
                      className="clear-cart-btn"
                      onClick={handleClearCart}
                      disabled={isClearing}
                    >
                      <span className="clear-icon">🗑️</span>
                      {isClearing ? 'LIMPANDO...' : 'LIMPAR CARRINHO'}
                    </button>
                  </div>

                  <div className="items-list">
                    {cartItems.map((item, index) => (
                      <div key={item.id || index} className="cart-item">
                        <div className="item-info">
                          <div className="item-header">
                            <h3 className="item-name">{item.bebida_nome || 'Bebida'}</h3>
                            <span className="item-quantity">Qty: {item.quantidade}</span>
                          </div>
                          <p className="item-description">{item.bebida_descricao || ''}</p>
                          
                          {item.personalizacoes && item.personalizacoes.length > 0 && (
                            <div className="item-customizations">
                              <span className="customizations-label">Personalizações:</span>
                              <span className="customizations-text">
                                {formatPersonalizacoes(item.personalizacoes)}
                              </span>
                            </div>
                          )}
                          
                          {/* Adiciona campo de observações/descrição do pedido */}
                          {item.observacoes && (
                            <div className="item-observacoes">
                              <span className="observacoes-label">Observações:</span>
                              <span className="observacoes-text">{item.observacoes}</span>
                            </div>
                          )}
                          <div className="item-pricing">
                            <span className="item-unit-price">Preço unitário: R$ {(item.preco_unitario || 0).toFixed(2)}</span>
                            <span className="item-quantity-info">  Quantidade: {item.quantidade}</span>
                          </div>
                        </div>
                        
                        <div className="item-actions">
                          <div className="item-price">
                            <span className="price-label">Subtotal:</span>
                            <span className="price-value">
                              R$ {(item.subtotal || 0).toFixed(2)}
                            </span>
                          </div>
                          <button 
                            className="remove-btn"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={processingItemId === item.id}
                          >
                            <span className="remove-icon">❌</span>
                            {processingItemId === item.id ? 'REMOVENDO...' : 'REMOVER'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Column - Cart Summary (Fixed) */}
              <div className="cart-right-column">
                <section className="cart-summary">
                  <div className="summary-content">
                    <h3 className="summary-title">RESUMO DO PEDIDO</h3>
                    
                    <div className="summary-details">
                      <div className="summary-line">
                        <span className="line-label">Itens ({cartItems.length}):</span>
                        <span className="line-value">R$ {cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="summary-line total-line">
                        <span className="line-label">TOTAL:</span>
                        <span className="line-value">R$ {cartTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="summary-actions">
                      <button 
                        className="continue-shopping-btn"
                        onClick={handleBackToMenu}
                      >
                        <span className="btn-icon">🛍️</span>
                        CONTINUAR COMPRANDO
                      </button>
                      <button 
                        className="checkout-btn"
                        onClick={handleProceedToPayment}
                      >
                        <span className="btn-icon">💳</span>
                        FINALIZAR PEDIDO
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Background Effects */}
      <div className="cart-background">
        <div className="grid-pattern"></div>
        <div className="neon-effects">
          <div className="neon-circle neon-circle-1"></div>
          <div className="neon-circle neon-circle-2"></div>
          <div className="neon-line neon-line-1"></div>
          <div className="neon-line neon-line-2"></div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
