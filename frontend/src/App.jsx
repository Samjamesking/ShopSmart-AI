import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartWishlistProvider } from './context/CartWishlistContext';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import VoiceAssistantModal from './components/VoiceAssistantModal';
import ImageSearchModal from './components/ImageSearchModal';

import HomePage from './pages/HomePage';
import AssistantPage from './pages/AssistantPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ComparePage from './pages/ComparePage';
import WishlistPage from './pages/WishlistPage';
import PriceTrackerPage from './pages/PriceTrackerPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import AuthPage from './pages/AuthPage';

function MainApp() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [assistantQuery, setAssistantQuery] = useState('');

  // Modals state
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (id) => {
    setSelectedProductId(id);
    setCurrentPage('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavbarSearch = (query, sendToAssistant = false) => {
    if (sendToAssistant || query.toLowerCase().includes('compare') || query.toLowerCase().includes('under') || query.toLowerCase().includes('best')) {
      setAssistantQuery(query);
      setCurrentPage('assistant');
    } else {
      setSearchQuery(query);
      setCurrentPage('search');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVoiceQuery = (transcript) => {
    setAssistantQuery(transcript);
    setCurrentPage('assistant');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If on Auth page or user not authenticated and on auth
  if (currentPage === 'auth') {
    return <AuthPage onSuccess={() => setCurrentPage('dashboard')} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={handleNavigate}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onSearchSubmit={(q) => handleNavbarSearch(q, false)}
          onOpenVoice={() => setIsVoiceOpen(true)}
          onOpenImage={() => setIsImageOpen(true)}
          setCurrentPage={handleNavigate}
        />

        <main className="flex-1">
          {currentPage === 'dashboard' && (
            <HomePage
              onNavigate={handleNavigate}
              onSearch={handleNavbarSearch}
              onSelectProduct={handleSelectProduct}
            />
          )}

          {currentPage === 'assistant' && (
            <AssistantPage
              initialQuery={assistantQuery}
              onSelectProduct={handleSelectProduct}
              onOpenVoice={() => setIsVoiceOpen(true)}
              onOpenImage={() => setIsImageOpen(true)}
            />
          )}

          {currentPage === 'search' && (
            <ProductsPage
              initialSearch={searchQuery}
              onSelectProduct={handleSelectProduct}
            />
          )}

          {currentPage === 'product-detail' && (
            <ProductDetailPage
              productId={selectedProductId}
              onBack={() => handleNavigate('search')}
              onSelectProduct={handleSelectProduct}
            />
          )}

          {currentPage === 'compare' && (
            <ComparePage
              onSelectProduct={handleSelectProduct}
            />
          )}

          {currentPage === 'wishlist' && (
            <WishlistPage
              onSelectProduct={handleSelectProduct}
            />
          )}

          {currentPage === 'price-tracker' && (
            <PriceTrackerPage
              initialProductId={selectedProductId}
              onSelectProduct={handleSelectProduct}
            />
          )}

          {currentPage === 'orders' && (
            <OrdersPage
              onSelectProduct={handleSelectProduct}
            />
          )}

          {(currentPage === 'profile' || currentPage === 'settings') && (
            <ProfilePage />
          )}

          {currentPage === 'admin' && (
            <AdminPage />
          )}
        </main>
      </div>

      {/* Global Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onVoiceQuery={handleVoiceQuery}
      />

      {/* Global Image Search Modal */}
      <ImageSearchModal
        isOpen={isImageOpen}
        onClose={() => setIsImageOpen(false)}
        onSelectProduct={handleSelectProduct}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartWishlistProvider>
          <MainApp />
        </CartWishlistProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
