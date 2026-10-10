import React, { useState, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  User as UserIcon,
  Leaf,
  ShieldCheck,
  Menu,
  X,
  SlidersHorizontal,
  ChevronDown,
  LogOut,
  Package,
  Headphones,
  Cpu,
  Gamepad2,
  Keyboard,
  HardDrive
} from 'lucide-react';
import { Logo } from './Logo.js';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';
import { Category } from '@shared/types/index.js';
import { api } from '../services/api.js';

interface NavbarProps {
  onNavigate: (page: string, params?: any) => void;
  currentPage: string;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage, onOpenAuth }) => {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('catalog', { search: searchQuery.trim() });
    }
  };

  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Cpu': return <Cpu className="w-4 h-4 text-cyan-400" />;
      case 'Headphones': return <Headphones className="w-4 h-4 text-emerald-400" />;
      case 'Gamepad2': return <Gamepad2 className="w-4 h-4 text-purple-400" />;
      case 'Keyboard': return <Keyboard className="w-4 h-4 text-amber-400" />;
      case 'HardDrive': return <HardDrive className="w-4 h-4 text-blue-400" />;
      default: return <Cpu className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800">
      {/* Top Sustainability Announcement Bar */}
      <div className="bg-gradient-to-r from-cyan-950/70 via-slate-900 to-emerald-950/70 py-1 px-4 border-b border-cyan-500/10 text-[12px] text-slate-300 flex items-center justify-between">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-emerald-400">Zero E-Waste Guarantee:</span>
            <span className="hidden sm:inline">Every unit certified, ultrasonically cleaned & backed by a full warranty.</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button 
              onClick={() => onNavigate('account', { tab: 'support' })}
              className="hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <Headphones className="w-3.5 h-3.5" /> Tech Support & Repairs
            </button>
            {isAdmin && (
              <button
                onClick={() => onNavigate(currentPage === 'admin' ? 'home' : 'admin')}
                className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all flex items-center gap-1"
              >
                <SlidersHorizontal className="w-3 h-3" />
                {currentPage === 'admin' ? 'Exit Admin' : 'Admin Portal'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <button 
          onClick={() => onNavigate('home')} 
          className="focus:outline-none transition-transform hover:scale-[1.02]"
        >
          <Logo size="md" showTagline />
        </button>

        {/* Categories Dropdown & Catalog Link */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={() => onNavigate('catalog')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentPage === 'catalog' ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Explore Catalog
          </button>

          <div className="relative">
            <button
              onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Categories <ChevronDown className={`w-4 h-4 transition-transform ${isCatDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCatDropdownOpen && (
              <div 
                className="absolute left-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2"
                onMouseLeave={() => setIsCatDropdownOpen(false)}
              >
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setIsCatDropdownOpen(false);
                      onNavigate('catalog', { categoryId: cat.id });
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-left text-sm text-slate-300 hover:text-cyan-400 hover:bg-slate-800/80 transition-colors"
                  >
                    <div className="p-1.5 rounded-md bg-slate-800">
                      {getCategoryIcon(cat.iconName)}
                    </div>
                    <div>
                      <div className="font-medium text-slate-200">{cat.name}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[180px]">{cat.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
          <input
            type="text"
            placeholder="Search reconstructed rigs, vintage audio, mods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-full py-1.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Wishlist */}
          <button
            onClick={() => {
              if (!user) onOpenAuth('login');
              else onNavigate('account', { tab: 'wishlist' });
            }}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors relative"
            title="My Saved Items"
          >
            <Heart className="w-5 h-5" />
          </button>

          {/* Cart Drawer Trigger */}
          <button
            onClick={() => {
              if (!user) onOpenAuth('login');
              else setIsCartOpen(true);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700 hover:border-cyan-500/50 relative"
          >
            <ShoppingCart className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-semibold hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-[11px] font-bold text-slate-950 font-mono">
                {itemCount}
              </span>
            )}
          </button>

          {/* User Account / Auth */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center text-slate-950 font-bold text-xs">
                  {user.firstName.charAt(0)}
                </div>
                <span className="text-sm font-medium text-slate-200 hidden md:inline">
                  {user.firstName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:inline" />
              </button>

              {isProfileOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50"
                  onMouseLeave={() => setIsProfileOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-800">
                    <div className="text-xs text-slate-400">Signed in as</div>
                    <div className="text-sm font-semibold text-slate-100 truncate">{user.email}</div>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-cyan-500/10 text-cyan-400 uppercase">
                      {user.role}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onNavigate('account', { tab: 'orders' });
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Package className="w-4 h-4 text-cyan-400" /> My Orders & Rebuilds
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onNavigate('account', { tab: 'support' });
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Headphones className="w-4 h-4 text-emerald-400" /> Support & Repairs
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onNavigate('admin');
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-cyan-400 hover:bg-cyan-950/40 flex items-center gap-2 font-medium"
                    >
                      <SlidersHorizontal className="w-4 h-4" /> Admin Console
                    </button>
                  )}

                  <div className="my-1 border-t border-slate-800"></div>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-rose-400 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all shadow-glow-cyan"
              >
                Join
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-slate-300 hover:text-white lg:hidden"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search reconstructed electronics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-100"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <div className="space-y-1 pt-2">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigate('catalog');
              }}
              className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              Browse All Circular Products
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('catalog', { categoryId: c.id });
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-2"
              >
                {getCategoryIcon(c.iconName)} {c.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
