import React, { useState, useEffect } from 'react';
import { Product, Category, ProductCondition } from '@shared/types/index.js';
import { PRODUCT_CONDITIONS } from '@shared/constants/index.js';
import { api } from '../services/api.js';
import { ProductCard } from '../components/ProductCard.js';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Leaf,
  Layers
} from 'lucide-react';

interface CatalogPageProps {
  initialCategoryId?: string;
  initialSearch?: string;
  onNavigate: (page: string, params?: any) => void;
  onOpenAuth: () => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  initialCategoryId,
  initialSearch = '',
  onNavigate,
  onOpenAuth
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryId || '');
  const [selectedCondition, setSelectedCondition] = useState<ProductCondition | ''>('');
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'rating' | 'sustainability'>('newest');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.getProducts({
        page: currentPage,
        limit: 9,
        search: search || undefined,
        categoryId: selectedCategory || undefined,
        condition: selectedCondition ? selectedCondition : undefined,
        maxPrice: maxPrice < 3000 ? maxPrice : undefined,
        inStockOnly,
        sortBy
      });
      setProducts(res.products);
      setTotalPages(res.totalPages);
      setTotalItems(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    loadProducts();
  }, [currentPage, selectedCategory, selectedCondition, inStockOnly, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProducts();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedCondition('');
    setMaxPrice(3000);
    setInStockOnly(false);
    setSortBy('newest');
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase text-cyan-400 tracking-wider">Precision Hardware Catalog</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">Reconstructed & Repurposed Electronics</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse our inventory of bench-certified circular workstations, audiophile systems, and custom mods.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 border border-slate-700"
          >
            <Filter className="w-4 h-4 text-cyan-400" /> Filters
          </button>
        </div>
      </div>

      {/* Main Grid: Filters Sidebar + Products */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* FILTERS SIDEBAR (Desktop) */}
        <aside className="hidden md:block bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-6 sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" /> Filters
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-slate-400 hover:text-cyan-400 font-medium"
            >
              Reset All
            </button>
          </div>

          {/* Search input in sidebar */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search components..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          {/* Categories Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">Category</h4>
            <div className="space-y-1">
              <button
                onClick={() => { setSelectedCategory(''); setCurrentPage(1); }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  selectedCategory === '' ? 'bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setCurrentPage(1); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    selectedCategory === cat.id ? 'bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Condition Grades Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">Craft Condition</h4>
            <div className="space-y-1.5">
              <button
                onClick={() => { setSelectedCondition(''); setCurrentPage(1); }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  selectedCondition === '' ? 'bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                All Conditions
              </button>
              {Object.entries(PRODUCT_CONDITIONS).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => { setSelectedCondition(key as ProductCondition); setCurrentPage(1); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    selectedCondition === key ? 'bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span>{val.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* In-stock toggle */}
          <div className="pt-2 border-t border-slate-800">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => { setInStockOnly(e.target.checked); setCurrentPage(1); }}
                className="rounded accent-cyan-400 bg-slate-950 border-slate-700"
              />
              <span>In-Stock Ready to Ship Only</span>
            </label>
          </div>
        </aside>

        {/* PRODUCTS CONTENT (Right 3 Columns) */}
        <main className="md:col-span-3 space-y-6">
          {/* Sorting & Item Count Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3">
            <div className="text-xs text-slate-400">
              Showing <span className="text-slate-100 font-semibold">{products.length}</span> of{' '}
              <span className="text-slate-100 font-semibold">{totalItems}</span> circular products
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 font-medium"
              >
                <option value="newest">Newest Certified Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Benchmarked Rating</option>
                <option value="sustainability">Maximum E-Waste Saved</option>
              </select>
            </div>
          </div>

          {/* Active Filter Badges */}
          {(selectedCategory || selectedCondition || search || inStockOnly) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 font-mono">Active Filters:</span>
              {selectedCategory && (
                <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-cyan-400 flex items-center gap-1.5">
                  Category: {categories.find(c => c.id === selectedCategory)?.name || selectedCategory}
                  <button onClick={() => setSelectedCategory('')}><X className="w-3 h-3 hover:text-white" /></button>
                </span>
              )}
              {selectedCondition && (
                <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-emerald-400 flex items-center gap-1.5">
                  {PRODUCT_CONDITIONS[selectedCondition]?.label || selectedCondition}
                  <button onClick={() => setSelectedCondition('')}><X className="w-3 h-3 hover:text-white" /></button>
                </span>
              )}
              {search && (
                <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-amber-400 flex items-center gap-1.5">
                  &ldquo;{search}&rdquo;
                  <button onClick={() => setSearch('')}><X className="w-3 h-3 hover:text-white" /></button>
                </span>
              )}
            </div>
          )}

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-slate-500">
                <Layers className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-200">No circular products match your current filters</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try widening your price range, selecting all categories, or searching for other salvaged components.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-glow-cyan"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onSelect={(p) => onNavigate('product-detail', { slug: p.slug })}
                  onOpenAuth={onOpenAuth}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-mono font-semibold transition-colors ${
                    currentPage === idx + 1
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
