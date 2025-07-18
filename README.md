# Retro Café - Sistema de Pedidos Anos 80 🤖☕

Uma aplicação web futurística com tema retrô anos 80 para gerenciamento de pedidos de café, desenvolvida com React + Vite.

## 🚀 Funcionalidades Principais

### 🔐 Sistema de Autenticação
- **Login/Registro universal** com integração ao backend FastAPI
- **Redirecionamento automático** para o menu após login bem-sucedido
- **Botão dinâmico** que muda baseado no estado de autenticação
- **Sincronização entre abas** - mudanças refletidas em tempo real
- **Verificação de tipo de usuário** (Cliente/Staff) com badges visuais

### 🎨 Interface Retro-Futurística
- Design inspirado nos anos 80 com elementos neon
- Animações e efeitos visuais cyberpunk
- Layout responsivo (mobile-first)
- Tema escuro com cores vibrantes

### 📱 Experiência do Usuário
- **Status da API** em tempo real (online/offline)
- **Validação de formulários** no frontend
- **Tratamento robusto de erros** com mensagens em português
- **Loading states** para todas as operações
- **Feedback visual** com emojis e animações

## 🛠️ Tecnologias

- **Frontend:** React 18 + Vite
- **Estilização:** CSS puro com variáveis customizadas
- **Estado:** Hooks personalizados (useAuth)
- **API:** Integração com FastAPI backend
- **Autenticação:** JWT Tokens

## 📦 Instalação e Execução

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 🔧 Configuração

### API Backend
Configure a URL do backend em `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000';
```

### Variáveis de Ambiente
```env
VITE_API_URL=http://localhost:8000
```

## 🎯 Como Usar

### 1. Primeiro Acesso
1. Abra a aplicação
2. Clique em "LOGIN" no header
3. Crie uma conta ou faça login
4. Seja redirecionado automaticamente para o menu

### 2. Usuário Logado
- **Nome do usuário** aparece no header
- **Badge "STAFF"** para usuários administrativos
- **Botão "SAIR"** para logout
- **Clique no nome** para ir ao menu

### 3. Sincronização
- Mudanças de login/logout refletem em todas as abas abertas
- Status da API atualizado em tempo real
- Verificação automática de token expirado

## 🎨 Tema Visual

### Paleta de Cores
- **Neon Cyan:** `#00f5ff`
- **Neon Pink:** `#ff0080`  
- **Neon Purple:** `#8000ff`
- **Background:** `#0a0a0a` → `#1a0a1a`

### Tipografia
- **Headers:** 'Orbitron' (futurística)
- **Body:** 'Courier New' (terminal/retro)

## 🚀 Deploy

### Build de Produção
```bash
npm run build
```

### Deploy Automático
```bash
# Configure CI/CD para deploy automático
# Exemplo com Vercel/Netlify
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Add nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🎯 Roadmap

- [ ] Sistema de notificações em tempo real
- [ ] PWA (Progressive Web App)
- [ ] Modo offline
- [ ] Temas personalizáveis
- [ ] Integração com pagamentos
- [ ] Analytics de usuário

---

Desenvolvido com ❤️ e muito ☕ pela equipe Retro Café
