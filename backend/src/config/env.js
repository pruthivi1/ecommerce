import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";

dotenv.config();
const backendEnvPath = path.resolve(process.cwd(), "backend/.env");
if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath });
}

const REQUIRED_IN_ALL_ENVS = ["DATABASE_HOST", "DATABASE_NAME", "DATABASE_USER", "JWT_SECRET"];

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. Copy backend/.env.example to backend/.env and fill it in.`);
  }
  return value;
}

for (const name of REQUIRED_IN_ALL_ENVS) {
  requireEnv(name);
}

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

if (isProduction && process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters in production.");
}

if (isProduction && process.env.ALLOW_DEMO_LOGIN === "true") {
  throw new Error("ALLOW_DEMO_LOGIN must not be true in production — it bypasses real password checks.");
}

export const env = {
  nodeEnv,
  isProduction,
  port: Number(process.env.PORT) || 4000,
  frontendOrigins: (process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  db: {
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT) || 3306,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD || "",
    ssl: process.env.DATABASE_SSL === "true",
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
    get configured() {
      return Boolean(this.keyId && this.keySecret);
    },
  },

  business: {
    gstRate: Number(process.env.DEFAULT_GST_RATE ?? 0.18),
    commissionRate: Number(process.env.DEFAULT_COMMISSION_RATE ?? 0.08),
    shippingFeePerVendor: Number(process.env.SHIPPING_FEE_PER_VENDOR ?? 300),
  },

  allowDemoLogin: !isProduction && process.env.ALLOW_DEMO_LOGIN === "true",
};
