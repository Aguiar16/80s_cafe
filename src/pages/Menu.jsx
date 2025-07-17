import React, { useState, useEffect } from 'react';
import './Menu.css';

const Menu = ({ onNavigateToHome, onNavigateToPayment }) => {
  const [drinks] = useState([
    {
      id: 1,
      name: "DeLorean Express",
      type: "café",
      description: "Um café intenso que te transporta através do tempo. Personalize conforme seu gosto.",
      basePrice: 12.00,
      icon: "☕",
      customizations: [
        { name: "Leite Integral", price: 0.00 },
        { name: "Leite Desnatado", price: 0.50 },
        { name: "Leite de Amêndoa", price: 2.00 },
        { name: "Leite de Aveia", price: 1.50 },
        { name: "Sem Açúcar", price: 0.00 },
        { name: "Açúcar Demerara", price: 0.30 },
        { name: "Adoçante", price: 0.00 },
        { name: "Canela", price: 0.50 },
        { name: "Dose Extra", price: 3.00 }
      ]
    },
    {
      id: 2,
      name: "Chá de Neon",
      type: "chá",
      description: "Uma mistura aromática com essência ciberpunk. Escolha sua personalização ideal.",
      basePrice: 8.00,
      icon: "🍵",
      customizations: [
        { name: "Sem Açúcar", price: 0.00 },
        { name: "Mel", price: 1.00 },
        { name: "Açúcar Cristal", price: 0.00 },
        { name: "Limão", price: 0.50 },
        { name: "Hortelã", price: 0.80 },
        { name: "Gengibre", price: 1.20 },
        { name: "Leite de Coco", price: 1.50 },
        { name: "Extra Forte", price: 1.00 }
      ]
    },
    {
      id: 3,
      name: "Sonho de Verão",
      type: "achocolatado",
      description: "Achocolatado cremoso com sabor nostálgico. Customize para sua experiência perfeita.",
      basePrice: 10.00,
      icon: "🍫",
      customizations: [
        { name: "Leite Integral", price: 0.00 },
        { name: "Leite Desnatado", price: 0.50 },
        { name: "Leite de Amêndoa", price: 2.00 },
        { name: "Chantilly", price: 2.50 },
        { name: "Marshmallows", price: 1.80 },
        { name: "Sem Açúcar", price: 0.00 },
        { name: "Canela", price: 0.50 }
      ]
    }
  ]);

  const [selectedDrink, setSelectedDrink] = useState(null);
  const [selectedCustomizations, setSelectedCustomizations] = useState([]);
  const [calculatedPrice, setCalculatedPrice] = useState(0);

  const handleDrinkSelect = (drink) => {
    setSelectedDrink(drink);
    setSelectedCustomizations([]);
    setCalculatedPrice(drink.basePrice);
  };

  const calculatePrice = (drink, customizations) => {
    const customizationTotal = customizations.reduce((total, customization) => {
      return total + customization.price;
    }, 0);
    return drink.basePrice + customizationTotal;
  };

  const handleCustomizationToggle = (customization) => {
    const isSelected = selectedCustomizations.find(c => c.name === customization.name);
    let newCustomizations;
    
    if (isSelected) {
      newCustomizations = selectedCustomizations.filter(c => c.name !== customization.name);
    } else {
      newCustomizations = [...selectedCustomizations, customization];
    }
    
    setSelectedCustomizations(newCustomizations);
    setCalculatedPrice(calculatePrice(selectedDrink, newCustomizations));
  };

  const handleProceedToPayment = () => {
    const orderData = {
      drink: selectedDrink,
      customizations: selectedCustomizations,
      totalPrice: calculatedPrice
    };
    
    // Navegar para tela de pagamento
    if (onNavigateToPayment) {
      onNavigateToPayment(orderData);
    } else {
      console.log('Prosseguindo para pagamento:', orderData);
      alert(`Pedido: ${selectedDrink.name}\nPersonalizações: ${selectedCustomizations.map(c => c.name).join(', ')}\nTotal: R$ ${calculatedPrice.toFixed(2)}\n\nRedirecionando para pagamento...`);
    }
  };

  const handleBackToHome = () => {
    if (onNavigateToHome) {
      onNavigateToHome();
    }
  };

  return (
    <div className="menu-container">
      {/* Header */}
      <header className="menu-header">
        <div className="header-content">
          <button className="back-btn" onClick={handleBackToHome}>
            <span className="back-icon">←</span>
            VOLTAR
          </button>
          <div className="menu-logo">
            <span className="logo-text">MENU DIGITAL</span>
            <span className="logo-subtitle">BEBIDAS RETRÔ</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="menu-main">
        <div className="menu-content">
          {/* Drinks Grid */}
          <section className="drinks-section">
            <h2 className="section-title">
              <span className="title-icon">🥤</span>
              NOSSAS BEBIDAS
            </h2>
            
            <div className="drinks-grid">
              {drinks.map(drink => (
                <div 
                  key={drink.id} 
                  className={`drink-card ${selectedDrink?.id === drink.id ? 'selected' : ''}`}
                  onClick={() => handleDrinkSelect(drink)}
                >
                  <div className="drink-icon">{drink.icon}</div>
                  <div className="drink-info">
                    <h3 className="drink-name">{drink.name}</h3>
                    <p className="drink-type">{drink.type.toUpperCase()}</p>
                    <p className="drink-description">{drink.description}</p>
                    <div className="drink-footer">
                      <span className="drink-price">A partir de R$ {drink.basePrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Side Panel - Drink Details */}
          {selectedDrink && (
            <aside className="drink-details">
              <div className="details-content">
                <h3 className="details-title">DETALHES</h3>
                <div className="selected-drink">
                  <div className="selected-drink-icon">{selectedDrink.icon}</div>
                  <h4 className="selected-drink-name">{selectedDrink.name}</h4>
                  <p className="selected-drink-type">{selectedDrink.type.toUpperCase()}</p>
                  <p className="selected-drink-description">{selectedDrink.description}</p>
                  <div className="selected-drink-price">R$ {calculatedPrice.toFixed(2)}</div>
                  
                  <div className="customization-section">
                    <h5 className="customization-title">Personalize seu pedido:</h5>
                    <div className="customization-options">
                      {selectedDrink.customizations.map((customization, index) => (
                        <div 
                          key={index} 
                          className={`customization-option ${selectedCustomizations.find(c => c.name === customization.name) ? 'selected' : ''}`}
                          onClick={() => handleCustomizationToggle(customization)}
                        >
                          <span className="customization-name">{customization.name}</span>
                          <span className="customization-price">
                            {customization.price === 0 ? 'Grátis' : `+R$ ${customization.price.toFixed(2)}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {selectedCustomizations.length > 0 && (
                    <div className="selected-customizations">
                      <h6 className="selected-title">Personalizações selecionadas:</h6>
                      {selectedCustomizations.map((customization, index) => (
                        <div key={index} className="selected-item">
                          {customization.name} - {customization.price === 0 ? 'Grátis' : `+R$ ${customization.price.toFixed(2)}`}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <button 
                    className="payment-btn"
                    onClick={handleProceedToPayment}
                    disabled={!selectedDrink}
                  >
                    <span className="btn-icon">💳</span>
                    PROSSEGUIR PARA PAGAMENTO
                  </button>
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* Background Effects */}
      <div className="menu-background">
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

export default Menu;
