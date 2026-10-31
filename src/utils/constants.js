export const ROLES = {
  GUEST: "guest",
  BUYER: "buyer",
  VENDOR: "vendor",
  ADMIN: "admin",
};

export const VENDOR_ORDER_STATUS_FLOW = [
  "Pending",
  "Accepted",
  "Processing",
  "Ready to Ship",
  "Shipped",
  "Delivered",
];

export const VENDOR_ORDER_TERMINAL_STATUSES = ["Cancelled", "Return Requested"];

export const ORDER_TIMELINE_STEPS = [
  "Order Placed",
  "Payment Confirmed",
  "Processing",
  "Ready to Ship",
  "Shipped",
  "Delivered",
];

export const PRODUCT_STATUS = {
  DRAFT: "Draft",
  PENDING_APPROVAL: "Pending Approval",
  ACTIVE: "Active",
  REJECTED: "Rejected",
  OUT_OF_STOCK: "Out of Stock",
  INACTIVE: "Inactive",
};

export const VENDOR_STATUS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  SUSPENDED: "Suspended",
};

export const QUOTE_STATUS = {
  PENDING: "Pending",
  COUNTER_OFFER: "Counter Offer",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
};

export const PAYMENT_STATUS = {
  PENDING: "Pending",
  SUCCESSFUL: "Successful",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

export const PAYOUT_STATUS = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
};

export const LOCATIONS = [
  "Andhra Pradesh",
  "Telangana",
  "Karnataka",
  "Tamil Nadu",
  "Gujarat",
  "Delhi",
  "Maharashtra",
];

export const MOQ_RANGES = [
  { id: "under-10", label: "Under 10", min: 0, max: 9 },
  { id: "10-50", label: "10–50", min: 10, max: 50 },
  { id: "50-100", label: "50–100", min: 50, max: 100 },
  { id: "100-plus", label: "100+", min: 100, max: Infinity },
];

export const PLATFORM_COMMISSION_RATE = 0.08;

export const GST_RATE = 0.18;

export const DEMO_NOTICE =
  "Prototype authentication — no real accounts or passwords are used. Pick a role to preview that experience.";
