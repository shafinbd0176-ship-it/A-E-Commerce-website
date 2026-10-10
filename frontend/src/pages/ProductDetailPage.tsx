import React, { useState, useEffect } from 'react';
import { Product, Review } from '@shared/types/index.js';
import { PRODUCT_CONDITIONS } from '@shared/constants/index.js';
import { api } from '../services/api.js';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Star,
  Leaf,
  ShieldCheck,
  Wrench,
  Cpu,
  ShoppingCart,
  Heart,
  Check,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  Clock,
  RotateCcw
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard.js';

interface ProductDetailPageProps {
  slug: string;
  onNavigate: (page: string, params?: any) => void;
  onOpenAuth: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  slug,
  onNavigate,
  onOpenAuth
}) => {
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  // Review Form Modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');

  const loadProductData = async () => {
    try {
      setLoading(true);
      const prod = await api.getProductBySlugOrId(slug);
      setProduct(prod);

      const [revs, catalogRes] = await Promise.all([
        api.getReviews(prod.id),
        api.getProducts({ categoryId: prod.categoryId, limit: 4 })
      ]);
      setReviews(revs);
      setRelatedProducts(catalogRes.products.filter(p => p.id !== prod.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductData();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!user) {
      onOpenAuth();
      return;
    }

    try {
      setIsAdding(true);
      await addToCart(product.id, quantity);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    try {
      setIsSubmittingReview(true);
      await api.submitReview(product.id, newRating, newTitle, newComment);
      setReviewSuccess('Review submitted! Thank you for contributing to circular electronics feedback.');
      setIsReviewModalOpen(false);
      setNewTitle('');
      setNewComment('');
      // Reload reviews
      const revs = await api.getReviews(product.id);
      setReviews(revs);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Loading circular hardware certification specs...</p>
      </div>
    );
  }

  const conditionConfig = PRODUCT_CONDITIONS[product.condition] || {
    label: product.condition,
    badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    description: 'Certified rebuild'
  };

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ id: '1', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80', alt: product.title, isPrimary: true, sortOrder: 0 }];

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <button onClick={() => onNavigate('home')} className="hover:text-cyan-400">Home</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => onNavigate('catalog')} className="hover:text-cyan-400">Catalog</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-200 truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main Product Hero / Gallery & Buying Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Gallery (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] w-full bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <img
              src={images[selectedImgIndex]?.url || images[0]?.url}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />
            {/* Condition Tag */}
            <div className="absolute top-4 left-4 z-10">
              <span className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg border backdrop-blur-md shadow-sm ${conditionConfig.badgeClass}`}>
                {conditionConfig.label}
              </span>
            </div>

            {/* Eco diverted tag */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-emerald-500/30 text-xs font-mono text-emerald-400">
              <Leaf className="w-4 h-4 text-emerald-400" />
              <span>{product.rebuildInfo?.eWasteDivertedKg || 1.5} kg e-waste diverted</span>
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImgIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImgIndex === idx ? 'border-cyan-400 scale-105' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Buy Box & Specs Summary (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
              <span className="text-cyan-400 uppercase tracking-wider">{product.category?.name}</span>
              <span>SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-3">
              {product.title}
            </h1>

            {/* Ratings Summary */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-200">{product.averageRating || '5.0'}</span>
              <span className="text-xs text-slate-400">({reviews.length} certified reviews)</span>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-baseline justify-between mb-6">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold font-mono text-white">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.originalRetailPrice && (
                    <span className="text-sm text-slate-500 line-through">
                      ${product.originalRetailPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="text-xs text-emerald-400 font-mono mt-0.5">
                  Save ${(product.originalRetailPrice ? (product.originalRetailPrice - product.price) : 0).toFixed(2)} vs new retail
                </div>
              </div>

              <div className="text-right font-mono text-xs">
                <span className={`px-2.5 py-1 rounded-md ${product.stockQuantity > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {product.stockQuantity > 0 ? `${product.stockQuantity} ready to ship` : 'Sold out'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Action Bar */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {/* Quantity selector */}
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 text-sm font-bold"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-mono font-bold text-slate-100">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))}
                    className="px-3 py-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 text-sm font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={product.stockQuantity === 0 || isAdding}
                  className={`flex-1 py-3 px-6 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    justAdded
                      ? 'bg-emerald-500 text-slate-950 shadow-glow-emerald'
                      : product.stockQuantity === 0
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-glow-cyan'
                  }`}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Sustainable Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" /> Add to Circular Cart
                    </>
                  )}
                </button>

                {/* Wishlist */}
                <button
                  onClick={handleToggleWishlist}
                  className="p-3 bg-slate-900 border border-slate-800 hover:border-rose-400/50 rounded-xl text-slate-300 hover:text-rose-400 transition-colors"
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>

              {/* Guarantees Box */}
              <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-2xl space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-slate-200 font-medium">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{product.rebuildInfo?.warrantyMonths || 24}-Month Artisan Warranty</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200 font-medium">
                  <RotateCcw className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>30-Day Hassle-Free Bench Return Guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200 font-medium">
                  <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Carbon-neutral dispatch within 24 hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REBUILD PEDIGREE & SALVAGED SPECIFICATIONS BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
        {/* Rebuild & Salvaged Parts Blueprint */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 text-cyan-400">
            <Wrench className="w-5 h-5" />
            <h3 className="text-lg font-bold text-white">Reconstruction & Circular Blueprint</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80">
              <div className="text-slate-400 font-mono text-[11px] mb-1">Donor Hardware Source</div>
              <div className="text-sm font-semibold text-slate-100">
                {product.rebuildInfo?.originalDonorDevice || 'Enterprise Server Rack Unit'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-emerald-500/20">
                <div className="text-emerald-400 font-bold mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Salvaged & Certified Parts
                </div>
                <ul className="space-y-1 text-slate-300">
                  {(product.rebuildInfo?.salvagedParts || ['Silicon Core', 'VRM Array', 'Aluminum Heatsink']).map((part, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{part}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-cyan-500/20">
                <div className="text-cyan-400 font-bold mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> New Modern Upgrades
                </div>
                <ul className="space-y-1 text-slate-300">
                  {(product.rebuildInfo?.newUpgradesAdded || ['Gen4 NVMe', 'Nichicon Caps', 'Cryo Repaste']).map((upgrade, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>{upgrade}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {product.rebuildInfo?.technicianNotes && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="text-cyan-400 font-semibold mb-1">Technician Bench Validation Log:</div>
                <p className="text-slate-300 italic leading-relaxed">{product.rebuildInfo.technicianNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Full Specifications Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 text-emerald-400">
            <Cpu className="w-5 h-5" />
            <h3 className="text-lg font-bold text-white">Full Technical Specifications</h3>
          </div>

          <div className="divide-y divide-slate-800/80 text-xs">
            {product.specs && product.specs.length > 0 ? (
              product.specs.map((spec, i) => (
                <div key={i} className="py-3 flex justify-between items-center gap-4">
                  <span className="text-slate-400 font-medium">{spec.name}</span>
                  <span className="text-slate-100 font-mono text-right">{spec.value}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-400">Standard certified component specifications apply.</p>
            )}
          </div>
        </div>
      </div>

      {/* VERIFIED CUSTOMER REVIEWS */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white">Verified Customer Experiences</h3>
            <p className="text-xs text-slate-400">Read what builders and audiophiles say about this restored model.</p>
          </div>

          <button
            onClick={() => {
              if (!user) onOpenAuth();
              else setIsReviewModalOpen(true);
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold rounded-xl border border-cyan-500/30 transition-colors"
          >
            Write a Review
          </button>
        </div>

        {reviewSuccess && (
          <div className="p-3 bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
            {reviewSuccess}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="p-5 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                {rev.isVerifiedPurchase && (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Verified Rebuild Owner
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-slate-100">{rev.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{rev.comment}</p>
              <div className="text-[11px] text-slate-500 pt-1">
                By {rev.user?.firstName || 'Hardware Enthusiast'} on {new Date(rev.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RELATED CIRCULAR HARDWARE */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-4">
          <h3 className="text-xl font-bold text-white">Complementary Rebuilt Hardware</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelect={(prod) => onNavigate('product-detail', { slug: prod.slug })}
                onOpenAuth={onOpenAuth}
              />
            ))}
          </div>
        </section>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsReviewModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 z-10 space-y-4">
            <h3 className="text-base font-bold text-white">Review: {product.title}</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className={`p-1.5 rounded-lg ${newRating >= star ? 'text-amber-400' : 'text-slate-600'}`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Review Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flawless thermals and immaculate recapping"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Your Detailed Experience</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the build quality, benchmarks, acoustics, or restoration craft..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
