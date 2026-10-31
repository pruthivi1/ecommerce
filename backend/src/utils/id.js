import { randomUUID } from "node:crypto";

/**
 * ID strategy: every primary key is a UUID v4 (CHAR(36)), generated in the
 * application layer with node:crypto.randomUUID() rather than MySQL's
 * UUID() function. This keeps ID generation testable, avoids a DB round
 * trip just to get an id, and lets repositories build multi-row transactions
 * (e.g. an order + its vendor orders + their items) knowing every child id
 * up front. Human-facing codes (order numbers, payout numbers) get a short
 * readable prefix layered on top of a UUID fragment — see prefixedCode().
 */
export function newId() {
  return randomUUID();
}

export function prefixedCode(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}
