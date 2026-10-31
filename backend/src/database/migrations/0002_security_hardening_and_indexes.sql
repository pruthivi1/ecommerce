-- Migration 0002: Security Hardening, Payment Integrity, and Query Optimization Indexes.
-- Backward compatible, non-destructive schema additions.

SET NAMES utf8mb4;

-- 1. Allow payments to exist in 'Created' state with buyer association prior to order placement
ALTER TABLE payments 
  MODIFY COLUMN order_id CHAR(36) NULL,
  ADD COLUMN IF NOT EXISTS buyer_id CHAR(36) NULL AFTER order_id;

-- Ensure payment attempts are associated with buyer and payments cannot be reused
ALTER TABLE payments
  ADD KEY IF NOT EXISTS idx_payments_buyer (buyer_id),
  ADD UNIQUE KEY IF NOT EXISTS uq_payments_razorpay_payment (razorpay_payment_id);

-- 2. Refunds: Track external Razorpay refund ID and optimize lookups
ALTER TABLE refunds
  ADD COLUMN IF NOT EXISTS razorpay_refund_id VARCHAR(100) NULL AFTER amount,
  ADD KEY IF NOT EXISTS idx_refunds_vendor_order (vendor_order_id);

-- 3. Composite indexes for high-frequency queries
ALTER TABLE vendor_orders
  ADD KEY IF NOT EXISTS idx_vendor_orders_vendor_status (vendor_id, status);

ALTER TABLE products
  ADD KEY IF NOT EXISTS idx_products_vendor_status (vendor_id, status);
