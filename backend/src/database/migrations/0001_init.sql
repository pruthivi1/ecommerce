-- MarketBridge initial schema.
-- Identifier strategy: UUID v4 (CHAR(36)) primary keys generated in the
-- application layer (see backend/src/utils/id.js). Money columns are
-- DECIMAL(12,2) storing whole rupees with paise precision — never FLOAT.
-- Timestamps are stored in UTC (DATETIME) and formatted for the client at
-- the API boundary.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  role ENUM('buyer','vendor','admin') NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(20) NULL,
  password_hash VARCHAR(200) NOT NULL,
  business_name VARCHAR(200) NULL,
  gst_number VARCHAR(20) NULL,
  business_type VARCHAR(50) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS vendors (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  slug VARCHAR(200) NOT NULL,
  name VARCHAR(200) NOT NULL,
  business_name VARCHAR(200) NOT NULL,
  owner_name VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(20) NULL,
  categories JSON NULL,
  location VARCHAR(100) NULL,
  address_line1 VARCHAR(200) NULL,
  address_city VARCHAR(100) NULL,
  address_state VARCHAR(100) NULL,
  address_pincode VARCHAR(15) NULL,
  gst_number VARCHAR(20) NULL,
  business_type VARCHAR(50) NULL,
  status ENUM('Pending','Approved','Rejected','Suspended') NOT NULL DEFAULT 'Pending',
  rejection_reason TEXT NULL,
  verified TINYINT(1) NOT NULL DEFAULT 0,
  rating DECIMAL(2,1) NOT NULL DEFAULT 0,
  review_count INT UNSIGNED NOT NULL DEFAULT 0,
  years_experience INT UNSIGNED NULL,
  joined_date DATE NOT NULL,
  image TEXT NULL,
  about TEXT NULL,
  bank_account_name VARCHAR(200) NULL,
  bank_account_number VARCHAR(50) NULL,
  bank_ifsc VARCHAR(20) NULL,
  bank_upi VARCHAR(100) NULL,
  commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0800,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_vendors_user (user_id),
  UNIQUE KEY uq_vendors_slug (slug),
  KEY idx_vendors_status (status),
  CONSTRAINT fk_vendors_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS vendor_documents (
  id CHAR(36) PRIMARY KEY,
  vendor_id CHAR(36) NOT NULL,
  name VARCHAR(150) NOT NULL,
  status ENUM('Submitted','Verified','Rejected') NOT NULL DEFAULT 'Submitted',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_vendor_documents_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(60) PRIMARY KEY,
  slug VARCHAR(80) NOT NULL,
  name VARCHAR(120) NOT NULL,
  meta VARCHAR(200) NULL,
  image TEXT NULL,
  subcategories JSON NULL,
  status ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS products (
  id CHAR(36) PRIMARY KEY,
  slug VARCHAR(220) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT NULL,
  category_id VARCHAR(60) NOT NULL,
  subcategory VARCHAR(120) NULL,
  vendor_id CHAR(36) NOT NULL,
  sku VARCHAR(60) NULL,
  price DECIMAL(12,2) NOT NULL,
  unit VARCHAR(30) NOT NULL DEFAULT 'piece',
  moq INT UNSIGNED NOT NULL DEFAULT 1,
  moq_unit VARCHAR(30) NOT NULL DEFAULT 'pieces',
  stock INT NOT NULL DEFAULT 0,
  status ENUM('Draft','Pending Approval','Active','Rejected','Out of Stock','Inactive') NOT NULL DEFAULT 'Draft',
  rejection_reason TEXT NULL,
  rating DECIMAL(2,1) NOT NULL DEFAULT 0,
  review_count INT UNSIGNED NOT NULL DEFAULT 0,
  location VARCHAR(100) NULL,
  specifications JSON NULL,
  shipping_info TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_products_slug (slug),
  KEY idx_products_vendor (vendor_id),
  KEY idx_products_category (category_id),
  KEY idx_products_status (status),
  KEY idx_products_location (location),
  KEY idx_products_price (price),
  FULLTEXT KEY ft_products_name (name),
  CONSTRAINT fk_products_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS product_images (
  id CHAR(36) PRIMARY KEY,
  product_id CHAR(36) NOT NULL,
  url TEXT NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  KEY idx_product_images_product (product_id),
  CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS product_pricing_tiers (
  id CHAR(36) PRIMARY KEY,
  product_id CHAR(36) NOT NULL,
  min_qty INT UNSIGNED NOT NULL,
  max_qty INT UNSIGNED NULL,
  price DECIMAL(12,2) NOT NULL,
  KEY idx_pricing_tiers_product (product_id),
  CONSTRAINT fk_pricing_tiers_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS addresses (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  label VARCHAR(100) NULL,
  line1 VARCHAR(200) NOT NULL,
  line2 VARCHAR(200) NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(15) NOT NULL,
  phone VARCHAR(20) NULL,
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_addresses_user (user_id),
  CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS carts (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_carts_user (user_id),
  CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cart_items (
  id CHAR(36) PRIMARY KEY,
  cart_id CHAR(36) NOT NULL,
  product_id CHAR(36) NOT NULL,
  vendor_id CHAR(36) NOT NULL,
  qty INT UNSIGNED NOT NULL,
  negotiated_price DECIMAL(12,2) NULL,
  quote_id CHAR(36) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cart_items_cart_product (cart_id, product_id),
  KEY idx_cart_items_product (product_id),
  CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS wishlists (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  UNIQUE KEY uq_wishlists_user (user_id),
  CONSTRAINT fk_wishlists_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS wishlist_items (
  id CHAR(36) PRIMARY KEY,
  wishlist_id CHAR(36) NOT NULL,
  product_id CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_wishlist_items (wishlist_id, product_id),
  CONSTRAINT fk_wishlist_items_wishlist FOREIGN KEY (wishlist_id) REFERENCES wishlists(id) ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS quotes (
  id CHAR(36) PRIMARY KEY,
  buyer_id CHAR(36) NOT NULL,
  product_id CHAR(36) NOT NULL,
  vendor_id CHAR(36) NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  target_price DECIMAL(12,2) NULL,
  delivery_location VARCHAR(150) NULL,
  message TEXT NULL,
  status ENUM('Pending','Counter Offer','Accepted','Rejected') NOT NULL DEFAULT 'Pending',
  response_price DECIMAL(12,2) NULL,
  response_message TEXT NULL,
  responded_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_quotes_buyer (buyer_id),
  KEY idx_quotes_vendor (vendor_id),
  KEY idx_quotes_status (status),
  CONSTRAINT fk_quotes_buyer FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_quotes_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_quotes_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS orders (
  id CHAR(36) PRIMARY KEY,
  order_number VARCHAR(40) NOT NULL,
  buyer_id CHAR(36) NOT NULL,
  address_id CHAR(36) NULL,
  payment_status ENUM('Pending','Successful','Failed','Refunded') NOT NULL DEFAULT 'Pending',
  payment_method VARCHAR(30) NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  shipping DECIMAL(12,2) NOT NULL DEFAULT 0,
  gst DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  placed_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_orders_number (order_number),
  KEY idx_orders_buyer (buyer_id),
  CONSTRAINT fk_orders_buyer FOREIGN KEY (buyer_id) REFERENCES users(id),
  CONSTRAINT fk_orders_address FOREIGN KEY (address_id) REFERENCES addresses(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS vendor_orders (
  id CHAR(36) PRIMARY KEY,
  vendor_order_number VARCHAR(40) NOT NULL,
  order_id CHAR(36) NOT NULL,
  vendor_id CHAR(36) NOT NULL,
  status ENUM('Pending','Accepted','Processing','Ready to Ship','Shipped','Delivered','Cancelled','Return Requested','Returned') NOT NULL DEFAULT 'Pending',
  subtotal DECIMAL(12,2) NOT NULL,
  cancelled_reason TEXT NULL,
  return_reason TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_vendor_orders_number (vendor_order_number),
  KEY idx_vendor_orders_order (order_id),
  KEY idx_vendor_orders_vendor (vendor_id),
  KEY idx_vendor_orders_status (status),
  CONSTRAINT fk_vendor_orders_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_vendor_orders_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Order line items retain a commercial snapshot (name/sku/price) taken at
-- purchase time. Renaming or repricing a product later must never change a
-- historical order, so these columns are intentionally NOT foreign-derived.
CREATE TABLE IF NOT EXISTS order_items (
  id CHAR(36) PRIMARY KEY,
  vendor_order_id CHAR(36) NOT NULL,
  product_id CHAR(36) NULL,
  quote_id CHAR(36) NULL,
  product_name_snapshot VARCHAR(200) NOT NULL,
  product_image_snapshot TEXT NULL,
  sku_snapshot VARCHAR(60) NULL,
  qty INT UNSIGNED NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  negotiated TINYINT(1) NOT NULL DEFAULT 0,
  KEY idx_order_items_vendor_order (vendor_order_id),
  KEY idx_order_items_product (product_id),
  CONSTRAINT fk_order_items_vendor_order FOREIGN KEY (vendor_order_id) REFERENCES vendor_orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  CONSTRAINT fk_order_items_quote FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_status_history (
  id CHAR(36) PRIMARY KEY,
  vendor_order_id CHAR(36) NOT NULL,
  status VARCHAR(30) NOT NULL,
  changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  changed_by_user_id CHAR(36) NULL,
  KEY idx_status_history_vendor_order (vendor_order_id),
  CONSTRAINT fk_status_history_vendor_order FOREIGN KEY (vendor_order_id) REFERENCES vendor_orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS payments (
  id CHAR(36) PRIMARY KEY,
  order_id CHAR(36) NOT NULL,
  razorpay_order_id VARCHAR(64) NULL,
  razorpay_payment_id VARCHAR(64) NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'INR',
  method VARCHAR(30) NULL,
  status ENUM('Created','Pending','Successful','Failed','Refunded') NOT NULL DEFAULT 'Created',
  idempotency_key VARCHAR(100) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_payments_order (order_id),
  UNIQUE KEY uq_payments_idempotency (idempotency_key),
  KEY idx_payments_razorpay_order (razorpay_order_id),
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS payment_events (
  id CHAR(36) PRIMARY KEY,
  payment_id CHAR(36) NULL,
  event_type VARCHAR(60) NOT NULL,
  razorpay_event_id VARCHAR(80) NULL,
  payload JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_payment_events_razorpay_event (razorpay_event_id),
  KEY idx_payment_events_payment (payment_id),
  CONSTRAINT fk_payment_events_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS refunds (
  id CHAR(36) PRIMARY KEY,
  order_id CHAR(36) NOT NULL,
  vendor_order_id CHAR(36) NOT NULL,
  buyer_id CHAR(36) NOT NULL,
  vendor_id CHAR(36) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  reason TEXT NULL,
  status ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  decided_at DATETIME NULL,
  KEY idx_refunds_order (order_id),
  KEY idx_refunds_status (status),
  CONSTRAINT fk_refunds_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_refunds_vendor_order FOREIGN KEY (vendor_order_id) REFERENCES vendor_orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS reviews (
  id CHAR(36) PRIMARY KEY,
  product_id CHAR(36) NULL,
  vendor_id CHAR(36) NULL,
  user_id CHAR(36) NOT NULL,
  author VARCHAR(150) NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  comment TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_reviews_product (product_id),
  KEY idx_reviews_vendor (vendor_id),
  KEY idx_reviews_user (user_id),
  CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_reviews_target CHECK (product_id IS NOT NULL OR vendor_id IS NOT NULL),
  CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notifications (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT NULL,
  read_flag TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_notifications_user (user_id, read_flag),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS payouts (
  id CHAR(36) PRIMARY KEY,
  payout_number VARCHAR(40) NOT NULL,
  vendor_id CHAR(36) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status ENUM('Pending','Processing','Completed','Rejected') NOT NULL DEFAULT 'Pending',
  requested_date DATE NOT NULL,
  processed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_payouts_number (payout_number),
  KEY idx_payouts_vendor (vendor_id),
  KEY idx_payouts_status (status),
  CONSTRAINT fk_payouts_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS commission_ledger (
  id CHAR(36) PRIMARY KEY,
  vendor_order_id CHAR(36) NOT NULL,
  vendor_id CHAR(36) NOT NULL,
  gross DECIMAL(12,2) NOT NULL,
  commission_rate DECIMAL(5,4) NOT NULL,
  commission_amount DECIMAL(12,2) NOT NULL,
  net_amount DECIMAL(12,2) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_commission_ledger_vendor_order (vendor_order_id),
  KEY idx_commission_ledger_vendor (vendor_id),
  CONSTRAINT fk_commission_ledger_vendor_order FOREIGN KEY (vendor_order_id) REFERENCES vendor_orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS coupons (
  id CHAR(36) PRIMARY KEY,
  code VARCHAR(40) NOT NULL,
  description VARCHAR(255) NULL,
  discount_type ENUM('percentage','fixed') NOT NULL,
  discount_value DECIMAL(12,2) NOT NULL,
  status ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  starts_at DATE NULL,
  expires_at DATE NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_coupons_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id CHAR(36) PRIMARY KEY,
  coupon_id CHAR(36) NOT NULL,
  order_id CHAR(36) NOT NULL,
  buyer_id CHAR(36) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_coupon_redemptions_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id),
  CONSTRAINT fk_coupon_redemptions_order FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS audit_logs (
  id CHAR(36) PRIMARY KEY,
  actor_user_id CHAR(36) NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(60) NOT NULL,
  entity_id VARCHAR(60) NULL,
  details JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_audit_logs_entity (entity_type, entity_id),
  KEY idx_audit_logs_actor (actor_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS platform_settings (
  setting_key VARCHAR(60) PRIMARY KEY,
  setting_value VARCHAR(255) NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
