# MarketBridge — Multi-Vendor Wholesale & B2B/B2C Marketplace

[![React](https://img.shields.io/badge/Frontend-React%2019-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Bundler-Vite%208-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38bdf8.svg)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%2020%20%2B%20Express-green.svg)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MySQL%208.0-orange.svg)](https://www.mysql.com/)
[![Security Audited](https://img.shields.io/badge/Security-Hardened%20%26%20Audited-brightgreen.svg)]()
[![Tests](https://img.shields.io/badge/Tests-Passing%20(70%20assertions)-success.svg)]()

MarketBridge is an enterprise-grade multi-vendor marketplace platform built for B2B wholesale and direct-to-consumer e-commerce. It features tiered bulk pricing, custom quotation negotiations, verified vendor onboarding, role-based dashboards (Buyer, Vendor, Administrator), Razorpay payment lifecycle integration, automated stock restoration, and hardened application security.

---

## Table of Contents

- [Architecture & Tech Stack](#architecture--tech-stack)
- [Key Features](#key-features)
- [Pre-configured Demo Accounts](#pre-configured-demo-accounts)
- [Quick Start](#quick-start)
  - [Option 1: Docker Compose (Recommended)](#option-1-docker-compose-recommended)
  - [Option 2: Manual Local Setup](#option-2-manual-local-setup)
- [Deployment Guide](#deployment-guide)
  - [Frontend Deployment (Vercel / Netlify)](#frontend-deployment-vercel--netlify)
  - [Backend Deployment (Render / Railway / VPS)](#backend-deployment-render--railway--vps)
  - [Database Deployment (Managed MySQL)](#database-deployment-managed-mysql)
- [Security Hardening & Audit Highlights](#security-hardening--audit-highlights)
- [Running Automated Tests](#running-automated-tests)
- [Environment Variables Reference](#environment-variables-reference)
- [API Overview](#api-overview)

---

## Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 React 19 + Vite Frontend                    │
│   Tailwind CSS v4 • Lucide Icons • Client Mock Fallback     │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST APIs (Bearer JWT)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  Node.js + Express Backend                  │
│  Rate Limiting • Helmet • Role Middleware • Input Zod Valid │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      MySQL 8 Database        │ │      Payment Gateway       │
│ Row-Level Locking • ACID Tx  │ │  Razorpay API & Webhooks   │
│ Composite Query Indexes      │ │  HMAC SHA256 Verification  │
└──────────────────────────────┘ └────────────────────────────┘
```

- **Frontend**: React 19, Vite 8, Tailwind CSS v4, Lucide React, React Router 7. Zero-downtime mock adapter fallback for client-side preview.
- **Backend**: Node.js 20, Express 4, mysql2 with connection pooling, JWT authentication, bcrypt password hashing, Zod schema validation.
- **Database**: MySQL 8.0 with InnoDB, composite indexes, relational foreign keys, and migration runner.
- **Payment & Storage**: Razorpay payments & refunds integration, local persistent file storage + Cloudinary API integration.

---

## Key Features

1. **Multi-Role Portals**: Dedicated workspaces and views for **Buyers**, **Vendors**, and **Administrators**.
2. **Wholesale Pricing Tiers**: Minimum Order Quantity (MOQ) enforcement and automatic bulk tier discount calculation.
3. **RFQ / Quote Negotiation**: Buyers can submit custom price quotations and quantities; vendors can accept, counter, or decline.
4. **Resilient Checkout & Payments**:
   - Server-side Razorpay order intent tracking with buyer association.
   - Cryptographic signature validation and captured payment status checks.
   - Prevention of payment transaction ID reuse across multiple checkouts.
5. **Order Cancellation & Automatic Stock Recovery**:
   - Order cancellations execute in database transactions, automatically restoring inventory (`stock = stock + qty`).
   - Automatically generates idempotent refund records integrated with Razorpay's refund API.
6. **Vendor Balance & Concurrency-Safe Payouts**:
   - Financial ledger tracking gross sales, platform commissions, and net earnings.
   - Payout requests use database row-level locking (`SELECT ... FOR UPDATE`) to prevent race-condition balance overdrafts.
7. **Persistent Image Asset Management**:
   - Built-in persistent file storage with strict MIME type and 5MB size validation.
   - Drop-in support for Cloudinary object storage.

---

## Pre-configured Demo Accounts

When database seeding is executed, the following accounts are initialized with password: `DemoPass123!`

| Role | Email | Name | Capabilities |
|------|-------|------|--------------|
| **Admin** | `demo-admin@marketbridge.example` | Priya Sundaram | Approve vendors, manage catalog, manage refunds, system settings |
| **Vendor** | `demo-vendor@marketbridge.example` | Rajesh Kumar | Manage inventory, bulk tiers, review orders, respond to quotes, request payouts |
| **Buyer** | `demo-buyer@marketbridge.example` | Anita Rao | Browse catalog, add to cart, checkout with Razorpay/COD, request quotes, track orders |

*(Note: In non-production environments with `ALLOW_DEMO_LOGIN=true`, users can also switch roles instantly using the demo login buttons in the UI).*

---

## Quick Start

### Option 1: Docker Compose (Recommended)

Run the full stack (MySQL 8 database + backend API + Nginx frontend) in a single command:

```bash
docker compose up --build
```

- **Frontend**: http://localhost (port 80)
- **Backend API**: http://localhost:4000/api
- **Database**: localhost:3306

The container automatically runs database migrations and seeds initial demo data on startup.

---

### Option 2: Manual Local Setup

#### Prerequisites
- Node.js 18+ or 20+
- MySQL 8.0+ running locally on port 3306

#### Step 1: Clone Repository
```bash
git clone https://github.com/pruthivi1/ecommerce.git
cd ecommerce
```

#### Step 2: Configure Environment Files
Copy sample configuration files:
```bash
cp .env.example .env
cp backend/.env.example backend/.env
```
Edit `backend/.env` with your local MySQL credentials (`DATABASE_USER`, `DATABASE_PASSWORD`, etc.).

#### Step 3: Install Dependencies
```bash
# Install root (frontend) dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..
```

#### Step 4: Run Migrations and Seed Database
```bash
npm run db:migrate
npm run db:seed
```

#### Step 5: Start Development Servers
You can run both frontend and backend concurrently:
```bash
npm run dev:all
```
Or start them in separate terminals:
```bash
# Terminal 1: Backend (http://localhost:4000)
npm run dev:backend

# Terminal 2: Frontend (http://localhost:5173)
npm run dev
```

---

## Deployment Guide

For full production deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

### Frontend Deployment (Vercel / Netlify)

The frontend is ready for instant deployment on Vercel or Netlify.

#### Vercel
1. Import repository in your Vercel Dashboard.
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Environment Variables:
   - `VITE_API_BASE_URL`: `https://your-backend-api-domain.com/api`
6. `vercel.json` is already included to handle SPA routing redirects (`/(.*)` -> `/index.html`).

---

### Backend Deployment (Render / Railway / VPS)

#### Render (Blueprint Setup)
`render.yaml` is pre-configured in the repository:
1. Connect your GitHub repository in Render.
2. Select **Blueprints**. Render will auto-detect `render.yaml`.
3. Fill in database credentials.
4. Set `FRONTEND_URL` to your Vercel or custom frontend domain.

#### Railway / Heroku / Dokku
- Buildpack: Node.js
- Root directory: `backend/`
- Start Command: `npm start`
- Pre-deploy Command: `npm run migrate`

---

### Database Deployment (Managed MySQL)

1. Provision MySQL 8 on AWS RDS, PlanetScale, DigitalOcean, or Aiven.
2. Run database migrations:
   ```bash
   NODE_ENV=production DATABASE_HOST=your-rds-host.com DATABASE_USER=admin DATABASE_PASSWORD=secret npm run db:migrate
   ```
3. Set `DATABASE_SSL=true` in production environment variables.

---

## Security Hardening & Audit Highlights

The application was audited and hardened against OWASP Top 10 vulnerabilities:

1. **Public Vendor Data Sanitization**: Public supplier endpoints (`/api/suppliers`, `/api/suppliers/:id`) strictly strip sensitive information (bank accounts, IFSC, UPI handles, director names, private documents, commission rates) and mask GST numbers to standard compliance format (`24AAAAA****1Z5`).
2. **Vendor Product IDOR Remediation**: Enforced database ownership validation in `productService.js`. Vendor A cannot read, edit, adjust stock, or toggle status of Vendor B's inventory (returns `403 Forbidden`).
3. **Razorpay Payment Integrity**:
   - Backend creates and signs Razorpay orders with internal buyer ID association.
   - Signatures are verified using cryptographic timing-safe comparisons.
   - Payment capture status and amounts are checked against server-calculated totals.
   - Payment transaction IDs cannot be reused across multiple checkouts (`409 Conflict`).
4. **Order Cancellation & Stock Recovery**: Buyer cancellations execute in database transactions, automatically returning line-item quantities back into available product stock and initiating idempotent refund records.
5. **Anti-Overdraft Concurrency Control**: Payout requests lock the vendor row (`SELECT id FROM vendors WHERE id = :vendorId FOR UPDATE`), preventing race conditions from draining balances.
6. **Input Validation & Safe Uploads**: Validates file types (`image/jpeg`, `image/png`, `image/webp`) with a 5MB size limit and safe cryptographic filename generation.

---

## Running Automated Tests

Run the complete automated test suite (70 assertions covering security, IDOR, payment lifecycle, and end-to-end commerce):

```bash
# Run all tests
npm test

# Run security & vulnerability test suite
npm run test:security

# Run end-to-end manual verification flow
npm run test:e2e

# Run linter
npm run lint

# Run production build check
npm run build
```

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | Yes | Environment mode | `production` or `development` |
| `PORT` | Yes | Backend HTTP port | `4000` |
| `FRONTEND_URL` | Yes | Comma-separated allowed CORS origins | `https://marketbridge.example.com` |
| `DATABASE_HOST` | Yes | MySQL hostname | `localhost` or RDS endpoint |
| `DATABASE_PORT` | Yes | MySQL port | `3306` |
| `DATABASE_NAME` | Yes | Database name | `marketbridge` |
| `DATABASE_USER` | Yes | MySQL username | `marketbridge_app` |
| `DATABASE_PASSWORD` | Yes | MySQL password | `strong_db_password` |
| `DATABASE_SSL` | No | Enable TLS for managed MySQL | `true` in production |
| `JWT_SECRET` | Yes | Random secret key (min 32 chars) | `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | No | Token lifetime | `7d` |
| `RAZORPAY_KEY_ID` | Optional | Razorpay Key ID | `rzp_test_...` or `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | Optional | Razorpay Secret Key | `secret_...` |
| `RAZORPAY_WEBHOOK_SECRET` | Optional | Webhook secret | `webhook_secret_...` |
| `ALLOW_DEMO_LOGIN` | No | Allow demo switcher (must be `false` in prod) | `false` |
| `DEFAULT_GST_RATE` | No | Default GST rate | `0.18` (18%) |
| `DEFAULT_COMMISSION_RATE` | No | Platform commission rate | `0.08` (8%) |
| `SHIPPING_FEE_PER_VENDOR` | No | Default shipping fee per vendor order | `300` |

### Frontend (`.env`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_BASE_URL` | Yes | URL pointing to backend API | `http://localhost:4000/api` or `https://api.marketbridge.com/api` |

---

## API Overview

### Public Endpoints
- `GET /api/products` — List active products from approved vendors with filtering & pagination
- `GET /api/products/:id` — Public product details
- `GET /api/categories` — List active categories
- `GET /api/suppliers` — Public vendor profiles (sanitized, financial data excluded)
- `GET /api/suppliers/:id` — Public supplier profile by ID

### Buyer Endpoints (`/api/buyer/*`)
- `GET /api/buyer/cart` — Get current cart with wholesale bulk tier calculations
- `POST /api/buyer/cart/items` — Add product to cart
- `POST /api/buyer/orders/checkout` — Checkout cart, create order, verify Razorpay payment
- `POST /api/buyer/orders/:id/cancel` — Cancel order, restore stock, initiate refund
- `POST /api/buyer/quotes` — Request RFQ quotation for bulk pricing

### Vendor Endpoints (`/api/vendor/*`)
- `GET /api/vendor/products` — List vendor's own catalog
- `POST /api/vendor/products` — Create new product draft
- `PATCH /api/vendor/products/:id` — Update product details (ownership enforced)
- `POST /api/vendor/upload-image` — Persistent image upload (MIME & size validated)
- `POST /api/vendor/payouts` — Request payout (protected against race conditions)

### Admin Endpoints (`/api/admin/*`)
- `GET /api/admin/dashboard` — Platform overview metrics
- `PATCH /api/admin/vendors/:id/approve` — Approve pending vendor
- `PATCH /api/admin/refunds/:id` — Approve or reject refund with Razorpay gateway trigger

---

## License

Private repository. All rights reserved.
