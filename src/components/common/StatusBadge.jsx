import Badge from "./Badge.jsx";

const STATUS_TONES = {
  // success-ish
  Active: "success",
  Approved: "success",
  Delivered: "success",
  Completed: "success",
  Successful: "success",
  Accepted: "success",
  Verified: "success",
  Shipped: "success",
  "In Stock": "success",
  // warning-ish
  Pending: "warning",
  "Pending Approval": "warning",
  "Pending Review": "warning",
  Processing: "warning",
  "Ready to Ship": "warning",
  "Counter Offer": "warning",
  Draft: "warning",
  Submitted: "warning",
  // error-ish
  Rejected: "error",
  Cancelled: "error",
  Suspended: "error",
  Failed: "error",
  "Out of Stock": "error",
  "Return Requested": "error",
  Inactive: "error",
  // neutral
  Refunded: "neutral",
  Expired: "neutral",
};

export default function StatusBadge({ status, className = "" }) {
  const tone = STATUS_TONES[status] || "neutral";
  return (
    <Badge tone={tone} className={className}>
      {status}
    </Badge>
  );
}
