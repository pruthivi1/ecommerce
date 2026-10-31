import { query } from "../config/db.js";
import { newId, prefixedCode } from "../utils/id.js";

const VENDOR_ORDER_STATUS_FLOW = ["Pending", "Accepted", "Processing", "Ready to Ship", "Shipped", "Delivered"];

function mapOrderRow(orderRow, vendorOrders) {
  return {
    id: orderRow.id,
    orderNumber: orderRow.order_number,
    buyerId: orderRow.buyer_id,
    addressId: orderRow.address_id,
    paymentStatus: orderRow.payment_status,
    paymentMethod: orderRow.payment_method,
    subtotal: Number(orderRow.subtotal),
    shipping: Number(orderRow.shipping),
    gst: Number(orderRow.gst),
    total: Number(orderRow.total),
    placedAt: orderRow.placed_at,
    vendorOrders,
  };
}

function mapVendorOrder(row, items, history) {
  return {
    id: row.id,
    vendorOrderNumber: row.vendor_order_number,
    orderId: row.order_id,
    vendorId: row.vendor_id,
    vendorName: row.vendor_name,
    status: row.status,
    subtotal: Number(row.subtotal),
    cancelledReason: row.cancelled_reason,
    returnReason: row.return_reason,
    items: items.map((i) => ({
      productId: i.product_id,
      name: i.product_name_snapshot,
      image: i.product_image_snapshot,
      sku: i.sku_snapshot,
      qty: i.qty,
      price: Number(i.unit_price),
      negotiated: Boolean(i.negotiated),
    })),
    timeline: history.map((h) => ({ step: h.status, date: h.changed_at, done: true })),
  };
}

export async function getOrderById(id) {
  const orderRows = await query("SELECT * FROM orders WHERE id = :id LIMIT 1", { id });
  const orderRow = orderRows[0];
  if (!orderRow) return null;
  const voRows = await query(
    "SELECT vo.*, v.name AS vendor_name FROM vendor_orders vo JOIN vendors v ON v.id = vo.vendor_id WHERE vo.order_id = :id ORDER BY vo.created_at ASC",
    { id }
  );
  const vendorOrders = await Promise.all(
    voRows.map(async (vo) => {
      const items = await query("SELECT * FROM order_items WHERE vendor_order_id = :id", { id: vo.id });
      const history = await query("SELECT * FROM order_status_history WHERE vendor_order_id = :id ORDER BY changed_at ASC", { id: vo.id });
      return mapVendorOrder(vo, items, history);
    })
  );
  return mapOrderRow(orderRow, vendorOrders);
}

export async function listOrders({ buyerId, status } = {}) {
  const clauses = [];
  const params = {};
  if (buyerId) {
    clauses.push("o.buyer_id = :buyerId");
    params.buyerId = buyerId;
  }
  if (status) {
    clauses.push("EXISTS (SELECT 1 FROM vendor_orders vo WHERE vo.order_id = o.id AND vo.status = :status)");
    params.status = status;
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = await query(`SELECT o.* FROM orders o ${where} ORDER BY o.placed_at DESC`, params);
  return Promise.all(rows.map((r) => getOrderById(r.id)));
}

export async function listVendorOrders(vendorId, { status } = {}) {
  const clauses = ["vo.vendor_id = :vendorId"];
  const params = { vendorId };
  if (status) {
    clauses.push("vo.status = :status");
    params.status = status;
  }
  const rows = await query(
    `SELECT vo.*, o.placed_at, o.buyer_id, o.order_number
     FROM vendor_orders vo JOIN orders o ON o.id = vo.order_id
     WHERE ${clauses.join(" AND ")} ORDER BY o.placed_at DESC`,
    params
  );
  return Promise.all(
    rows.map(async (vo) => {
      const items = await query("SELECT * FROM order_items WHERE vendor_order_id = :id", { id: vo.id });
      const history = await query("SELECT * FROM order_status_history WHERE vendor_order_id = :id ORDER BY changed_at ASC", { id: vo.id });
      return { ...mapVendorOrder(vo, items, history), orderId: vo.order_id, placedAt: vo.placed_at, buyerId: vo.buyer_id, orderNumber: vo.order_number };
    })
  );
}

/**
 * Creates the master order, its per-vendor sub-orders, line items (with a
 * commercial snapshot) and the initial status-history row, all inside one
 * transaction via the provided connection — either every row is written or
 * none are.
 */
export async function insertOrder(connection, { buyerId, addressId, paymentMethod, paymentStatus, vendorGroups, shippingFeePerVendor, gstRate }) {
  const orderId = newId();
  const orderNumber = prefixedCode("ORD");
  const placedAt = new Date();

  const vendorOrderRows = [];
  let subtotal = 0;
  for (const group of vendorGroups) {
    const groupSubtotal = group.items.reduce((sum, item) => sum + item.qty * item.price, 0);
    subtotal += groupSubtotal;
    const vendorOrderId = newId();
    const vendorOrderNumber = `${orderNumber}-${group.vendorId.slice(0, 4).toUpperCase()}`;
    vendorOrderRows.push({ vendorOrderId, vendorOrderNumber, vendorId: group.vendorId, items: group.items, subtotal: groupSubtotal });
  }

  const shipping = vendorOrderRows.length * shippingFeePerVendor;
  const gst = Math.round(subtotal * gstRate);
  const total = subtotal + shipping + gst;

  await connection.query(
    `INSERT INTO orders (id, order_number, buyer_id, address_id, payment_status, payment_method, subtotal, shipping, gst, total, placed_at)
     VALUES (:id, :orderNumber, :buyerId, :addressId, :paymentStatus, :paymentMethod, :subtotal, :shipping, :gst, :total, :placedAt)`,
    { id: orderId, orderNumber, buyerId, addressId: addressId || null, paymentStatus, paymentMethod: paymentMethod || null, subtotal, shipping, gst, total, placedAt }
  );

  for (const vo of vendorOrderRows) {
    await connection.query(
      `INSERT INTO vendor_orders (id, vendor_order_number, order_id, vendor_id, status, subtotal)
       VALUES (:id, :vendorOrderNumber, :orderId, :vendorId, 'Pending', :subtotal)`,
      { id: vo.vendorOrderId, vendorOrderNumber: vo.vendorOrderNumber, orderId, vendorId: vo.vendorId, subtotal: vo.subtotal }
    );
    await connection.query(
      "INSERT INTO order_status_history (id, vendor_order_id, status) VALUES (:id, :vendorOrderId, 'Pending')",
      { id: newId(), vendorOrderId: vo.vendorOrderId }
    );
    for (const item of vo.items) {
      await connection.query(
        `INSERT INTO order_items (id, vendor_order_id, product_id, quote_id, product_name_snapshot, product_image_snapshot, sku_snapshot, qty, unit_price, negotiated)
         VALUES (:id, :vendorOrderId, :productId, :quoteId, :name, :image, :sku, :qty, :price, :negotiated)`,
        {
          id: newId(),
          vendorOrderId: vo.vendorOrderId,
          productId: item.productId,
          quoteId: item.quoteId || null,
          name: item.name,
          image: item.image || null,
          sku: item.sku || null,
          qty: item.qty,
          price: item.price,
          negotiated: item.negotiated ? 1 : 0,
        }
      );
    }
  }

  return { orderId, orderNumber, vendorOrderIds: vendorOrderRows.map((v) => v.vendorOrderId) };
}

export async function updateVendorOrderStatus(vendorOrderId, nextStatus) {
  const rows = await query("SELECT * FROM vendor_orders WHERE id = :id LIMIT 1", { id: vendorOrderId });
  const vo = rows[0];
  if (!vo) return { error: "not_found" };

  const currentIndex = VENDOR_ORDER_STATUS_FLOW.indexOf(vo.status);
  const nextIndex = VENDOR_ORDER_STATUS_FLOW.indexOf(nextStatus);
  const isValidForwardMove = currentIndex !== -1 && nextIndex === currentIndex + 1;
  const isTerminalMove = nextStatus === "Cancelled" || nextStatus === "Return Requested";
  if (!isValidForwardMove && !isTerminalMove) {
    return { error: "invalid_transition", from: vo.status, to: nextStatus };
  }

  await query("UPDATE vendor_orders SET status = :status WHERE id = :id", { id: vendorOrderId, status: nextStatus });
  await query("INSERT INTO order_status_history (id, vendor_order_id, status) VALUES (:id, :vendorOrderId, :status)", {
    id: newId(),
    vendorOrderId,
    status: nextStatus,
  });
  return { vendorOrder: { ...vo, status: nextStatus } };
}

export async function setCancelled(vendorOrderId, reason) {
  await query("UPDATE vendor_orders SET status = 'Cancelled', cancelled_reason = :reason WHERE id = :id", { id: vendorOrderId, reason });
  await query("INSERT INTO order_status_history (id, vendor_order_id, status) VALUES (:id, :vendorOrderId, 'Cancelled')", { id: newId(), vendorOrderId });
}

export async function setReturnRequested(vendorOrderId, reason) {
  await query("UPDATE vendor_orders SET status = 'Return Requested', return_reason = :reason WHERE id = :id", { id: vendorOrderId, reason });
  await query("INSERT INTO order_status_history (id, vendor_order_id, status) VALUES (:id, :vendorOrderId, 'Return Requested')", { id: newId(), vendorOrderId });
}

export async function getVendorOrderRaw(vendorOrderId) {
  const rows = await query("SELECT * FROM vendor_orders WHERE id = :id LIMIT 1", { id: vendorOrderId });
  return rows[0] || null;
}

export function nextValidStatuses(currentStatus) {
  const currentIndex = VENDOR_ORDER_STATUS_FLOW.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex === VENDOR_ORDER_STATUS_FLOW.length - 1) return [];
  return [VENDOR_ORDER_STATUS_FLOW[currentIndex + 1]];
}
