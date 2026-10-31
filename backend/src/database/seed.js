import { pool } from "../config/db.js";
import { hashPassword } from "../utils/password.js";
import { newId } from "../utils/id.js";

const DEMO_PASSWORD = "DemoPass123!";

const categories = [
  { id: "electronics", name: "Electronics", meta: "Wholesale products", subcategories: ["Audio", "Lighting", "Mobile Accessories", "Small Appliances"] },
  { id: "apparel", name: "Apparel", meta: "Wholesale products", subcategories: ["Shirts", "T-Shirts", "Trousers", "Ethnic Wear"] },
  { id: "sarees", name: "Sarees", meta: "Wholesale products", subcategories: ["Cotton Sarees", "Silk Sarees", "Printed Sarees"] },
  { id: "handloom", name: "Handloom", meta: "Wholesale products", subcategories: ["Fabric Rolls", "Handloom Sarees", "Handloom Furnishing"] },
  { id: "home-living", name: "Home & Living", meta: "Wholesale products", subcategories: ["Bedding", "Decor", "Kitchenware"] },
  { id: "accessories", name: "Accessories", meta: "Wholesale products", subcategories: ["Bags", "Jewelry", "Belts"] },
  { id: "beauty", name: "Beauty & Personal Care", meta: "Wholesale products", subcategories: ["Skincare", "Haircare", "Grooming"] },
];

async function seed() {
  const connection = await pool.getConnection();
  try {
    console.log("Seeding categories...");
    for (const c of categories) {
      await connection.query(
        "INSERT INTO categories (id, slug, name, meta, subcategories, status) VALUES (:id, :id, :name, :meta, :subcategories, 'Active') ON DUPLICATE KEY UPDATE name = VALUES(name)",
        { id: c.id, name: c.name, meta: c.meta, subcategories: JSON.stringify(c.subcategories) }
      );
    }

    console.log("Seeding users + vendors...");
    const passwordHash = await hashPassword(DEMO_PASSWORD);

    async function ensureUser({ id, role, name, email, businessName, gstNumber, businessType }) {
      await connection.query(
        `INSERT INTO users (id, role, name, email, phone, password_hash, business_name, gst_number, business_type)
         VALUES (:id, :role, :name, :email, :phone, :passwordHash, :businessName, :gstNumber, :businessType)
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        { id, role, name, email, phone: "9800000000", passwordHash, businessName: businessName || null, gstNumber: gstNumber || null, businessType: businessType || null }
      );
    }

    await ensureUser({ id: "admin-1", role: "admin", name: "Priya Sundaram", email: "demo-admin@marketbridge.example" });
    await ensureUser({
      id: "buyer-1",
      role: "buyer",
      name: "Anita Rao",
      email: "demo-buyer@marketbridge.example",
      businessName: "ABC Textiles Pvt. Ltd.",
      gstNumber: "29AABCA1111Z1ZQ",
      businessType: "Retailer",
    });
    await connection.query(
      `INSERT INTO addresses (id, user_id, label, line1, line2, city, state, pincode, phone, is_default)
       VALUES (:id, 'buyer-1', 'Head Office', '221 Commerce Street', 'MG Road', 'Bengaluru', 'Karnataka', '560001', '9812345670', 1)
       ON DUPLICATE KEY UPDATE label = VALUES(label)`,
      { id: "addr-1" }
    );

    const vendorUserV1 = "vendor-user-1";
    await ensureUser({ id: vendorUserV1, role: "vendor", name: "Lakshmi Narayana", email: "demo-vendor@marketbridge.example" });
    await connection.query(
      `INSERT INTO vendors (id, user_id, slug, name, business_name, owner_name, email, phone, categories, location,
         address_line1, address_city, address_state, address_pincode, gst_number, business_type, status, verified,
         rating, review_count, years_experience, joined_date, image, about, commission_rate)
       VALUES ('v1', :userId, 'sri-lakshmi-handlooms', 'Sri Lakshmi Handlooms', 'Sri Lakshmi Handlooms Pvt. Ltd.', 'Lakshmi Narayana',
         'contact@srilakshmihandlooms.example', '9845012345', :categories, 'Andhra Pradesh',
         '12 Weavers Colony', 'Vijayawada', 'Andhra Pradesh', '520001', '37AAAPL1234C1ZV', 'Manufacturer', 'Approved', 1,
         4.7, 128, 8, '2022-03-14', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Handloom.jpg/500px-Handloom.jpg',
         'Third-generation handloom weavers from Andhra Pradesh producing premium cotton and silk sarees for wholesale buyers across India.', 0.08)
       ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      { userId: vendorUserV1, categories: JSON.stringify(["Sarees", "Handloom"]) }
    );

    const vendorUserV2 = "vendor-user-2";
    await ensureUser({ id: vendorUserV2, role: "vendor", name: "Karthik Subramaniam", email: "vendor2@marketbridge.example" });
    await connection.query(
      `INSERT INTO vendors (id, user_id, slug, name, business_name, owner_name, email, phone, categories, location,
         address_line1, address_city, address_state, address_pincode, gst_number, business_type, status, verified,
         rating, review_count, years_experience, joined_date, image, commission_rate)
       VALUES ('v2', :userId, 'urban-textile-co', 'Urban Textile Co.', 'Urban Textile Company', 'Karthik Subramaniam',
         'sales@urbantextile.example', '9876543210', :categories, 'Tamil Nadu',
         '44 Textile Market Road', 'Tiruppur', 'Tamil Nadu', '641601', '33AABCU9603R1ZM', 'Manufacturer', 'Approved', 1,
         4.5, 96, 10, '2021-11-02', 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=500&q=80', 0.08)
       ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      { userId: vendorUserV2, categories: JSON.stringify(["Apparel"]) }
    );

    const vendorUserV3 = "vendor-user-3";
    await ensureUser({ id: vendorUserV3, role: "vendor", name: "Meera Iyer", email: "vendor3@marketbridge.example" });
    await connection.query(
      `INSERT INTO vendors (id, user_id, slug, name, business_name, owner_name, email, phone, categories, location,
         address_line1, address_city, address_state, address_pincode, business_type, status, verified, joined_date, commission_rate)
       VALUES ('v3', :userId, 'meera-home-goods', 'Meera Home Goods', 'Meera Home Goods Pvt. Ltd.', 'Meera Iyer',
         'contact@meerahomegoods.example', '9822011223', :categories, 'Karnataka',
         '9 Craft Lane', 'Mysuru', 'Karnataka', '570001', 'Manufacturer', 'Pending', 0, CURDATE(), 0.08)
       ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      { userId: vendorUserV3, categories: JSON.stringify(["Home & Living"]) }
    );

    console.log("Seeding products...");

    async function ensureProduct({ id, slug, name, description, categoryId, subcategory, vendorId, sku, price, unit, moq, moqUnit, stock, location, images, bulkPricing }) {
      await connection.query(
        `INSERT INTO products (id, slug, name, description, category_id, subcategory, vendor_id, sku, price, unit, moq, moq_unit, stock, status, location)
         VALUES (:id, :slug, :name, :description, :categoryId, :subcategory, :vendorId, :sku, :price, :unit, :moq, :moqUnit, :stock, 'Active', :location)
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        { id, slug, name, description, categoryId, subcategory, vendorId, sku, price, unit, moq, moqUnit, stock, location }
      );
      await connection.query("DELETE FROM product_images WHERE product_id = :id", { id });
      for (const [i, url] of images.entries()) {
        await connection.query("INSERT INTO product_images (id, product_id, url, sort_order) VALUES (:pid, :id, :url, :i)", { pid: newId(), id, url, i });
      }
      await connection.query("DELETE FROM product_pricing_tiers WHERE product_id = :id", { id });
      for (const t of bulkPricing) {
        await connection.query("INSERT INTO product_pricing_tiers (id, product_id, min_qty, max_qty, price) VALUES (:pid, :id, :minQty, :maxQty, :price)", {
          pid: newId(),
          id,
          minQty: t.minQty,
          maxQty: t.maxQty,
          price: t.price,
        });
      }
    }

    await ensureProduct({
      id: "p1",
      slug: "premium-cotton-saree",
      name: "Premium Cotton Saree",
      description: "Handwoven premium cotton sarees with traditional zari borders, sourced directly from weaver cooperatives in Andhra Pradesh.",
      categoryId: "sarees",
      subcategory: "Cotton Sarees",
      vendorId: "v1",
      sku: "SLH-SAR-001",
      price: 750,
      unit: "piece",
      moq: 20,
      moqUnit: "pieces",
      stock: 420,
      location: "Andhra Pradesh",
      images: ["/images/products/saree-cotton.jpg"],
      bulkPricing: [
        { minQty: 20, maxQty: 49, price: 750 },
        { minQty: 50, maxQty: 99, price: 710 },
        { minQty: 100, maxQty: null, price: 680 },
      ],
    });

    await ensureProduct({
      id: "p2",
      slug: "mens-casual-cotton-shirt",
      name: "Men's Casual Cotton Shirt",
      description: "Breathable cotton casual shirts, made for retail-ready wholesale distribution.",
      categoryId: "apparel",
      subcategory: "Shirts",
      vendorId: "v2",
      sku: "UTC-SHT-002",
      price: 420,
      unit: "piece",
      moq: 25,
      moqUnit: "pieces",
      stock: 600,
      location: "Tamil Nadu",
      images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80"],
      bulkPricing: [
        { minQty: 25, maxQty: 74, price: 420 },
        { minQty: 75, maxQty: 149, price: 390 },
        { minQty: 150, maxQty: null, price: 360 },
      ],
    });

    await ensureProduct({
      id: "p11",
      slug: "silk-blend-designer-saree",
      name: "Silk Blend Designer Saree",
      description: "Designer silk-blend sarees finished with hand-embroidered detailing.",
      categoryId: "sarees",
      subcategory: "Silk Sarees",
      vendorId: "v1",
      sku: "SLH-SAR-011",
      price: 1650,
      unit: "piece",
      moq: 10,
      moqUnit: "pieces",
      stock: 150,
      location: "Andhra Pradesh",
      images: ["/images/products/saree-silk.jpg"],
      bulkPricing: [
        { minQty: 10, maxQty: 29, price: 1650 },
        { minQty: 30, maxQty: null, price: 1550 },
      ],
    });

    await ensureProduct({
      id: "p13",
      slug: "fast-charging-20000mah-power-bank",
      name: "20000mAh 65W Fast Charging Power Bank",
      description: "Heavy-duty 20000mAh portable power bank with dual USB-C Power Delivery 65W, digital smart LED battery percentage indicator, and multi-protocol fast charging support.",
      categoryId: "electronics",
      subcategory: "Mobile Accessories",
      vendorId: "v3",
      sku: "TSI-PB-200",
      price: 1150,
      unit: "piece",
      moq: 20,
      moqUnit: "pieces",
      stock: 1400,
      location: "Karnataka",
      images: ["/images/products/power-bank-20000mah.jpg"],
      bulkPricing: [
        { minQty: 20, maxQty: 49, price: 1150 },
        { minQty: 50, maxQty: 99, price: 1050 },
        { minQty: 100, maxQty: null, price: 950 },
      ],
    });

    await ensureProduct({
      id: "p14",
      slug: "magnetic-wireless-10000mah-power-bank",
      name: "Magnetic Wireless 10000mAh Power Bank",
      description: "Ultra-slim 10000mAh magnetic wireless power bank with MagSafe compatibility, 15W fast wireless charging, and 20W PD wired output.",
      categoryId: "electronics",
      subcategory: "Mobile Accessories",
      vendorId: "v3",
      sku: "TSI-WPB-100",
      price: 890,
      unit: "piece",
      moq: 25,
      moqUnit: "pieces",
      stock: 850,
      location: "Karnataka",
      images: ["/images/products/power-bank-wireless.jpg"],
      bulkPricing: [
        { minQty: 25, maxQty: 49, price: 890 },
        { minQty: 50, maxQty: 99, price: 820 },
        { minQty: 100, maxQty: null, price: 760 },
      ],
    });

    console.log("Seeding a sample quote (Counter Offer)...");
    await connection.query(
      `INSERT INTO quotes (id, buyer_id, product_id, vendor_id, quantity, target_price, delivery_location, message, status, response_price, response_message, responded_at)
       VALUES ('QT-5001', 'buyer-1', 'p1', 'v1', 200, 680, 'Bengaluru, Karnataka', 'Looking for a recurring monthly supply of 200 pieces. Please share your best rate.',
         'Counter Offer', 700, 'We can offer ₹700/piece for a 6-month recurring commitment with monthly dispatch.', UTC_TIMESTAMP())
       ON DUPLICATE KEY UPDATE status = VALUES(status)`
    );

    console.log("Seed complete.");
    console.log("\nDemo accounts (password for all: %s):", DEMO_PASSWORD);
    console.log("  Admin:  demo-admin@marketbridge.example");
    console.log("  Vendor: demo-vendor@marketbridge.example  (Sri Lakshmi Handlooms, v1, Approved)");
    console.log("  Buyer:  demo-buyer@marketbridge.example");
  } finally {
    connection.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
