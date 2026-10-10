import React, { useState } from 'react';
import { Product } from '@shared/types/index.js';
import { PRODUCT_CONDITIONS } from '@shared/constants/index.js';
import { ShoppingCart, Heart, Star, Leaf, Sparkles, Check } from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onOpenAuth: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, onOpenAuth }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const conditionConfig = PRODUCT_CONDITIONS[product.condition] || {
    label: product.condition,
    badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
  };

  const primaryImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80';

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      onOpenAuth();
      return;
    }

    try {
      setIsAdding(true);
      await addToCart(product.id, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      onOpenAuth();
      return;
    }

    try {
      const res = await api.toggleWishlist(product.id);
      setInWishlist(res.inWishlist);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-glow-cyan hover:-translate-y-1 flex flex-col cursor-pointer"
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-[4/3] w-full bg-slate-950 overflow-hidden">
        <img
          src={primaryImage}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Condition Tag */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span className={`px-2.5 py-1 text-[11px] font-mono font-semibold rounded-md border backdrop-blur-md shadow-sm ${conditionConfig.badgeClass}`}>
            {conditionConfig.label}
          </span>
          {product.isFeatured && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/90 text-slate-950 flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3" /> Certified Masterpiece
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-rose-400 hover:border-rose-400/50 transition-colors z-10"
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* E-Waste Diverted Metric Ribbon */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/85 backdrop-blur-md border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <span>{product.rebuildInfo?.eWasteDivertedKg || 1.5} kg saved</span>
          </div>

          <div className="text-[11px] text-slate-300 bg-slate-950/80 px-2 py-1 rounded-md backdrop-blur-md font-mono">
            {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Sold out'}
          </div>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-mono text-cyan-400/90 uppercase tracking-wider text-[10px]">
              {product.category?.name || 'Rebuilt Hardware'}
            </span>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-slate-200">{product.averageRating || '5.0'}</span>
              <span className="text-slate-500">({product.reviewCount || 12})</span>
            </div>
          </div>

          <h3 className="font-semibold text-slate-100 text-base group-hover:text-cyan-400 transition-colors line-clamp-2 mb-2 leading-snug">
            {product.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
            {product.shortDescription}
          </p>
        </div>

        {/* Pricing & Add to Cart Footer */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold font-mono text-white">
                ${product.price.toFixed(2)}
              </span>
              {product.originalRetailPrice && (
                <span className="text-xs text-slate-500 line-through">
                  ${product.originalRetailPrice.toFixed(2)}
                </span>
              )}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono">
              {product.rebuildInfo?.warrantyMonths || 12}mo warranty included
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stockQuantity === 0 || isAdding}
            className={`p-2.5 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-all ${
              justAdded
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : product.stockQuantity === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-glow-cyan'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4" /> Added
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
