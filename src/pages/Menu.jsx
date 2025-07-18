import React, { useState, useEffect } from 'react';
import './Menu.css';
import { productService } from '../services/api';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';

const Menu = ({ onNavigateToHome, onNavigateToCart, onNavigateToLogin }) => {
  const [drinks, setDrinks] = useState([]);
  const [customizations, setCustomizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedDrink, setSelectedDrink] = useState(null);
  const [selectedCustomizations, setSelectedCustomizations] = useState([]);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [observations, setObservations] = useState('');

  const { addToCart, cartItems } = useCart();
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

  // Mapeamento de ícones por tipo de bebida
  const typeIcons = {
    'café': '☕',
    'cha': '🍵',
    'chá': '🍵',
    'achocolatado': '🍫',
    'suco': '🧃',
    'vitamina': '🥤',
    'refrigerante': '🥤',
    'default': '🥤'
  };

  // Carregar dados das bebidas e personalizações ao montar o componente
  useEffect(() => {
    // Só carregar dados se estiver autenticado
    if (!authLoading && isLoggedIn) {
      const fetchMenuData = async () => {
        try {
          setLoading(true);
          setError(null);

          // Buscar bebidas e personalizações em paralelo
          const [bebidasResponse, personalizacoesResponse] = await Promise.all([
            productService.getBebidasMenu(),
            productService.getPersonalizacoes()
          ]);

          console.log('Bebidas response:', bebidasResponse); // Debug
          console.log('Personalizações response:', personalizacoesResponse); // Debug

          // Processar dados das bebidas
          const processedDrinks = bebidasResponse?.bebidas_disponiveis
            ?.filter(bebida => bebida.disponivel)
            ?.map(bebida => ({
              id: bebida.id,
              name: bebida.nome,
              type: bebida.tipo,
              description: bebida.descricao,
              basePrice: bebida.preco_base,
              icon: typeIcons[bebida.tipo.toLowerCase()] || typeIcons.default,
              customizations: bebida.personalizacoes_disponiveis || []
            }));

          // Processar personalizações disponíveis
          const availableCustomizations = personalizacoesResponse
            ?.filter(p => p.disponivel)
            ?.map(p => ({
              id: p.id,
              name: p.nome,
              price: p.preco_adicional,
              category: p.categoria
            })) || [];

          setDrinks(processedDrinks || []);
          setCustomizations(availableCustomizations);

        } catch (err) {
          console.error('Erro ao carregar dados do menu:', err);
          setError('Erro ao carregar o menu: ' + (err.message || 'Erro desconhecido'));
          // Set valores padrão em caso de erro
          setDrinks([]);
          setCustomizations([]);
        } finally {
          setLoading(false);
        }
      };

      fetchMenuData();
    } else if (!authLoading && !isLoggedIn) {
      // Se não estiver logado, parar o loading
      setLoading(false);
    }
  }, [isLoggedIn, authLoading]);

  const handleDrinkSelect = (drink) => {
    setSelectedDrink(drink);
    setSelectedCustomizations([]);
    setCalculatedPrice(drink.basePrice);
  };

  const calculatePrice = (drink, selectedCustomizations) => {
    const customizationTotal = selectedCustomizations.reduce((total, customization) => {
      return total + customization.price;
    }, 0);
    return drink.basePrice + customizationTotal;
  };

  const handleCustomizationToggle = (customization) => {
    const isSelected = selectedCustomizations.find(c => c.id === customization.id);
    let newCustomizations;
    
    if (isSelected) {
      newCustomizations = selectedCustomizations.filter(c => c.id !== customization.id);
    } else {
      newCustomizations = [...selectedCustomizations, customization];
    }
    
    setSelectedCustomizations(newCustomizations);
    setCalculatedPrice(calculatePrice(selectedDrink, newCustomizations));
  };

  // Obter personalizações disponíveis para a bebida selecionada
  const getAvailableCustomizationsForDrink = (drink) => {
    if (!drink || !drink.customizations || drink.customizations.length === 0) {
      // Se a bebida não tem personalizações específicas, retorna todas as disponíveis
      return customizations;
    }
    
    // Se a bebida tem personalizações específicas definidas, filtra apenas essas
    const drinkCustomizationIds = drink.customizations.map(c => c.id || c);
    return customizations.filter(c => drinkCustomizationIds.includes(c.id));
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

  const handleAddToCart = async () => {
    if (!selectedDrink) return;

    setAddingToCart(true);
    
    try {
      // Verificar os dados antes de enviar
      console.log('Dados a serem enviados:', {
        drink: selectedDrink,
        customizations: selectedCustomizations,
        observations: observations
      });

      const success = await addToCart(selectedDrink, selectedCustomizations, 1, observations);
      
      if (success) {
        alert(`${selectedDrink.name} adicionado ao carrinho!`);
        // Limpar seleção após adicionar
        setSelectedDrink(null);
        setSelectedCustomizations([]);
        setCalculatedPrice(0);
        setObservations('');
      } else {
        alert('Erro ao adicionar item ao carrinho. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      alert('Erro ao adicionar item ao carrinho. Tente novamente.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleGoToCart = () => {
    if (onNavigateToCart) {
      onNavigateToCart();
    }
  };

  const handleBackToHome = () => {
    if (onNavigateToHome) {
      onNavigateToHome();
    }
  };

  const handleCloseDetails = () => {
    setSelectedDrink(null);
    setSelectedCustomizations([]);
    setCalculatedPrice(0);
    setObservations('');
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
          <button className="cart-btn" onClick={() => onNavigateToCart && onNavigateToCart()}>
            <span className="cart-icon">🛒</span>
            <span className="cart-count">{cartItems.length}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="menu-main">
        <div className="menu-content">
          {/* Loading State */}
          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Carregando menu...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="error-container">
              <p className="error-message">{error}</p>
              <button 
                className="retry-btn" 
                onClick={() => window.location.reload()}
              >
                Tentar Novamente
              </button>
            </div>
          )}

          {/* Drinks Grid */}
          {!loading && !error && (
            <section className="drinks-section">
              <h2 className="section-title">
                <span className="title-icon">🥤</span>
                NOSSAS BEBIDAS
              </h2>
              
              {drinks.length === 0 ? (
                <div className="no-drinks-container">
                  <p>Nenhuma bebida disponível no momento.</p>
                </div>
              ) : (
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
              )}
            </section>
          )}

          {/* Side Panel - Drink Details */}
          {selectedDrink && !loading && !error && (
            <>
              {/* Modal Overlay */}
              <div className="modal-overlay" onClick={handleCloseDetails}></div>
              
              <aside className="drink-details">
                <div className="details-content">
                  <h3 className="details-title">
                    DETALHES
                    <button className="close-btn" onClick={handleCloseDetails}>
                      ×
                    </button>
                  </h3>
                <div className="selected-drink">
                  <div className="selected-drink-icon">{selectedDrink.icon}</div>
                  <h4 className="selected-drink-name">{selectedDrink.name}</h4>
                  <p className="selected-drink-type">{selectedDrink.type.toUpperCase()}</p>
                  <p className="selected-drink-description">{selectedDrink.description}</p>
                  <div className="selected-drink-price">R$ {calculatedPrice.toFixed(2)}</div>
                  
                  <div className="customization-section">
                    <h5 className="customization-title">Personalize seu pedido:</h5>
                    <div className="customization-options">
                      {getAvailableCustomizationsForDrink(selectedDrink).map((customization) => (
                        <div 
                          key={customization.id} 
                          className={`customization-option ${selectedCustomizations.find(c => c.id === customization.id) ? 'selected' : ''}`}
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
                      {selectedCustomizations.map((customization) => (
                        <div key={customization.id} className="selected-item">
                          {customization.name} - {customization.price === 0 ? 'Grátis' : `+R$ ${customization.price.toFixed(2)}`}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="observations-section">
                    <h6 className="observations-title">Observações (opcional):</h6>
                    <textarea
                      className="observations-input"
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      placeholder="Ex: Menos açúcar, bem quente..."
                      maxLength={200}
                      rows={3}
                    />
                  </div>
                  
                  <button 
                    className="add-to-cart-btn"
                    onClick={handleAddToCart}
                    disabled={!selectedDrink || addingToCart}
                  >
                    <span className="btn-icon">🛒 </span>
                    {addingToCart ? 'ADICIONANDO...' : 'ADICIONAR AO CARRINHO'}
                  </button>
                </div>
              </div>
            </aside>
            </>
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
