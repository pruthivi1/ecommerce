import { AppError } from "../utils/AppError.js";

/** Validates req.body (or req.query) against a Zod schema, replacing it with the parsed/coerced value. */
export function validateBody(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(AppError.badRequest("Invalid request body.", "VALIDATION_ERROR", result.error.flatten()));
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return next(AppError.badRequest("Invalid query parameters.", "VALIDATION_ERROR", result.error.flatten()));
    }
    req.query = result.data;
    next();
  };
}
