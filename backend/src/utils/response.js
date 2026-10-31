export function sendSuccess(res, data, { message = "Operation completed", status = 200, meta } = {}) {
  return res.status(status).json({ success: true, data, message, ...(meta ? { meta } : {}) });
}

export function sendError(res, { status = 500, message = "Something went wrong.", code = "INTERNAL_ERROR", details } = {}) {
  return res.status(status).json({ success: false, message, code, ...(details ? { details } : {}) });
}
