export const payouts = [
  { id: "P1023", vendorId: "v1", amount: 45000, requestedDate: "2026-09-01", status: "Completed" },
  { id: "P1024", vendorId: "v1", amount: 41200, requestedDate: "2026-09-20", status: "Pending" },
  { id: "P1019", vendorId: "v2", amount: 58900, requestedDate: "2026-09-18", status: "Processing" },
  { id: "P1011", vendorId: "v3", amount: 30800, requestedDate: "2026-08-25", status: "Completed" },
  { id: "P1007", vendorId: "v5", amount: 19200, requestedDate: "2026-08-12", status: "Completed" },
  { id: "P1030", vendorId: "v9", amount: 4200, requestedDate: "2026-09-19", status: "Rejected" },
];

export function getPayoutsByVendor(vendorId) {
  return payouts.filter((p) => p.vendorId === vendorId);
}
