# SecondLife — Precision Rebuilt & Sustainable Electronics Platform

> **Extending technological lifecycles through artisan hardware reconstruction and circular economy.**

[![Node.js](https://img.shields.io/badge/Node.js-v22+-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.3-cyan.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org)
[![FastAPI](https://img.shields.io/badge/Python-FastAPI-teal.svg)](https://fastapi.tiangolo.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com)

---

## 1. Project Overview
SecondLife is an e-commerce platform and hardware logistics system dedicated to **reconstructed, restored, and creatively repurposed electronics**:
- **Rebuilt Computers & Workstations**: Salvaged enterprise multi-core CPUs/motherboards paired with modern NVMe and cryo cooling.
- **Restored Audiophile Sound**: Vintage receivers recapped with Nichicon Gold components and aptX HD Bluetooth.
- **Custom Handheld Gaming**: Retro consoles modernized with laminated IPS displays, USB-C PD, and LiPo batteries.
- **Repurposed Tech Art**: Cold-war Nixie tube indicators with Wi-Fi NTP sync, CRT casings converted into IPS media hubs.
- **Certified Components**: Stress-tested GPUs with 24-month warranties.

---

## 2. Architecture & Modular Monolith
The codebase is organized as a modular full-stack system:

```text
SecondLife/
├── frontend/                     # Customer Storefront & Admin Portal (React 18 + TS + Tailwind)
│   ├── src/
│   │   ├── components/           # Logo, Navbar, Footer, ProductCard, CartDrawer, AuthModal
│   │   ├── pages/                # HomePage, CatalogPage, ProductDetailPage, CheckoutPage, AccountPage, AdminDashboard
│   │   ├── context/              # AuthContext, CartContext
│   │   ├── services/             # Typed API Client
│   │   └── styles/               # Design system & Tailwind styling
│   └── vite.config.ts
│
├── backend/                      # Core REST API Gateway & Modular Monolith
│   ├── src/
│   │   ├── modules/              # auth, products, categories, cart, orders, payments, reviews, wishlist, support, admin
│   │   ├── database/             # SQLite / PostgreSQL DB Client & Realistic Seeder
│   │   ├── middleware/           # JWT Auth, Role-Based Access, Error Handler, Security Audit Logger
│   │   ├── config/               # Environment configuration
│   │   └── server.ts             # Express Entry Point
│   └── package.json
│
├── services/python/              # Specialized Python Microservices
│   └── recommendation_service/   # FastAPI Content-Based & Semantic Recommendation Engine
│
├── shared/                       # Shared TypeScript Types & Constants
│   ├── types/                    # User, Product, Order, Cart, RebuildMetadata, Health
│   └── constants/                # Brand Palette, Conditions, Seed Taxonomy, Coupons
│
├── database/                     # Schema DDL & Migrations
│   └── schema/schema.sql
│
├── infrastructure/               # Production Containerization
│   ├── docker/                   # Dockerfiles for Backend, Frontend, Python
│   ├── nginx/                    # Reverse Proxy Configuration
│   └── docker-compose.yml
│
├── tests/                        # Automated Integration Tests
│   └── backend/api.test.ts
│
└── docs/                         # Architecture, API & Database Specs
```

---

## 3. Quick Start & Local Execution

### Prerequisites
- Node.js v18+ (Tested on Node v22)
- Python 3.10+ (for optional Recommendation service)

### Step 1 — Install & Seed Database
```bash
# Seed realistic catalog (7 reconstructed products, categories, demo users, reviews, orders)
npm run seed
```

### Step 2 — Start Backend & Frontend Concurrently
```bash
npm run dev
```
- **Customer Storefront**: `http://localhost:3000`
- **Core API Gateway**: `http://localhost:5000/api`
- **Health Check**: `http://localhost:5000/api/health`

---

## 4. Default Demo Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Chief Admin** | `admin@secondlife.tech` | `admin123456` | Full Platform & Telemetry Console |
| **Customer** | `customer@secondlife.tech` | `customer123456` | Storefront, Orders, Wishlist, Support |

*Quick autofill buttons are built directly into the login modal.*

---

## 5. Discount Codes
- `SECONDLIFE10` — 10% Welcome Discount
- `EARTH2026` — 15% Sustainable Electronics Pioneer Discount
- `ZEROEWASTE` — 20% Zero E-Waste Initiative Coupon

---

## 6. Running Integration Tests
```bash
npm run test
```
Verifies health checks, authentication tokens, product serialization, cart operations, payment provider abstractions, and order creation.

---

## 7. Docker Deployment
```bash
docker-compose up --build -d
```
Spins up PostgreSQL 16, Redis 7, Backend REST Gateway, Python Recommendation Microservice, and Frontend Nginx proxy.
