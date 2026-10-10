import React from 'react';
import { Logo } from './Logo.js';
import { Leaf, ShieldCheck, Wrench, RefreshCw, Heart, Sparkles } from 'lucide-react';

export const Footer: React.FC<{ onNavigate: (page: string, params?: any) => void }> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-sm mt-20">
      {/* Guarantees Ribbon */}
      <div className="border-b border-slate-800 bg-slate-900/50 py-8">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold text-slate-100">Certified Hardware Benchmarking</div>
              <div className="text-xs text-slate-400">72-hr stress & thermal validation</div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold text-slate-100">Zero E-Waste Impact</div>
              <div className="text-xs text-slate-400">Real tracked kg e-waste diverted</div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold text-slate-100">12–24 Month Warranty</div>
              <div className="text-xs text-slate-400">Full parts & labor rebuild coverage</div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold text-slate-100">Circular Trade-In Program</div>
              <div className="text-xs text-slate-400">Send old hardware for credit</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-2 space-y-4">
          <Logo size="lg" showTagline />
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            SecondLife is an artisan engineering collective transforming e-waste, decommissioned enterprise server gear, and vintage classics into high-performance sustainable computing equipment.
          </p>
          <div className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Over 12,400 kg e-waste diverted since founding
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-200 mb-3 text-sm">Circular Catalog</h4>
          <ul className="space-y-2 text-xs">
            <li><button onClick={() => onNavigate('catalog', { categoryId: 'cat-comp' })} className="hover:text-cyan-400 transition-colors">Rebuilt Workstations</button></li>
            <li><button onClick={() => onNavigate('catalog', { categoryId: 'cat-audio' })} className="hover:text-cyan-400 transition-colors">Restored Audiophile</button></li>
            <li><button onClick={() => onNavigate('catalog', { categoryId: 'cat-gaming' })} className="hover:text-cyan-400 transition-colors">Custom Handheld Mods</button></li>
            <li><button onClick={() => onNavigate('catalog', { categoryId: 'cat-peripherals' })} className="hover:text-cyan-400 transition-colors">Repurposed Tech Art</button></li>
            <li><button onClick={() => onNavigate('catalog', { categoryId: 'cat-components' })} className="hover:text-cyan-400 transition-colors">Tested GPU Modules</button></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-slate-200 mb-3 text-sm">Engineering & Trust</h4>
          <ul className="space-y-2 text-xs">
            <li><button onClick={() => onNavigate('account', { tab: 'support' })} className="hover:text-cyan-400 transition-colors">Benchmarking Criteria</button></li>
            <li><button onClick={() => onNavigate('account', { tab: 'support' })} className="hover:text-cyan-400 transition-colors">Ultrasonic Restoration</button></li>
            <li><button onClick={() => onNavigate('account', { tab: 'support' })} className="hover:text-cyan-400 transition-colors">Warranty & Service Policy</button></li>
            <li><button onClick={() => onNavigate('account', { tab: 'support' })} className="hover:text-cyan-400 transition-colors">Hardware Trade-In</button></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-slate-200 mb-3 text-sm">Eco Newsletter</h4>
          <p className="text-xs text-slate-400 mb-3">Get exclusive drops of one-of-a-kind vintage mods and restored batches.</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="engineer@domain.com"
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 flex-1 focus:outline-none focus:border-cyan-500"
            />
            <button className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs transition-colors">
              Join
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>© {new Date().getFullYear()} SecondLife Inc. Built for Circular Hardware Longevity.</div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Privacy & Terms</span>
            <span className="text-slate-400">Security Architecture</span>
            <span className="text-cyan-400">v1.0.0 Modular Monolith</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
