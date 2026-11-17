# MarketBridge — Production Deployment & Handover Guide

This document is the official operational and deployment guide for the **MarketBridge** multi-vendor marketplace. It provides comprehensive, step-by-step instructions for deploying to production, configuring SSL, running database migrations, connecting Razorpay payments, and managing the live service.

---

## Deployment Architecture Options

Choose the deployment architecture that fits your infrastructure requirements:

1. **Option A: Docker Compose (All-in-One / Simplest)**:
   - Deploy frontend, backend API, and MySQL on any cloud VPS (AWS EC2, DigitalOcean, Hetzner, Linode).
   - Zero dependency friction; single-command startup.
2. **Option B: Modern Cloud / Serverless (Separated)**:
   - **Frontend**: Vercel or Netlify (Global CDN, instant builds).
   - **Backend API**: Render, Railway, or AWS Elastic Beanstalk.
   - **Database**: Managed MySQL 8 (AWS RDS, PlanetScale, Aiven, or DigitalOcean Managed Databases).
3. **Option C: Traditional Linux VM (Ubuntu with Nginx + PM2 + MySQL)**:
   - Bare metal or Linux VPS running PM2 process manager with Nginx reverse proxy.

---

## Option A: Docker Compose Deployment (Recommended for Single Server)

### 1. Server Prerequisites
- Ubuntu 22.04 LTS or 24.04 LTS VPS (Minimum 2GB RAM, 1 vCPU recommended).
- Docker and Docker Compose installed:
  ```bash
  sudo apt update
  sudo apt install -y docker.io docker-compose-plugin
  sudo systemctl enable --now docker
  ```

### 2. Clone Repository & Setup Environment
```bash
git clone https://github.com/pruthivi1/ecommerce.git
cd ecommerce
```

### 3. Configure Production Secrets
Edit `docker-compose.yml` or set environment variables:
- Change `MYSQL_ROOT_PASSWORD` and `MYSQL_PASSWORD` to strong random values.
- Set `JWT_SECRET` (generate with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`).
- Set `ALLOW_DEMO_LOGIN=false`.
- If using Razorpay, add `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`.
- Set `FRONTEND_URL` to your production domain (e.g. `https://marketbridge.example.com`).

### 4. Build and Start Containers
```bash
docker compose up -d --build
```

### 5. Verify Running Services
```bash
docker compose ps
docker compose logs -f backend
```
The backend automatically executes database migrations and seeds initial reference data upon startup.

### 6. Attach Domain & Free SSL (Certbot)
Install Nginx or Caddy on the host as a reverse proxy:
```bash
sudo apt install -y certbot python3-certbot-nginx
```
Configure your domain pointing to port 80 of the Docker container.

---

## Option B: Split Cloud Deployment (Vercel + Render + Managed MySQL)

### Step 1: Managed MySQL Database Setup
1. Create a MySQL 8.0 instance on **AWS RDS**, **PlanetScale**, **Aiven**, or **DigitalOcean**.
2. Note your connection details:
   - Hostname (e.g. `mydb.rds.amazonaws.com`)
   - Port (typically `3306`)
   - Database name: `marketbridge`
   - Username & Password
3. Verify that SSL/TLS is enabled on the database provider.

### Step 2: Backend API Deployment on Render / Railway
1. **Create Web Service** on [Render](https://render.com) or [Railway](https://railway.app).
2. Connect the GitHub repository `https://github.com/pruthivi1/ecommerce.git`.
3. Set **Root Directory**: `backend`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `node src/server.js`
6. Add Environment Variables:
   ```env
   NODE_ENV=production
   PORT=4000
   DATABASE_HOST=<your-db-host>
   DATABASE_PORT=3306
   DATABASE_NAME=marketbridge
   DATABASE_USER=<your-db-user>
   DATABASE_PASSWORD=<your-db-password>
   DATABASE_SSL=true
   JWT_SECRET=<32+ char random string>
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://your-frontend.vercel.app
   ALLOW_DEMO_LOGIN=false
   RAZORPAY_KEY_ID=<your_key>
   RAZORPAY_KEY_SECRET=<your_secret>
   RAZORPAY_WEBHOOK_SECRET=<your_webhook_secret>
   ```
7. Run Database Migrations:
   In the Render/Railway Shell (or from your local machine connected to the remote DB):
   ```bash
   npm run migrate
   npm run seed
   ```
8. Note your public backend URL: `https://your-backend.onrender.com`.

### Step 3: Frontend Deployment on Vercel
1. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Select the repository `pruthivi1/ecommerce`.
3. Framework Preset: **Vite**.
4. Root Directory: `./` (root).
5. Build Command: `npm run build`.
6. Output Directory: `dist`.
7. Add Environment Variable:
   - `VITE_API_BASE_URL` = `https://your-backend.onrender.com/api`
8. Click **Deploy**.
9. `vercel.json` in the root automatically routes all single-page application paths (`/vendor/products`, `/checkout`, `/admin`) to `/index.html`.

---

## Option C: Traditional Linux VM (Ubuntu + Nginx + PM2 + MySQL)

### 1. Install Node.js, PM2 & MySQL
```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs mysql-server nginx

# Install PM2 globally
sudo npm install -g pm2
```

### 2. Configure MySQL
```bash
sudo mysql -e "CREATE DATABASE marketbridge CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER 'marketbridge_app'@'localhost' IDENTIFIED BY 'StrongPassword123!';"
sudo mysql -e "GRANT ALL PRIVILEGES ON marketbridge.* TO 'marketbridge_app'@'localhost'; FLUSH PRIVILEGES;"
```

### 3. Deploy Application Code
```bash
cd /var/www
sudo git clone https://github.com/pruthivi1/ecommerce.git
cd ecommerce

# Setup backend
cd backend
cp .env.example .env
nano .env # Enter DB credentials & secrets
npm install --omit=dev
npm run migrate
npm run seed
pm2 start src/server.js --name "marketbridge-backend"
pm2 save
pm2 startup

# Setup frontend
cd ..
cp .env.example .env
nano .env # Set VITE_API_BASE_URL=https://yourdomain.com/api
npm install
npm run build
```

### 4. Configure Nginx Reverse Proxy
Create `/etc/nginx/sites-available/marketbridge`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/ecommerce/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://localhost:4000/uploads/;
    }
}
```
Enable the site and obtain an SSL certificate:
```bash
sudo ln -s /etc/nginx/sites-available/marketbridge /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Configuring Razorpay Payments & Webhooks

### 1. Get Live API Credentials
1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Switch from **Test Mode** to **Live Mode**.
3. Navigate to **Settings** -> **API Keys** -> **Generate Key**.
4. Copy `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.

### 2. Configure Webhooks
1. In Razorpay Dashboard, navigate to **Settings** -> **Webhooks**.
2. Click **Add New Webhook**.
3. **Webhook URL**: `https://your-backend-api.com/api/webhooks/razorpay`
4. **Secret**: Enter a strong random secret and copy it into `RAZORPAY_WEBHOOK_SECRET` in `backend/.env`.
5. **Active Events**: Select:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
   - `refund.created`
   - `refund.processed`
6. Save webhook.

---

## Pre-Production Security Checklist

Before directing live user traffic:

- [ ] `NODE_ENV` is set to `production`.
- [ ] `ALLOW_DEMO_LOGIN` is set to `false`.
- [ ] `JWT_SECRET` is set to a cryptographically random string (min 32 characters).
- [ ] `FRONTEND_URL` is set strictly to your production domain(s) for CORS protection.
- [ ] `DATABASE_SSL` is set to `true` when connecting to remote cloud databases.
- [ ] Database credentials do not use default passwords.
- [ ] HTTPS / TLS is enforced for both frontend and backend endpoints.
- [ ] Razorpay test keys are replaced with live credentials.
- [ ] Automated security tests (`npm run test:security`) pass with 100%.

---

## Maintenance & Operations

### Health Check Endpoint
- Health URL: `GET /api/health`
- Returns: `{ "success": true, "data": { "status": "ok", "env": "production", "time": "..." } }`
- Use this endpoint with uptime monitoring services (e.g. UptimeRobot, BetterUptime, Datadog).

### Running Future Database Migrations
When new `.sql` migrations are added to `backend/src/database/migrations/`:
```bash
npm run db:migrate
```
The migration runner records applied migrations in `schema_migrations` and only applies new files.

### Database Backups (Cron Example)
```bash
# Daily automated backup at 2 AM
0 2 * * * mysqldump -u marketbridge_app -p'StrongPassword' marketbridge | gzip > /var/backups/marketbridge_$(date +\%F).sql.gz
```
