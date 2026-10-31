import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { env } from "./config/env.js";
import { checkDbConnection } from "./config/db.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import { sendSuccess } from "./utils/response.js";
import { asyncHandler } from "./utils/asyncHandler.js";
import * as paymentController from "./controllers/paymentController.js";

import authRoutes from "./routes/authRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import buyerRoutes from "./routes/buyerRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.frontendOrigins,
    credentials: true,
  })
);
app.use(compression());
app.use(morgan(env.isProduction ? "combined" : "dev"));

// Razorpay webhook needs the RAW request body for signature verification —
// mounted before the JSON body parser and excluded from it below.
app.post("/api/webhooks/razorpay", express.raw({ type: "application/json" }), paymentController.razorpayWebhook);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.get(
  "/api/health",
  asyncHandler(async (_req, res) => {
    await checkDbConnection();
    sendSuccess(res, { status: "ok", env: env.nodeEnv, time: new Date().toISOString() });
  })
);

app.use("/api/auth", authRoutes);
app.use("/api", publicRoutes);
app.use("/api/buyer", buyerRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
