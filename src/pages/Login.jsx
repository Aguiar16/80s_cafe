import React, { useState, useEffect } from 'react';
import { authService, apiUtils } from '../services/api';
import './Login.css';

const Login = ({ onNavigateToHome, onNavigateToMenu }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
    nome: '',
    confirmarSenha: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [apiStatus, setApiStatus] = useState(null); // null, 'checking', 'online', 'offline'

  // Verificar status da API ao montar o componente
  useEffect(() => {
    const checkApiStatus = async () => {
      setApiStatus('checking');
      try {
        const isOnline = await apiUtils.checkApiHealth();
        setApiStatus(isOnline ? 'online' : 'offline');
        
        if (!isOnline) {
          setMessage('⚠️ Servidor offline. Algumas funcionalidades podem não estar disponíveis.');
        }
      } catch (error) {
        setApiStatus('offline');
        setMessage('⚠️ Não foi possível conectar ao servidor.');
      }
    };

    checkApiStatus();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro do campo quando o usuário digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validar senha
    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    // Validações específicas para cadastro
    if (!isLogin) {
      if (!formData.nome) {
        newErrors.nome = 'Nome é obrigatório';
      }
      
      if (!formData.confirmarSenha) {
        newErrors.confirmarSenha = 'Confirmação de senha é obrigatória';
      } else if (formData.senha !== formData.confirmarSenha) {
        newErrors.confirmarSenha = 'Senhas não coincidem';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Verificar se a API está online antes de tentar fazer login/cadastro
    if (apiStatus === 'offline') {
      setMessage('❌ Servidor indisponível. Tente novamente mais tarde.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      let response;
      
      if (isLogin) {
        // Fazer login
        console.log('Tentando fazer login com:', { email: formData.email });
        response = await authService.login({
          email: formData.email,
          senha: formData.senha
        });
        
        console.log('Resposta do login:', response);
        
        // Verificar tipo de usuário após login
        if (response.access_token) {
          try {
            const userTypeInfo = await authService.getUserType();
            console.log('Tipo de usuário:', userTypeInfo);
            
            // Salvar informações adicionais do usuário
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            const updatedUser = { ...currentUser, ...userTypeInfo };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
          } catch (userTypeError) {
            console.warn('Erro ao obter tipo de usuário:', userTypeError);
            // Não falhar o login por conta disso
          }
        }
        
      } else {
        // Fazer cadastro
        console.log('Tentando fazer cadastro com:', { 
          nome: formData.nome, 
          email: formData.email,
          tipo_usuario: 'cliente' 
        });
        response = await authService.cadastrar({
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
          tipo_usuario: 'cliente' // Por padrão, novos registros são clientes
        });
        
        console.log('Resposta do cadastro:', response);
      }
      
      // Atualizar status da API para online se a requisição foi bem-sucedida
      if (apiStatus !== 'online') {
        setApiStatus('online');
      }
      
      setMessage(isLogin ? '✅ Login realizado com sucesso!' : '✅ Cadastro realizado com sucesso!');
      
      // Limpar formulário após sucesso
      setFormData({
        email: '',
        senha: '',
        nome: '',
        confirmarSenha: ''
      });
      
      // Redirecionar para o menu após sucesso
      setTimeout(() => {
        console.log('Redirecionando para o menu...');
        // Verificar se há função de navegação para menu
        if (onNavigateToMenu) {
          onNavigateToMenu();
        } else if (onNavigateToHome) {
          // Fallback para home se não tiver navegação direta para menu
          console.log('Navegação para menu não disponível, indo para home');
          onNavigateToHome();
        } else {
          // Último fallback para redirecionamento direto
          console.log('Nenhuma função de navegação disponível, usando window.location');
          window.location.href = '/menu';
        }
      }, 1500);

    } catch (error) {
      console.error('Erro:', error);
      
      // Verificar se é erro de conectividade
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        setApiStatus('offline');
        setMessage('❌ Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        const errorMessage = apiUtils.handleApiError(error);
        setMessage(`❌ ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      senha: '',
      nome: '',
      confirmarSenha: ''
    });
    setErrors({});
    setMessage('');
  };

  const handleBackToHome = () => {
    if (onNavigateToHome) {
      onNavigateToHome();
    }
  };

  return (
    <div className="login-container">
      {/* Background Effects */}
      <div className="login-background">
        <div className="grid-pattern"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
        <div className="scan-lines"></div>
      </div>

      {/* Header */}
      <header className="login-header">
        <div className="header-content">
          <button className="back-btn" onClick={handleBackToHome}>
            <span className="back-icon">←</span>
            VOLTAR
          </button>
          <div className="login-logo">
            <span className="logo-text">RETRO CAFÉ</span>
            <span className="logo-subtitle">SISTEMA DE ACESSO</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="login-content">
        <div className="login-card">
          {/* Card Header */}
          <div className="card-header">
            <h1 className="card-title neon-text">
              {isLogin ? 'LOGIN' : 'CADASTRO'}
            </h1>
            <p className="card-subtitle">
              {isLogin 
                ? 'Acesse sua conta e explore nosso cardápio futurista!' 
                : 'Junte-se à revolução do café e crie sua conta!'
              }
            </p>
            
            {/* Status da API */}
            {apiStatus && (
              <div className={`api-status ${apiStatus}`}>
                {apiStatus === 'checking' && '🔄 Verificando servidor...'}
                {apiStatus === 'online' && '🟢 Servidor online'}
                {apiStatus === 'offline' && '🔴 Servidor offline'}
              </div>
            )}
          </div>

          {/* Toggle Buttons de Login e Cadastro */}
          <div className="toggle-buttons">
            <button 
              className={`toggle-btn ${isLogin ? 'active' : ''}`}
              type="button"
              onClick={() => {
                setIsLogin(true);
                setErrors({});
                setMessage('');
              }}
            >
              LOGIN
            </button>
            <button 
              className={`toggle-btn ${!isLogin ? 'active' : ''}`}
              type="button"
              onClick={() => {
                setIsLogin(false);
                setErrors({});
                setMessage('');
              }}
            >
              CADASTRO
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Nome (apenas no cadastro) */}
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">NOME COMPLETO</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className={`form-input ${errors.nome ? 'error' : ''}`}
                  placeholder="Digite seu nome completo"
                  disabled={loading}
                />
                {errors.nome && <span className="error-message">{errors.nome}</span>}
              </div>
            )}

            {/* Email */}
            <div className="form-group">
              <label className="form-label">EMAIL</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="usuario@email.com"
                disabled={loading}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            {/* Senha */}
            <div className="form-group">
              <label className="form-label">SENHA</label>
              <input
                type="password"
                name="senha"
                value={formData.senha}
                onChange={handleInputChange}
                className={`form-input ${errors.senha ? 'error' : ''}`}
                placeholder="••••••••"
                disabled={loading}
              />
              {errors.senha && <span className="error-message">{errors.senha}</span>}
            </div>

            {/* Confirmar Senha (apenas no cadastro) */}
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">CONFIRMAR SENHA</label>
                <input
                  type="password"
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleInputChange}
                  className={`form-input ${errors.confirmarSenha ? 'error' : ''}`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                {errors.confirmarSenha && <span className="error-message">{errors.confirmarSenha}</span>}
              </div>
            )}

            {/* Message */}
            {message && (
              <div className={`message ${message.includes('sucesso') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              className={`submit-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              <span className="btn-text">
                {loading 
                  ? (isLogin ? 'FAZENDO LOGIN...' : 'CRIANDO CONTA...') 
                  : (isLogin ? 'ENTRAR' : 'CRIAR CONTA')
                }
              </span>
              <span className="btn-glow"></span>
            </button>
          </form>

          {/* Footer */}
          <div className="card-footer">
            <p className="footer-text">
              {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
              <button className="link-btn" onClick={toggleMode}>
                {isLogin ? 'Criar conta' : 'Fazer login'}
              </button>
            </p>
            
          </div>
        </div>

        {/* Side Info */}
        <div className="side-info">
          <h3 className="info-title">BENEFÍCIOS</h3>
          <div className="benefits-list">
            <div className="benefit-item">
              <span className="benefit-icon">☕</span>
              <span className="benefit-text">Certificado pelo PEAGA</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">⚡</span>
              <span className="benefit-text">Pedidos Expressos</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🎨</span>
              <span className="benefit-text">Customização Total</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🏆</span>
              <span className="benefit-text">Programa Fidelidade</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
