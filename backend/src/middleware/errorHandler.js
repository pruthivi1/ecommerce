import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { sendError } from "../utils/response.js";

export function notFoundHandler(req, _res, next) {
  next(AppError.notFound(`No route for ${req.method} ${req.originalUrl}`, "ROUTE_NOT_FOUND"));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    return sendError(res, { status: err.status, message: err.message, code: err.code, details: err.details });
  }

  if (err.code === "ER_DUP_ENTRY") {
    return sendError(res, { status: 409, message: "A record with these details already exists.", code: "DUPLICATE" });
  }

  // Never leak stack traces or raw DB errors to clients — log server-side only.
  console.error(err);
  return sendError(res, {
    status: 500,
    message: env.isProduction ? "Something went wrong. Please try again." : err.message,
    code: "INTERNAL_ERROR",
  });
}
