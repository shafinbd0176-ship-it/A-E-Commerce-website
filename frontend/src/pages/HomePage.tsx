import React, { useState, useEffect } from 'react';
import { Product, Category } from '@shared/types/index.js';
import { api } from '../services/api.js';
import { ProductCard } from '../components/ProductCard.js';
import {
  ArrowRight,
  Leaf,
  ShieldCheck,
  Cpu,
  Sparkles,
  RefreshCw,
  Wrench,
  CheckCircle2,
  Zap,
  Award,
  Layers,
  Activity
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenAuth: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenAuth }) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [calcUnits, setCalcUnits] = useState(2);

  useEffect(() => {
    Promise.all([
      api.getProducts({ featured: true, limit: 6 }),
      api.getCategories()
    ]).then(([prodRes, catRes]) => {
      setFeaturedProducts(prodRes.products);
      setCategories(catRes);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:py-24 bg-gradient-to-b from-slate-900 via-slate-900/60 to-transparent">
        {/* Subtle radial glow background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-cyan-500/30 text-cyan-400 text-xs font-mono backdrop-blur-md shadow-glow-cyan">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Next-Generation Circular Hardware & Rebuilt Tech</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Engineered for Performance. <br />
              <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Reconstructed for the Planet.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              SecondLife rescues enterprise servers, vintage audiophile legends, and performance components—meticulously recapped, thermally overhauled, and warrantied for 24 months.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <button
                onClick={() => onNavigate('catalog')}
                className="w-full sm:w-auto px-7 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-glow-cyan flex items-center justify-center gap-2"
              >
                Browse Certified Rigs <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('lifecycle-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition-all border border-slate-700 flex items-center justify-center gap-2"
              >
                <Activity className="w-4 h-4 text-cyan-400" />
                Our Rebuild Pipeline
              </button>
            </div>

            {/* Live Impact Counters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-slate-800/80 max-w-2xl mx-auto text-left">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="text-xl font-bold font-mono text-cyan-400">12,450 kg</div>
                <div className="text-[11px] text-slate-400 font-medium">E-Waste Diverted</div>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="text-xl font-bold font-mono text-emerald-400">186,000 kg</div>
                <div className="text-[11px] text-slate-400 font-medium">CO₂ Emissions Saved</div>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="text-xl font-bold font-mono text-white">72-Hour</div>
                <div className="text-[11px] text-slate-400 font-medium">Torture Stress Test</div>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="text-xl font-bold font-mono text-purple-400">24-Month</div>
                <div className="text-[11px] text-slate-400 font-medium">Comprehensive Warranty</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES OVERVIEW */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="text-xs font-mono uppercase text-cyan-400 tracking-wider">Curated Hardware</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Explore by Rebuild Specialization</h2>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mt-2 md:mt-0"
          >
            View All Categories <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate('catalog', { categoryId: cat.id })}
              className="group p-6 bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-2xl transition-all duration-300 hover:shadow-glow-cyan cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-slate-800 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                  <Cpu className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono text-slate-500 group-hover:text-cyan-400 transition-colors">
                  {cat.productCount || 4} Certified Models
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors mb-1.5">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                Explore Models <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS SHOWCASE */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="text-xs font-mono uppercase text-emerald-400 tracking-wider">Certified Benchmarks</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Featured Reconstructed Equipment</h2>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mt-2 md:mt-0"
          >
            Open Full Catalog <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onSelect={(p) => onNavigate('product-detail', { slug: p.slug })}
                onOpenAuth={onOpenAuth}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. THE 4-STEP REBUILD LIFECYCLE (ARCHITECTURE SHOWCASE) */}
      <section id="lifecycle-section" className="container mx-auto px-4 scroll-mt-24">
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-8 lg:p-12 relative overflow-hidden">
          <div className="max-w-2xl mb-10">
            <div className="text-xs font-mono uppercase text-cyan-400 tracking-wider">Engineering Rigor</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              How We Rebuild Electronics with 0 Compromises
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Every unit goes through our 4-stage artisan restoration and stress validation workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl relative">
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-400 font-mono font-bold flex items-center justify-center text-sm mb-4 border border-cyan-500/20">
                01
              </div>
              <h3 className="font-bold text-white text-sm mb-2">Microscopic Optical & ESR Audit</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated optical inspection, capacitor equivalent series resistance testing, and solder joint thermal imaging.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl relative">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 font-mono font-bold flex items-center justify-center text-sm mb-4 border border-emerald-500/20">
                02
              </div>
              <h3 className="font-bold text-white text-sm mb-2">Ultrasonic Bath & Recapping</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Degreased in precision ultrasonic tanks. Failing electrolytic capacitors upgraded with Japanese Nichicon Gold components.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl relative">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-400 font-mono font-bold flex items-center justify-center text-sm mb-4 border border-purple-500/20">
                03
              </div>
              <h3 className="font-bold text-white text-sm mb-2">Cryo-Thermal Overhaul</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Old thermal paste stripped and upgraded to Thermal Grizzly Kryonaut Extreme + 15W/mK Gelid thermal gap pads.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl relative">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 font-mono font-bold flex items-center justify-center text-sm mb-4 border border-amber-500/20">
                04
              </div>
              <h3 className="font-bold text-white text-sm mb-2">72-Hour Torture Bench</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                72 consecutive hours of FurMark, Prime95, and audio signal analyzer sweeps before individual technician sign-off.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE SUSTAINABILITY CALCULATOR */}
      <section className="container mx-auto px-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-md space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
              <Leaf className="w-3.5 h-3.5" /> Environmental Impact Simulator
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Calculate Your Circular Tech Impact</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choosing reconstructed over brand-new prevents raw mining of silicon, rare-earth metals, and toxic chemical smelting.
            </p>

            <div className="pt-4 space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex justify-between">
                <span>Devices in Your Setup:</span>
                <span className="font-mono text-cyan-400 font-bold">{calcUnits} units</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={calcUnits}
                onChange={(e) => setCalcUnits(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
            <div className="p-6 bg-slate-950 rounded-2xl border border-emerald-500/30 text-center min-w-[170px]">
              <div className="text-3xl font-extrabold font-mono text-emerald-400">
                {(calcUnits * 2.8).toFixed(1)} <span className="text-sm">kg</span>
              </div>
              <div className="text-xs text-slate-300 font-medium mt-1">E-Waste Prevented</div>
              <div className="text-[10px] text-slate-500 mt-1">Directly diverted from landfills</div>
            </div>

            <div className="p-6 bg-slate-950 rounded-2xl border border-cyan-500/30 text-center min-w-[170px]">
              <div className="text-3xl font-extrabold font-mono text-cyan-400">
                {(calcUnits * 48.2).toFixed(0)} <span className="text-sm">kg</span>
              </div>
              <div className="text-xs text-slate-300 font-medium mt-1">CO₂ Prevented</div>
              <div className="text-[10px] text-slate-500 mt-1">Equivalent to 400km driving</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
