import { useState } from "react";
import { useParams } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Button from "../../components/common/Button.jsx";
import ImageWithFallback from "../../components/common/ImageWithFallback.jsx";
import LoadingState from "../../components/common/LoadingState.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import OrderTimeline from "../../components/order/OrderTimeline.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useToast } from "../../hooks/useToast.js";
import { getOrderById, updateVendorOrderStatus, nextValidStatuses } from "../../services/orderService.js";
import { demoUsers } from "../../data/users.js";
import { formatCurrency, formatDateTime } from "../../utils/format.js";
import { VENDOR_ORDER_STATUS_FLOW } from "../../utils/constants.js";

export default function VendorOrderDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const vendorId = user?.vendorId || "v1";
  const { show } = useToast();
  const { data: order, loading, error, setData } = useAsync(() => getOrderById(id), [id]);
  const [updating, setUpdating] = useState(false);

  if (loading) return <LoadingState count={1} />;
  if (error || !order) return <ErrorState message="Order not found." />;

  const vendorOrder = order.vendorOrders.find((vo) => vo.vendorId === vendorId);
  if (!vendorOrder) return <ErrorState message="This order does not belong to your store." />;

  const nextOptions = nextValidStatuses(vendorOrder.status);
  const isTerminal = VENDOR_ORDER_STATUS_FLOW.indexOf(vendorOrder.status) === VENDOR_ORDER_STATUS_FLOW.length - 1;

  const advanceStatus = async (nextStatus) => {
    setUpdating(true);
    try {
      await updateVendorOrderStatus(order.id, vendorOrder.id, nextStatus);
      const updated = await getOrderById(order.id);
      setData(updated);
      show(`Order marked as ${nextStatus}.`, { type: "success" });
    } catch (err) {
      show(err.message, { type: "error" });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Orders", to: "/vendor/orders" }, { label: order.id }]} />

      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text sm:text-2xl">Order {vendorOrder.id}</h1>
          <p className="text-sm text-text-secondary">
            Placed by {demoUsers.buyer.businessName} on {formatDateTime(order.placedAt)}
          </p>
        </div>
        <StatusBadge status={vendorOrder.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-text">Items</h2>
            <ul className="flex flex-col gap-3">
              {vendorOrder.items.map((item) => (
                <li key={item.productId} className="flex items-center gap-3 text-sm">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-slate-100">
                    <ImageWithFallback src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <span className="flex-1 text-text">{item.name}</span>
                  <span className="text-text-secondary">Qty {item.qty}</span>
                  <span className="w-24 text-right font-medium text-text">{formatCurrency(item.qty * item.price)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm font-semibold text-text">
              <span>Order Subtotal</span>
              <span>{formatCurrency(vendorOrder.subtotal)}</span>
            </div>
          </div>

          {!isTerminal && nextOptions.length > 0 && (
            <div className="rounded-lg border border-border bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold text-text">Update Status</h2>
              <p className="mb-3 text-sm text-text-secondary">
                Move this order forward in the fulfilment flow. Statuses can only progress one step at a time.
              </p>
              <div className="flex flex-wrap gap-2">
                {nextOptions.map((s) => (
                  <Button key={s} size="sm" onClick={() => advanceStatus(s)} disabled={updating}>
                    Mark as {s}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-text">Tracking</h2>
          <OrderTimeline timeline={vendorOrder.timeline} />
        </div>
      </div>
    </div>
  );
}
