import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { CartProvider } from './context/CartContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { CartDrawer } from './components/CartDrawer.js';
import { AuthModal } from './components/AuthModal.js';

// Pages
import { HomePage } from './pages/HomePage.js';
import { CatalogPage } from './pages/CatalogPage.js';
import { ProductDetailPage } from './pages/ProductDetailPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { AccountPage } from './pages/AccountPage.js';
import { AdminDashboard } from './pages/AdminDashboard.js';

const MainApp: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParams, setPageParams] = useState<any>({});
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const handleNavigate = (page: string, params: any = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b1120] text-slate-100 bg-grid-pattern selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Page Routing */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onOpenAuth={() => handleOpenAuth('login')}
          />
        )}

        {currentPage === 'catalog' && (
          <CatalogPage
            initialCategoryId={pageParams?.categoryId}
            initialSearch={pageParams?.search}
            onNavigate={handleNavigate}
            onOpenAuth={() => handleOpenAuth('login')}
          />
        )}

        {currentPage === 'product-detail' && (
          <ProductDetailPage
            slug={pageParams?.slug}
            onNavigate={handleNavigate}
            onOpenAuth={() => handleOpenAuth('login')}
          />
        )}

        {currentPage === 'checkout' && (
          <CheckoutPage
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'account' && (
          <AccountPage
            initialTab={pageParams?.tab || 'orders'}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'admin' && (
          isAdmin ? (
            <AdminDashboard
              onNavigate={handleNavigate}
            />
          ) : (
            <div className="container mx-auto px-4 py-16 text-center">
              <h2 className="text-xl font-bold text-rose-400 mb-2">Access Restricted</h2>
              <p className="text-xs text-slate-400 mb-4">You need administrative clearance to view this console.</p>
              <button
                onClick={() => handleNavigate('home')}
                className="px-4 py-2 bg-slate-800 text-slate-200 rounded-xl text-xs"
              >
                Return to Circular Home
              </button>
            </div>
          )
        )}
      </main>

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        onCheckout={() => handleNavigate('checkout')}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
