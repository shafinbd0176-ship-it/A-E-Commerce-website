/**
 * SecondLife - Core Shared Constants and Configuration Values
 */

export const BRAND = {
  name: 'SecondLife',
  tagline: 'Precision Rebuilt, Reimagined & Repurposed Electronics',
  mission: 'Extending technological lifecycles through artisan engineering and circular economy.',
  theme: {
    primary: '#06b6d4',      // Electric Cyan Accent (10%)
    primaryHover: '#0891b2',
    secondary: '#1e293b',    // Slate/Charcoal (30%)
    background: '#0f172a',   // Dark mode slate-900 / Light mode soft gray (60%)
    textPrimary: '#f8fafc',
    textMuted: '#94a3b8',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444'
  }
} as const;

export const PRODUCT_CONDITIONS = {
  RECONSTRUCTED_MINT: {
    label: 'Reconstructed Mint',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    description: 'Completely rebuilt with brand new high-grade modern internals. 0 cosmetic flaws.'
  },
  EXCELLENT_RESTORED: {
    label: 'Precision Restored',
    badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    description: 'Cleaned, ultrasonic-treated, capacitors replaced, thermally repasted & stress tested.'
  },
  CREATIVE_REPURPOSED: {
    label: 'Artisan Repurposed',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    description: 'Iconic vintage tech chassis transformed into modern functional high-end tech.'
  },
  PERFORMANCE_REFURBISHED: {
    label: 'Performance Refurbished',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    description: 'Tested, restored and certified for maximum computing reliability and longevity.'
  }
} as const;

export const CATEGORIES_SEED_DATA = [
  {
    id: 'cat-comp',
    name: 'Rebuilt Computers & Workstations',
    slug: 'computers-workstations',
    description: 'High-performance rigs built with salvaged enterprise hardware and modern GPUs.',
    iconName: 'Cpu'
  },
  {
    id: 'cat-audio',
    name: 'Restored Audiophile & Sound',
    slug: 'audiophile-sound',
    description: 'Vintage high-fidelity amplifiers, recapped studio monitors, and customized planar headphones.',
    iconName: 'Headphones'
  },
  {
    id: 'cat-gaming',
    name: 'Custom Retro & Handheld Gaming',
    slug: 'gaming-consoles',
    description: 'Retro game hardware upgraded with IPS backlights, USB-C power delivery, and flash audio.',
    iconName: 'Gamepad2'
  },
  {
    id: 'cat-peripherals',
    name: 'Repurposed Peripherals & Tech Art',
    slug: 'peripherals-art',
    description: 'Mechanical keyboards with salvaged vintage switches, Nixie clocks from old avionics, and smart lamps.',
    iconName: 'Keyboard'
  },
  {
    id: 'cat-components',
    name: 'Tested Components & Mod Modules',
    slug: 'components-modules',
    description: 'Stress-bench tested GPUs, memory kits, and upgraded power supplies with 1-year warranty.',
    iconName: 'HardDrive'
  }
] as const;

export const DISCOUNT_CODES: Record<string, { percent: number; description: string }> = {
  'SECONDLIFE10': { percent: 10, description: '10% Welcome Discount for circular economy supporters' },
  'EARTH2026': { percent: 15, description: '15% Sustainable Electronics Pioneer Discount' },
  'ZEROEWASTE': { percent: 20, description: '20% Zero E-Waste Initiative Coupon' }
};

export const SUSTAINABILITY_FACTORS = {
  avgEWastePerItemKg: 2.4,
  avgCO2SavedPerItemKg: 38.5,
  calculateEWaste(itemsCount: number, customKg?: number): number {
    return customKg ? Number(customKg.toFixed(2)) : Number((itemsCount * this.avgEWastePerItemKg).toFixed(2));
  },
  calculateCO2(itemsCount: number, customKg?: number): number {
    return customKg ? Number(customKg.toFixed(2)) : Number((itemsCount * this.avgCO2SavedPerItemKg).toFixed(2));
  }
};
