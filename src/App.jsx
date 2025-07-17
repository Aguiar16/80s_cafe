import React, { useState } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Menu from './pages/Menu';
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
          onNavigateToPayment={() => navigateTo('payment')}
        />;
      case 'login':
        return <Login onNavigateToHome={() => navigateTo('home')} />;
      case 'menu':
        return <Menu 
          onNavigateToHome={() => navigateTo('home')} 
          onNavigateToPayment={(data) => navigateTo('payment', data)}
        />;
      case 'payment':
        return <Payment 
          orderData={orderData}
          onNavigateToHome={() => navigateTo('home')}
          onNavigateBack={() => navigateTo('menu')}
        />;
      case 'customer-orders':
        return <CustomerOrders 
          onNavigateToHome={() => navigateTo('home')}
          onNavigateToMenu={() => navigateTo('menu')}
        />;
      case 'admin-orders':
        return <AdminOrders onNavigateToHome={() => navigateTo('home')} />;
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
