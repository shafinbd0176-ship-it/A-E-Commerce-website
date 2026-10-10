import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from './db.js';
import { CATEGORIES_SEED_DATA } from '../../../shared/constants/index.js';

export async function seedDatabase(): Promise<void> {
  console.log('[Seed] Initializing database schema and seeding realistic dataset...');
  await db.initialize();

  const now = new Date().toISOString();

  // 1. Seed Users
  const salt = await bcrypt.genSalt(10);
  const adminPassHash = await bcrypt.hash('admin123456', salt);
  const customerPassHash = await bcrypt.hash('customer123456', salt);

  const adminId = 'usr-admin-001';
  const customerId = 'usr-cust-001';

  await db.run(
    `INSERT OR REPLACE INTO users (id, email, password_hash, first_name, last_name, role, phone, is_email_verified, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?)`,
    [adminId, 'admin@secondlife.tech', adminPassHash, 'Marcus', 'Vance (Chief Engineer)', 'admin', '+1 (555) 019-2834', now, now]
  );

  await db.run(
    `INSERT OR REPLACE INTO users (id, email, password_hash, first_name, last_name, role, phone, is_email_verified, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?)`,
    [customerId, 'customer@secondlife.tech', customerPassHash, 'Elena', 'Rostova', 'customer', '+1 (555) 042-8819', now, now]
  );

  console.log('[Seed] Default Users Seeded:');
  console.log('       Admin: admin@secondlife.tech / admin123456');
  console.log('       Customer: customer@secondlife.tech / customer123456');

  // 2. Seed Categories
  for (const cat of CATEGORIES_SEED_DATA) {
    await db.run(
      `INSERT OR REPLACE INTO categories (id, name, slug, description, image_url, icon_name, parent_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, null, ?)`,
      [cat.id, cat.name, cat.slug, cat.description, null, cat.iconName, now]
    );
  }
  console.log(`[Seed] Seeded ${CATEGORIES_SEED_DATA.length} Categories.`);

  // 3. Seed Rich Circular Products
  const productsData = [
    {
      id: 'prod-001',
      title: 'SecondLife Titan-X Rebuilt Workstation (Xeon + RTX 3080)',
      slug: 'titan-x-rebuilt-workstation',
      shortDescription: 'Enterprise dual Xeon server core rebuilt into a whisper-quiet liquid-cooled workstation with custom copper heatpipes.',
      description: 'The Titan-X is assembled using high-grade salvaged enterprise server motherboards with 128GB ECC RAM, paired with an ultrasonic-cleaned, thermally repasted RTX 3080 GPU and brand-new PCIe 4.0 NVMe storage. Housed in a custom ventilated open-air recycled aluminum chassis.',
      price: 1199.00,
      originalRetailPrice: 2850.00,
      categoryId: 'cat-comp',
      condition: 'RECONSTRUCTED_MINT',
      stockQuantity: 4,
      sku: 'SL-WRK-001',
      isFeatured: 1,
      specs: [
        { name: 'Processor', value: 'Intel Xeon Gold 6248R 24-Core 48-Thread (Recertified)', group: 'Performance' },
        { name: 'Memory', value: '128GB Quad-Channel DDR4 ECC Registered', group: 'Performance' },
        { name: 'Graphics', value: 'NVIDIA RTX 3080 10GB GDDR6X (Thermal Grizzly repaste + copper shims)', group: 'Performance' },
        { name: 'Storage', value: '2TB Crucial PCIe Gen4 NVMe (Brand New) + 4TB Enterprise SAS HDD', group: 'Performance' },
        { name: 'Chassis', value: 'Anodized Recycled Industrial Aluminum (Zero Plastic Frame)', group: 'Materials' },
        { name: 'Power Supply', value: 'Seasonic 850W Platinum 80+ Modular (Recertified with new Japanese caps)', group: 'Performance' }
      ],
      rebuildInfo: {
        originalDonorDevice: 'Dell PowerEdge R740 Enterprise Rack Unit',
        donorYear: 2021,
        salvagedParts: ['Xeon Gold CPU', 'Server Motherboard VRMs', '128GB ECC RAM', 'SAS Controller'],
        newUpgradesAdded: ['Gen4 NVMe SSD', 'Cryo-Loop Custom Liquid Cooling', 'Bespoke CNC Aluminum Desktop Case'],
        eWasteDivertedKg: 14.2,
        co2SavedKg: 240.5,
        benchmarksScore: 'Cinebench R23: 31,450 pts (Thermals max 62°C under full load)',
        technicianNotes: 'Complete ultrasonic bath, capacitor ESR testing passed within 0.2% tolerance, 72-hour Prime95 torture run certified.',
        warrantyMonths: 24
      },
      images: [
        { url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80', alt: 'SecondLife Titan-X Workstation Chassis', isPrimary: 1 }
      ]
    },
    {
      id: 'prod-002',
      title: 'AeroAcoustic 1978 Pioneer SX-780 Bluetooth Modernized Receiver',
      slug: 'pioneer-sx780-bluetooth-modernized',
      shortDescription: 'Vintage 1978 silver-face receiver completely recapped with Nichicon Gold capacitors and lossless aptX HD Bluetooth 5.2.',
      description: 'A masterpiece of audio history. We salvaged this SX-780 from an estate clearing, replaced all failing electrolytic capacitors with audiophile Nichicon Fine Gold components, upgraded the incandescent dial lamps with soft warm LEDs, and discreetly integrated an isolated aptX-HD DAC behind the auxiliary tape loop.',
      price: 649.00,
      originalRetailPrice: 1200.00,
      categoryId: 'cat-audio',
      condition: 'EXCELLENT_RESTORED',
      stockQuantity: 2,
      sku: 'SL-AUD-780',
      isFeatured: 1,
      specs: [
        { name: 'Power Output', value: '45 Watts per channel into 8 ohms (Pure Analog Class AB)', group: 'Audio' },
        { name: 'Wireless Audio', value: 'Qualcomm QCC5125 Bluetooth 5.2 (LDAC, aptX HD, AAC)', group: 'Connectivity' },
        { name: 'Capacitors', value: '100% Recapped with Nichicon FG & WIMA film caps', group: 'Materials' },
        { name: 'Cabinet', value: 'Original Walnut Veneer, hand-rubbed with natural tung oil', group: 'Materials' }
      ],
      rebuildInfo: {
        originalDonorDevice: 'Pioneer SX-780 Stereo Receiver (1978)',
        donorYear: 1978,
        salvagedParts: ['Original Solid Aluminum Faceplate', 'Transformer Core', 'Analog VU Meters', 'Tuning Flywheel'],
        newUpgradesAdded: ['Nichicon Gold Capacitors', 'Qualcomm aptX HD Bluetooth Subsystem', 'Warm Tint LED Illumination'],
        eWasteDivertedKg: 11.8,
        co2SavedKg: 95.0,
        benchmarksScore: 'THD: 0.04% @ full rated power, Signal-to-Noise: 98dB',
        technicianNotes: 'All potentiometers deoxidized with Caig DeoxIT D5. Bias and DC offset adjusted to factory spec (0.2mV).',
        warrantyMonths: 18
      },
      images: [
        { url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80', alt: 'Pioneer SX-780 Restored Faceplate', isPrimary: 1 }
      ]
    },
    {
      id: 'prod-003',
      title: 'GameBoy Advance SP "Cyber-Luminescence" IPS & USB-C Mod',
      slug: 'gameboy-advance-sp-cyber-mod',
      shortDescription: 'Original salvaged Nintendo motherboard fitted with Hispeedido V5 IPS display, USB-C PD charging, and 1200mAh LiPo.',
      description: 'We rescued discarded GameBoy Advance SP boards with damaged screens and cracked plastic shells. Cleaned and reflowed the CPU/RAM, added an ultra-vibrant IPS laminated screen with 15 brightness levels and scanline modes, installed a USB-C charging port with power delivery, and encased it in clear CNC machined polycarbonate.',
      price: 189.00,
      originalRetailPrice: 240.00,
      categoryId: 'cat-gaming',
      condition: 'CREATIVE_REPURPOSED',
      stockQuantity: 7,
      sku: 'SL-GBA-092',
      isFeatured: 1,
      specs: [
        { name: 'Screen', value: '3.0" IPS Laminated V5 4x Resolution with Pixel Grid Simulation', group: 'Display' },
        { name: 'Charging', value: 'USB Type-C PD Fast Charge (Safe 5V 1A stepdown)', group: 'Connectivity' },
        { name: 'Battery', value: 'Makho 1200mAh Long-Life Rechargeable Lithium Polymer', group: 'General' },
        { name: 'Audio', value: 'Upgraded PAM8302A Class D Amplifier & CleanPower filter', group: 'Audio' }
      ],
      rebuildInfo: {
        originalDonorDevice: 'Nintendo GameBoy Advance SP AGS-001 (Broken Shell & Polarizer)',
        donorYear: 2003,
        salvagedParts: ['Original Nintendo CPU/SoC', 'Original Cartridge Slot', 'Link Port Daughterboard'],
        newUpgradesAdded: ['Hispeedido IPS Panel', 'USB-C Power Circuit', 'Tactile Clicky Microswitches', '1200mAh Cell'],
        eWasteDivertedKg: 0.35,
        co2SavedKg: 14.8,
        technicianNotes: 'Power switch ultrasonic cleaned and tensioned. Cartridge pins gold-polished for zero read errors.',
        warrantyMonths: 12
      },
      images: [
        { url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80', alt: 'Rebuilt Modernized GameBoy SP', isPrimary: 1 }
      ]
    },
    {
      id: 'prod-004',
      title: 'Cold-War Era IN-14 Nixie Tube Smart Desk Clock',
      slug: 'nixie-tube-smart-clock',
      shortDescription: 'Authentic 1980s new-old-stock military IN-14 neon tubes paired with modern ESP32 Wi-Fi NTP synchronization.',
      description: 'Crafted with authentic salvaged Soviet IN-14 cold cathode display tubes that glow with a distinct, hypnotic neon orange warmth. Powered by a custom ESP32 microcontroller with Wi-Fi network time sync, RGB cathode backlighting, slot machine anti-poisoning cycling, and USB-C power delivery.',
      price: 279.00,
      originalRetailPrice: 420.00,
      categoryId: 'cat-peripherals',
      condition: 'CREATIVE_REPURPOSED',
      stockQuantity: 5,
      sku: 'SL-NX-014',
      isFeatured: 1,
      specs: [
        { name: 'Tubes', value: '6x Authentic IN-14 Gas Discharge Neon Tubes (Tested >20,000 hrs lifespan)', group: 'Display' },
        { name: 'Controller', value: 'ESP32 Dual-Core with Automatic Wi-Fi NTP Time Sync', group: 'Performance' },
        { name: 'Base Materials', value: 'Reclaimed Solid Teak & Sandblasted Brass Faceplate', group: 'Materials' },
        { name: 'Power Input', value: '5V USB-C with 170V High-Efficiency Boost Converter', group: 'General' }
      ],
      rebuildInfo: {
        originalDonorDevice: '1984 Industrial Instrumentation Inventory & Reclaimed Workshop Teak',
        donorYear: 1984,
        salvagedParts: ['6x IN-14 Neon Indicator Tubes', 'Vintage Brass Toggle Switches'],
        newUpgradesAdded: ['ESP32 Controller PCB', 'High-Efficiency DC-DC 170V Boost Board', 'Capacitive Touch Snooze'],
        eWasteDivertedKg: 1.2,
        co2SavedKg: 28.0,
        technicianNotes: 'Every tube tested on high-voltage cathode tester for gas purity and brightness uniformity.',
        warrantyMonths: 12
      },
      images: [
        { url: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=800&q=80', alt: 'Nixie Tube Smart Clock', isPrimary: 1 }
      ]
    },
    {
      id: 'prod-005',
      title: 'Certified Restored NVIDIA GeForce RTX 3070 Ti (Thermal Grizzly Overhaul)',
      slug: 'certified-rtx-3070-ti-overhaul',
      shortDescription: 'Industrial stress-tested 8GB GDDR6X graphics card fitted with Gelid Extreme thermal pads and Kryonaut paste.',
      description: 'Every component on this GPU underwent automated optical inspection and thermal camera analysis under a 24-hour FurMark stress bench. Fan bearings were lubricated with synthetic high-speed oil, VRM chokes thermal-paddled, and memory junction temperatures reduced by an average of 18°C over stock.',
      price: 389.00,
      originalRetailPrice: 599.00,
      categoryId: 'cat-components',
      condition: 'PERFORMANCE_REFURBISHED',
      stockQuantity: 8,
      sku: 'SL-GPU-3070TI',
      isFeatured: 0,
      specs: [
        { name: 'CUDA Cores', value: '6144 Cores @ 1770 MHz Boost', group: 'Performance' },
        { name: 'VRAM', value: '8GB GDDR6X 256-bit (Operating at cool 72°C junction temp)', group: 'Performance' },
        { name: 'Thermal Solution', value: 'Gelid Ultimate 15W/mK Pads + Thermal Grizzly Kryonaut Extreme', group: 'Materials' },
        { name: 'Display Outputs', value: '3x DisplayPort 1.4a, 1x HDMI 2.1', group: 'Connectivity' }
      ],
      rebuildInfo: {
        originalDonorDevice: 'Recertified Compute Station GPU',
        donorYear: 2022,
        salvagedParts: ['RTX 3070 Ti PCB', 'GA104 Die', 'Heatsink Fin Stack', 'Reinforced Backplate'],
        newUpgradesAdded: ['15W/mK High-Conduction Thermal Pads', 'Dual Ball-Bearing Replacement Fans'],
        eWasteDivertedKg: 1.6,
        co2SavedKg: 64.0,
        benchmarksScore: '3DMark TimeSpy Graphics: 15,120 (Top 5% thermal curve)',
        technicianNotes: 'PCIe lane impedances verified. BIOS flashed with latest stable manufacturer microcode.',
        warrantyMonths: 18
      },
      images: [
        { url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80', alt: 'Restored RTX 3070 Ti GPU', isPrimary: 1 }
      ]
    },
    {
      id: 'prod-006',
      title: 'Vintage Macintosh Classic II "Mac-Pi" Mini Media Server',
      slug: 'vintage-macintosh-classic-ii-mac-pi',
      shortDescription: '1991 Macintosh CRT shell converted into a color IPS retro gaming and streaming station with Raspberry Pi 5.',
      description: 'We took a non-repairable 1991 Macintosh Classic II casing with battery corrosion damage, preserved the exterior patina, installed a high-density 8-inch 4:3 color IPS display in place of the dead CRT, and integrated a Raspberry Pi 5 (8GB) with retro gaming emulators, Plex media client, and stereo speaker system.',
      price: 499.00,
      originalRetailPrice: 899.00,
      categoryId: 'cat-peripherals',
      condition: 'CREATIVE_REPURPOSED',
      stockQuantity: 3,
      sku: 'SL-MAC-1991',
      isFeatured: 1,
      specs: [
        { name: 'Display', value: '8" 1024x768 4:3 IPS Screen with CRT Curved Bezel Adapter', group: 'Display' },
        { name: 'Compute Core', value: 'Raspberry Pi 5 8GB Quad-Core 2.4GHz Cortex-A76', group: 'Performance' },
        { name: 'Storage', value: '256GB High-Endurance NVMe via PCIe HAT', group: 'Performance' },
        { name: 'Connectivity', value: 'Dual-Band Wi-Fi 6, Bluetooth 5.0, Gigabit Ethernet, 2x USB 3.0', group: 'Connectivity' }
      ],
      rebuildInfo: {
        originalDonorDevice: 'Apple Macintosh Classic II (Dead Motherboard & Damaged Flyback)',
        donorYear: 1991,
        salvagedParts: ['Original 1991 Polycarbonate Enclosure', 'Internal Metal Subframe', 'Rear Port Moldings'],
        newUpgradesAdded: ['Custom 3D-Printed CRT Frame', 'Raspberry Pi 5 8GB', 'Dayton Audio Micro Drivers'],
        eWasteDivertedKg: 7.3,
        co2SavedKg: 88.0,
        technicianNotes: 'Safely discharged and recycled hazardous CRT cathode tube at certified facility. Internal 3W speakers custom equalized.',
        warrantyMonths: 12
      },
      images: [
        { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', alt: 'Macintosh Repurposed Retro Station', isPrimary: 1 }
      ]
    },
    {
      id: 'prod-007',
      title: 'AeroSenn HD600 "AeroRestored" Reference Studio Headphones',
      slug: 'sennheiser-hd600-aerorestored',
      shortDescription: 'Legendary Sennheiser open-back dynamic drivers rebuilt with custom carbon headband and memory foam velour pads.',
      description: 'The Sennheiser HD600 is an audiophile icon. We salvaged units with snapped headbands and disintegrated acoustic foam, precision-matched the driver impedances to within 0.1dB, installed custom carbon-fiber reinforced headbands, and fitted breathable high-density velour ear cushions with detachable OFC silver-plated cables.',
      price: 299.00,
      originalRetailPrice: 449.00,
      categoryId: 'cat-audio',
      condition: 'EXCELLENT_RESTORED',
      stockQuantity: 6,
      sku: 'SL-AUD-HD600',
      isFeatured: 0,
      specs: [
        { name: 'Driver Type', value: '300-Ohm Hand-Matched Dynamic Transducers (Salvation Tested)', group: 'Audio' },
        { name: 'Frequency Response', value: '12 Hz - 39,000 Hz', group: 'Audio' },
        { name: 'Cable', value: 'Custom 2.0m Braided Silver-Plated Oxygen-Free Copper (3.5mm + 6.35mm adapter)', group: 'Connectivity' },
        { name: 'Pads', value: 'AeroVelour High-Density Memory Foam (Hypoallergenic)', group: 'Materials' }
      ],
      rebuildInfo: {
        originalDonorDevice: 'Sennheiser HD600 (Damaged Headband and Broken Yoke)',
        donorYear: 2018,
        salvagedParts: ['Original 300-Ohm Drivers', 'Metal Mesh Grilles', 'Driver Baffles'],
        newUpgradesAdded: ['Carbon-Reinforced Polycarbonate Headband', 'Custom Braided OFC Cable', 'Premium Memory Foam'],
        eWasteDivertedKg: 0.55,
        co2SavedKg: 22.0,
        benchmarksScore: 'Acoustic Frequency Sweep: <0.05% THD @ 1kHz, 0.1dB Channel Balance',
        technicianNotes: 'Drivers cleaned under stereomicroscope to remove all hair and dust fibers from diaphragms.',
        warrantyMonths: 24
      },
      images: [
        { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', alt: 'Restored Audiophile Studio Headphones', isPrimary: 1 }
      ]
    }
  ];

  for (const prod of productsData) {
    await db.run(
      `INSERT OR REPLACE INTO products (
        id, title, slug, short_description, description, price, original_retail_price,
        category_id, condition, stock_quantity, sku, is_featured, is_archived,
        rebuild_info_json, specs_json, average_rating, review_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 4.9, 8, ?, ?)`,
      [
        prod.id,
        prod.title,
        prod.slug,
        prod.shortDescription,
        prod.description,
        prod.price,
        prod.originalRetailPrice,
        prod.categoryId,
        prod.condition,
        prod.stockQuantity,
        prod.sku,
        prod.isFeatured,
        JSON.stringify(prod.rebuildInfo),
        JSON.stringify(prod.specs),
        now,
        now
      ]
    );

    // Images
    for (let i = 0; i < prod.images.length; i++) {
      const img = prod.images[i];
      await db.run(
        `INSERT OR REPLACE INTO product_images (id, product_id, url, alt, is_primary, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [`img-${prod.id}-${i}`, prod.id, img.url, img.alt, img.isPrimary, i]
      );
    }
  }
  console.log(`[Seed] Seeded ${productsData.length} Reconstructed & Repurposed Products.`);

  // 4. Seed Reviews
  const reviewsData = [
    {
      id: 'rev-001',
      productId: 'prod-001',
      userId: customerId,
      rating: 5,
      title: 'Incredible workstation, whisper quiet under 3D renders!',
      comment: 'I was blown away by the craftsmanship. The thermals are better than my brand-new custom rig, and knowing this saved 14kg of enterprise e-waste made the purchase feel truly meaningful.'
    },
    {
      id: 'prod-002-rev',
      productId: 'prod-002',
      userId: customerId,
      rating: 5,
      title: 'Warm vintage tone with zero hiss or noise floor',
      comment: 'The recapped Pioneer SX-780 looks like it was manufactured yesterday. The integrated aptX HD Bluetooth connects instantly to my phone and the analog VU meters dance effortlessly.'
    },
    {
      id: 'prod-003-rev',
      productId: 'prod-003',
      userId: customerId,
      rating: 5,
      title: 'The IPS screen and USB-C port make this the ultimate GBA',
      comment: 'Playing Pokemon and Metroid Fusion on this vibrant IPS panel is night and day compared to the original 2003 frontlight. USB-C charging is super convenient.'
    }
  ];

  for (const rev of reviewsData) {
    await db.run(
      `INSERT OR REPLACE INTO reviews (id, product_id, user_id, rating, title, comment, is_verified_purchase, is_approved, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?, ?)`,
      [rev.id, rev.productId, rev.userId, rev.rating, rev.title, rev.comment, now, now]
    );
  }

  // 5. Seed Support Ticket
  const ticketId = 'tkt-seed-001';
  await db.run(
    `INSERT OR REPLACE INTO support_tickets (id, ticket_number, user_id, subject, category, priority, status, created_at, updated_at)
     VALUES (?, 'TKT-849201', ?, 'Custom GPU thermal repasting request for personal card', 'TECHNICAL_ASSISTANCE', 'MEDIUM', 'OPEN', ?, ?)`,
    [ticketId, customerId, now, now]
  );

  await db.run(
    `INSERT OR REPLACE INTO support_messages (id, ticket_id, sender_id, sender_role, sender_name, message, created_at)
     VALUES (?, ?, ?, 'customer', 'Elena Rostova', 'Hi SecondLife Team, do you offer thermal overhaul services for customer-provided RTX 3090 cards? Would love your certified Kryonaut repaste service.', ?)`,
    ['msg-seed-001', ticketId, customerId, now]
  );

  console.log('[Seed] Database seeding completed successfully.');
}

// Allow direct execution
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedDatabase().catch((err) => {
    console.error('[Seed Error]', err);
    process.exit(1);
  });
}
