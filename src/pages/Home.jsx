import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import './Home.css';

const Home = ({ onNavigateToLogin, onNavigateToMenu, onNavigateToOrders, onNavigateToAdmin, onNavigateToPayment }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user, isLoggedIn, loading, logout, isStaff } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const scrollToMenu = () => {
    // Navegar para a página do menu
    if (onNavigateToMenu) {
      onNavigateToMenu();
    }
  };

  const handleLoginClick = () => {
    if (isLoggedIn) {
      // Se já estiver logado, fazer logout
      handleLogout();
    } else {
      // Se não estiver logado, ir para tela de login
      if (onNavigateToLogin) {
        onNavigateToLogin();
      }
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleUserProfileClick = () => {
    // Navegar para a página de menu (área do usuário)
    if (onNavigateToMenu) {
      onNavigateToMenu();
    }
  };

  const handleOrdersClick = () => {
    if (onNavigateToOrders) {
      onNavigateToOrders();
    }
  };

  const handleAdminClick = () => {
    if (onNavigateToAdmin) {
      onNavigateToAdmin();
    }
  };

  return (
    <div className="home-container">
      {/* Header/Navigation */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-text">RETRO CAFÉ</span>
            <span className="logo-subtitle">EST. 1985</span>
          </div>
          <nav className="nav">
            {isLoggedIn && !isStaff && (
              <>
                <button className="nav-btn" onClick={scrollToMenu}>MENU</button>
                <button className="nav-btn" onClick={handleOrdersClick}>PEDIDOS</button>
              </>
            )}
            {loading ? (
              <div className="auth-loading">
                <span>⏳</span>
              </div>
            ) : isLoggedIn ? (
              <div className="user-menu">
                <button className="user-btn" onClick={isStaff ? handleAdminClick : handleUserProfileClick}>
                  <span className="user-icon">👤</span>
                  <span className="user-name">
                    {user?.nome ? user.nome.split(' ')[0] : 'Usuário'}
                  </span>
                  {isStaff && <span className="staff-badge">STAFF</span>}
                </button>
                <button className="logout-btn" onClick={handleLogout}>
                  <span className="logout-icon">🚪</span>
                  SAIR
                </button>
              </div>
            ) : (
              <button className="nav-btn" onClick={handleLoginClick}>LOGIN</button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="grid-pattern"></div>
          <div className="neon-shapes">
            <div className="neon-circle neon-circle-1"></div>
            <div className="neon-circle neon-circle-2"></div>
            <div className="neon-triangle"></div>
          </div>
        </div>
        
        <div className="hero-content">
          <div className="digital-clock">
            <span className="time-display">
              {currentTime.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
              })}
            </span>
            <span className="date-display">
              {currentTime.toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>

          <h1 className="hero-title">
            <span className="title-line-1">WELCOME TO THE</span>
            <span className="title-line-2 neon-text">RETRO CAFÉ</span>
            <span className="title-line-3">EXPERIENCE</span>
          </h1>

          <p className="hero-subtitle">
            Viaje no tempo e saboreie o futuro que os anos 80 imaginaram.
            <br />
            Cafés especiais, sabores únicos e uma experiência <strong>totalmente radical!</strong>
          </p>

          <div className="hero-buttons">
            <button 
              className="btn btn-primary" 
              onClick={isStaff ? undefined : scrollToMenu} 
              disabled={isStaff}
            >
              <span className="btn-text">EXPLORAR MENU</span>
              <span className="btn-glow"></span>
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={isStaff ? undefined : handleOrdersClick} 
              disabled={isStaff}
            >
              <span className="btn-text">FAZER PEDIDO</span>
              <span className="btn-glow"></span>
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">ABERTO</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">VÁRIAS</span>
              <span className="stat-label">BEBIDAS</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">∞</span>
              <span className="stat-label">CUSTOMIZAÇÕES</span>
            </div>
          </div>
        </div>

        <div className="hero-decorations">
          <div className="pixel-art-coffee">☕</div>
          <div className="floating-elements">
            <div className="floating-square"></div>
            <div className="floating-diamond"></div>
            <div className="floating-circle"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title neon-text">
            <span className="glitch" data-text="FEATURES">FEATURES</span>
          </h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">☕</div>
              <h3 className="feature-title">Aprovado pelo PEAGA</h3>
              <p className="feature-description">
                Testado e aprovado pelo nosso consultor PEAGA, especializado em café e em sistemas.
              </p>
              <div className="feature-highlight">TECNOLOGIA AVANÇADA</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">PREPARO ULTRA-RÁPIDO</h3>
              <p className="feature-description">
                Utilizamos padrões de design otimizados para entregar 
                seu pedido em tempo recorde sem perder qualidade.
              </p>
              <div className="feature-highlight">VELOCIDADE MÁXIMA</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3 className="feature-title">CUSTOMIZAÇÃO INFINITA</h3>
              <p className="feature-description">
                Vários ingredientes e personalizações disponíveis.
                Crie sua bebida perfeita com nosso sistema Decorator.
              </p>
              <div className="feature-highlight">SUA CRIATIVIDADE</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3 className="feature-title">APP RETRO-FUTURISTA</h3>
              <p className="feature-description">
                Interface nostálgica com tecnologia moderna. 
                Acompanhe seu pedido em tempo real com estilo.
              </p>
              <div className="feature-highlight">DESIGN ÚNICO</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-background">
          <div className="scan-lines"></div>
        </div>
        <div className="container">
          <h2 className="cta-title">
            PRONTO PARA A VIAGEM NO TEMPO?
          </h2>
          <p className="cta-subtitle">
            Junte-se à revolução do café e experimente sabores que vão além do imaginável.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4 className="footer-title">RETRO CAFÉ</h4>
              <p className="footer-text">
                O futuro que os anos 80 sonharam, hoje na sua xícara.
              </p>
            </div>
            <div className="footer-section">
              <h4 className="footer-title">CONTATO</h4>
              <p className="footer-text">
                📧 hello@retrocafe.com<br/>
                📞 (11) 9999-8080<br/>
                📍 Av. Futuro, 1985
              </p>
            </div>
            <div className="footer-section">
              <h4 className="footer-title">HORÁRIOS</h4>
              <p className="footer-text">
                Segunda - Domingo<br/>
                24 horas por dia<br/>
                Porque o futuro nunca para!
              </p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 RETRO CAFÉ. Todos os direitos reservados. Powered by GoF Patterns.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
