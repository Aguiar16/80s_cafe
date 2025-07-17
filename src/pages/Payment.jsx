import React, { useState } from 'react';
import './Payment.css';

const Payment = ({ orderData, onNavigateToHome, onNavigateBack }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Tipos de pagamento com descontos
  const paymentMethods = [
    {
      id: 'pix',
      name: 'PIX',
      icon: '💰',
      discount: 0.05, // 5%
      description: 'Pagamento instantâneo via PIX',
      discountText: '5% de desconto'
    },
    {
      id: 'fidelidade',
      name: 'Cartão Fidelidade',
      icon: '💎',
      discount: 0.10, // 10%
      description: 'Cartão fidelidade da loja',
      discountText: '10% de desconto'
    },
    {
      id: 'debito',
      name: 'Cartão de Débito',
      icon: '💳',
      discount: 0.00, // 0%
      description: 'Pagamento com cartão de débito',
      discountText: 'Sem desconto'
    }
  ];

  // Dados padrão do pedido caso não seja fornecido
  const defaultOrder = {
    drink: {
      name: 'DeLorean Express',
      icon: '☕'
    },
    customizations: [
      { name: 'Leite de Amêndoa', price: 2.00 },
      { name: 'Canela', price: 0.50 }
    ],
    totalPrice: 14.50
  };

  const currentOrder = orderData || defaultOrder;

  // Calcular preço com desconto
  const calculateDiscountedPrice = (basePrice, discount) => {
    return basePrice * (1 - discount);
  };

  const calculateSavings = (basePrice, discount) => {
    return basePrice * discount;
  };

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPaymentMethod) {
      alert('Por favor, selecione um método de pagamento.');
      return;
    }

    setIsProcessing(true);

    // Simular processamento do pagamento
    setTimeout(() => {
      const finalPrice = calculateDiscountedPrice(currentOrder.totalPrice, selectedPaymentMethod.discount);
      const savings = calculateSavings(currentOrder.totalPrice, selectedPaymentMethod.discount);
      
      alert(`Pagamento realizado com sucesso!\n\nPedido: ${currentOrder.drink.name}\nMétodo: ${selectedPaymentMethod.name}\nValor original: R$ ${currentOrder.totalPrice.toFixed(2)}\nDesconto: R$ ${savings.toFixed(2)}\nValor final: R$ ${finalPrice.toFixed(2)}\n\nObrigado pela preferência!`);
      
      setIsProcessing(false);
      
      // Voltar para home após pagamento
      if (onNavigateToHome) {
        onNavigateToHome();
      }
    }, 2000);
  };

  const handleBackToMenu = () => {
    if (onNavigateBack) {
      onNavigateBack();
    }
  };

  const handleBackToHome = () => {
    if (onNavigateToHome) {
      onNavigateToHome();
    }
  };

  return (
    <div className="payment-container">
      {/* Header */}
      <header className="payment-header">
        <div className="header-content">
          <button className="back-btn" onClick={handleBackToMenu || handleBackToHome}>
            <span className="back-icon">←</span>
            {onNavigateBack ? 'Cancelar' : 'INÍCIO'}
          </button>
          <div className="payment-logo">
            <span className="logo-text">FINALIZAR PEDIDO</span>
            <span className="logo-subtitle">PAGAMENTO SEGURO</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="payment-main">
        <div className="payment-content">
          {/* Left Column - Order Summary and Payment Summary */}
          <div className="payment-left-column">
            {/* Order Summary */}
            <section className="order-summary-section">
              <h2 className="section-title">
                RESUMO DO PEDIDO
              </h2>
              
              <div className="order-summary-card">
                <div className="order-item">
                  <div className="item-icon">{currentOrder.drink.icon}</div>
                  <div className="item-details">
                    <h3 className="item-name">{currentOrder.drink.name}</h3>
                    
                    {currentOrder.customizations && currentOrder.customizations.length > 0 && (
                      <div className="item-customizations">
                        <span className="customizations-label">Personalizações:</span>
                        <div className="customizations-list">
                          {currentOrder.customizations.map((customization, index) => (
                            <span key={index} className="customization-tag">
                              {customization.name}
                              {customization.price > 0 && ` (+R$ ${customization.price.toFixed(2)})`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="item-price">
                      <span className="price-label">Subtotal:</span>
                      <span className="price-value">R$ {currentOrder.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Payment Summary */}
            {selectedPaymentMethod && (
              <section className="payment-summary-section">
                <h2 className="section-title">
                  RESUMO DO PAGAMENTO
                </h2>
                
                <div className="payment-summary-card">
                  <div className="summary-lines">
                    <div className="summary-line">
                      <span className="line-label">Subtotal:</span>
                      <span className="line-value">R$ {currentOrder.totalPrice.toFixed(2)}</span>
                    </div>
                    
                    {selectedPaymentMethod.discount > 0 && (
                      <div className="summary-line discount-line">
                        <span className="line-label">Desconto ({selectedPaymentMethod.discountText}):</span>
                        <span className="line-value discount">-R$ {calculateSavings(currentOrder.totalPrice, selectedPaymentMethod.discount).toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="summary-line total-line">
                      <span className="line-label">TOTAL A PAGAR:</span>
                      <span className="line-value total">R$ {calculateDiscountedPrice(currentOrder.totalPrice, selectedPaymentMethod.discount).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="payment-method-selected">
                    <span className="selected-method-icon">{selectedPaymentMethod.icon}</span>
                    <span className="selected-method-name">{selectedPaymentMethod.name}</span>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Payment Methods */}
          <div className="payment-right-column">
            <section className="payment-methods-section">
              <h2 className="section-title">
                MÉTODO DE PAGAMENTO
              </h2>
              
              <div className="payment-methods-grid">
                {paymentMethods.map(method => (
                  <div 
                    key={method.id}
                    className={`payment-method-card ${selectedPaymentMethod?.id === method.id ? 'selected' : ''}`}
                    onClick={() => handlePaymentMethodSelect(method)}
                  >
                    <div className="method-icon">{method.icon}</div>
                    <div className="method-info">
                      <h3 className="method-name">{method.name}</h3>
                      <p className="method-description">{method.description}</p>
                      <div className="method-discount">
                        <span className={`discount-tag ${method.discount > 0 ? 'has-discount' : 'no-discount'}`}>
                          {method.discountText}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Payment Actions */}
      <footer className="payment-footer">
        <div className="payment-actions">
          <button 
            className="confirm-payment-btn"
            onClick={handleConfirmPayment}
            disabled={!selectedPaymentMethod || isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="btn-icon loading">⏳</span>
                PROCESSANDO...
              </>
            ) : (
              <>
                <span className="btn-icon">✅</span>
                CONFIRMAR PAGAMENTO
                {selectedPaymentMethod && (
                  <span className="btn-total">
                    R$ {calculateDiscountedPrice(currentOrder.totalPrice, selectedPaymentMethod.discount).toFixed(2)}
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </footer>

      {/* Background Effects */}
      <div className="payment-background">
        <div className="grid-pattern"></div>
        <div className="neon-effects">
          <div className="neon-circle neon-circle-1"></div>
          <div className="neon-circle neon-circle-2"></div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
