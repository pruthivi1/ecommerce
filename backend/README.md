# MarketBridge Backend

Node.js + Express + MySQL REST API for the MarketBridge B2B marketplace. Talks to the existing React/Vite frontend at the repository root.

## Stack

- Express 4, mysql2 (raw parameterized SQL, no ORM — see "ID strategy" below)
- JWT (jsonwebtoken) + bcryptjs for auth
- Zod for request validation
- Razorpay SDK for payments (test-mode until real keys are supplied)
- helmet, cors, express-rate-limit, compression, morgan

## Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in DATABASE_*, JWT_SECRET at minimum
npm run migrate        # creates the database + all tables
npm run seed           # seeds categories, 3 vendors, products, 1 buyer, 1 admin, a sample quote
npm run dev            # http://localhost:4000, auto-restarts on change
```

Frontend: copy `.env.example` to `.env` at the repo root and set `VITE_API_BASE_URL` (defaults to `http://localhost:4000/api`), then `npm run dev` as before.

### Seed accounts (password for all: `DemoPass123!`)

| Role | Email |
|---|---|
| Admin | demo-admin@marketbridge.example |
| Vendor (Sri Lakshmi Handlooms, Approved) | demo-vendor@marketbridge.example |
| Buyer | demo-buyer@marketbridge.example |

A dev-only `POST /api/auth/demo-login {role}` endpoint reproduces the old one-click demo login; it refuses to run (and the app refuses to boot with it enabled) when `NODE_ENV=production`.

## Architecture

```
Route → Controller → Service → Repository → MySQL
```
- **routes/** define endpoints and attach `requireAuth`/`requireRole`/validators.
- **controllers/** translate HTTP ↔ service calls, nothing else.
- **services/** hold business rules (availability checks, status-transition guards, commission math, notification fan-out).
- **repositories/** are the only files that touch SQL.
- **middleware/** — JWT auth, role/ownership checks, centralized error handler, rate limiting, Zod validation.

## ID strategy

Every primary key is a UUID v4 (`CHAR(36)`), generated in the application layer (`src/utils/id.js`) rather than via MySQL's `UUID()`. Human-facing codes (order numbers, payout numbers) are a separate short readable field (`order_number`, `payout_number`) layered on top.

## Database

- `src/database/migrations/0001_init.sql` — full schema (InnoDB, FKs, indexes, a fulltext index on product name).
- `src/database/migrate.js` — creates the DB if missing, tracks applied migrations in `schema_migrations`, re-runnable safely.
- `src/database/seed.js` — idempotent (`ON DUPLICATE KEY UPDATE`) development seed data.
- All connections run with `time_zone = '+00:00'` so `DATETIME` columns are unambiguous UTC.
- Money: `DECIMAL(12,2)` everywhere (rupees with paise precision) — never `FLOAT`/`DOUBLE`.

## Environment variables

See `.env.example` for the full documented list. Notable ones:
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET` — checkout refuses to place an order (with a clear `PAYMENTS_NOT_CONFIGURED` error, never a fabricated success) if these are unset.
- `DEFAULT_GST_RATE` / `DEFAULT_COMMISSION_RATE` / `SHIPPING_FEE_PER_VENDOR` — seed the `platform_settings` table; admin can change the live commission rate via `PATCH /api/admin/commission-rate`. **Confirm actual GST/commission values with the business/accounting owner before production use** — these are illustrative defaults, not verified tax advice.
- `ALLOW_DEMO_LOGIN` — must be unset/false in production; `env.js` throws at startup if it's `true` while `NODE_ENV=production`.

## API endpoint inventory (selected — see `src/routes/*.js` for the full list)

- **Auth**: `POST /auth/register`, `/auth/register/vendor`, `/auth/login`, `/auth/demo-login` (dev only), `GET /auth/me`, `POST /auth/logout`
- **Public**: `GET /categories`, `/products` (search/filter/paginate), `/products/:id` (availability-gated), `/products/:id/related`, `/products/:id/reviews`, `/suppliers`, `/suppliers/:id`, `/suppliers/:id/reviews`
- **Buyer** (`/buyer/*`, requires buyer role): addresses CRUD, cart CRUD, wishlist CRUD, quotes create/accept, orders list/get/checkout/cancel/return, product & supplier reviews, notifications
- **Vendor** (`/vendor/*`, requires vendor role; selling actions additionally require Approved status): profile, products CRUD + stock + status toggle, orders list/get/status, quotes list/respond, earnings, payouts, reviews, notifications
- **Admin** (`/admin/*`, requires admin role): dashboard/reports/payments, vendors list/approve/reject/suspend/request-changes, products list/approve/reject/request-changes, categories CRUD, orders, refunds approve/reject, payouts status, commissions + rate, coupons CRUD, buyers, settings
- **Payments**: `GET /payments/status`, `POST /payments/razorpay/order` (buyer); `POST /webhooks/razorpay` (raw-body, signature-verified)
- `GET /health` — DB connectivity check, used for deploy readiness probes

Every response is `{ success, data, message }` or `{ success: false, message, code, details? }`.

## Payments (Razorpay)

- Checkout flow: frontend requests a Razorpay order sized to the buyer's **server-computed** cart total → Razorpay's checkout.js modal collects payment → frontend posts the payment id/order id/signature to `POST /buyer/orders` → backend verifies the HMAC-SHA256 signature server-side (`paymentService.verifyPaymentSignature`) before creating the order. A client "payment succeeded" callback is never trusted on its own.
- Idempotency: every checkout attempt carries a client-generated `idempotencyKey`; a retry with the same key returns the already-created order instead of double-charging/double-ordering.
- Webhook (`POST /webhooks/razorpay`) verifies the signature over the **raw** request body and de-duplicates by Razorpay's event id.
- **Status: unconfigured in this build** — no real Razorpay keys were available. `RAZORPAY_KEY_ID`/`SECRET` are empty in `.env.example`; with them empty, checkout correctly refuses to place an order rather than faking success (verified live — see final report).
- Marketplace settlement (splitting a payment between platform and vendor at the payment-processor level, i.e. Razorpay Route) is **not implemented** — commission is only tracked internally (`commission_ledger`) and payouts are a separate manual admin-approved flow that does not move real money. This must not be assumed to be automatic settlement.

## Deployment

- `GET /health` for readiness/liveness probes.
- `PORT` is read from the environment (works with any PaaS's dynamic port binding).
- `FRONTEND_URL` (comma-separated) drives CORS `origin` — set it to your deployed frontend's exact origin(s).
- Graceful shutdown: `SIGTERM`/`SIGINT` stop accepting new connections, drain the MySQL pool, then exit.
- Suggested hosting: Vercel (frontend), Render/Railway (this API), PlanetScale/Railway/RDS for MySQL — confirm your chosen provider actually offers managed MySQL before committing to it.
- Run `npm run migrate` (and `npm run seed` for a fresh non-production environment only) as a release step against the target database; migrations are idempotent/tracked so re-running is safe.
- Set every `.env.example` variable in the host's dashboard/secrets manager. Never commit `.env`.
