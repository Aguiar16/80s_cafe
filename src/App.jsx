import React, { useState } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import CustomerOrders from './pages/CustomerOrders';
import AdminOrders from './pages/AdminOrders';
import Payment from './pages/Payment';
import './App.css';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [orderData, setOrderData] = useState(null);

  const navigateTo = (page, data = null) => {
    setCurrentPage(page);
    if (data) {
      setOrderData(data);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home 
          onNavigateToLogin={() => navigateTo('login')}
          onNavigateToMenu={() => navigateTo('menu')}
          onNavigateToOrders={() => navigateTo('customer-orders')}
          onNavigateToAdmin={() => navigateTo('admin-orders')}
        />;
      case 'login':
        return <Login 
          onNavigateToHome={() => navigateTo('home')} 
          onNavigateToMenu={() => navigateTo('menu')}
        />;
      case 'menu':
        return <Menu 
          onNavigateToHome={() => navigateTo('home')} 
          onNavigateToCart={() => navigateTo('cart')}
          onNavigateToLogin={() => navigateTo('login')}
        />;
      case 'cart':
        return <Cart 
          onNavigateToHome={() => navigateTo('home')}
          onNavigateToMenu={() => navigateTo('menu')}
          onNavigateToPayment={(data) => navigateTo('payment', data)}
          onNavigateToLogin={() => navigateTo('login')}
        />;
      case 'payment':
        return <Payment 
          orderData={orderData}
          onNavigateToHome={() => navigateTo('home')}
          onNavigateBack={() => navigateTo('menu')}
          onNavigateToLogin={() => navigateTo('login')}
        />;
      case 'customer-orders':
        return <CustomerOrders 
          onNavigateToHome={() => navigateTo('home')}
          onNavigateToMenu={() => navigateTo('menu')}
          onNavigateToLogin={() => navigateTo('login')}
        />;
      case 'admin-orders':
        return <AdminOrders 
          onNavigateToHome={() => navigateTo('home')}
          onNavigateToLogin={() => navigateTo('login')}
        />;
      default:
        return <Home 
          onNavigateToLogin={() => navigateTo('login')}
          onNavigateToMenu={() => navigateTo('menu')}
          onNavigateToOrders={() => navigateTo('customer-orders')}
          onNavigateToAdmin={() => navigateTo('admin-orders')}
          onNavigateToPayment={() => navigateTo('payment')}
        />;
    }
  };

  return (
    <div className="App">
      {renderCurrentPage()}
    </div>
  );
};

export default App
