import { useState } from "react";
import { useParams } from "react-router-dom";
import { FileDown } from "lucide-react";
import Breadcrumb from "../../components/common/Breadcrumb.jsx";
import Button from "../../components/common/Button.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Modal from "../../components/common/Modal.jsx";
import Textarea from "../../components/common/Textarea.jsx";
import ImageWithFallback from "../../components/common/ImageWithFallback.jsx";
import LoadingState from "../../components/common/LoadingState.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import OrderTimeline from "../../components/order/OrderTimeline.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { getOrderById, requestCancellation, requestReturn } from "../../services/orderService.js";
import { formatCurrency, formatDateTime } from "../../utils/format.js";
import { useToast } from "../../hooks/useToast.js";

export default function BuyerOrderDetails() {
  const { id } = useParams();
  const { data: order, loading, error, setData } = useAsync(() => getOrderById(id), [id]);
  const { show } = useToast();
  const [actionTarget, setActionTarget] = useState(null); // { vendorOrderId, type }
  const [reason, setReason] = useState("");
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  if (loading) return <LoadingState count={1} />;
  if (error || !order) return <ErrorState message="Order not found." />;

  const submitAction = async () => {
    if (!actionTarget) return;
    const fn = actionTarget.type === "cancel" ? requestCancellation : requestReturn;
    try {
      // The backend raises the refund request with admin as part of this
      // same call — payment was already captured at checkout, so
      // cancelling or returning a paid order always means money is owed
      // back to the buyer.
      await fn(order.id, actionTarget.vendorOrderId, reason);
    } catch (err) {
      show(err.message, { type: "error" });
      setActionTarget(null);
      setReason("");
      return;
    }
    const updated = await getOrderById(order.id);
    setData(updated);
    show(
      actionTarget.type === "cancel"
        ? "Cancellation requested. A refund request has been sent to the marketplace team."
        : "Return requested. A refund request has been sent to the marketplace team.",
      { type: "success" }
    );
    setActionTarget(null);
    setReason("");
  };

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Orders", to: "/buyer/orders" }, { label: order.id }]} />

      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text sm:text-2xl">Order {order.id}</h1>
          <p className="text-sm text-text-secondary">Placed on {formatDateTime(order.placedAt)}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setInvoiceOpen(true)}>
          <FileDown className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          View Invoice
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryStat label="Payment Status" value={<StatusBadge status={order.paymentStatus} />} />
        <SummaryStat label="Payment Method" value={order.paymentMethod} />
        <SummaryStat label="Vendors" value={order.vendorOrders.length} />
        <SummaryStat label="Total" value={formatCurrency(order.total)} />
      </div>

      <div className="flex flex-col gap-5">
        {order.vendorOrders.map((vo) => {
          const canCancel = ["Pending", "Accepted"].includes(vo.status);
          const canReturn = vo.status === "Delivered";
          return (
            <div key={vo.id} className="rounded-lg border border-border bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                <div>
                  <p className="text-sm font-semibold text-text">{vo.vendorName || "Vendor"}</p>
                  <p className="text-xs text-text-secondary">{vo.id}</p>
                </div>
                <StatusBadge status={vo.status} />
              </div>

              <div className="grid grid-cols-1 gap-6 pt-4 lg:grid-cols-[1fr_260px]">
                <div className="flex flex-col gap-3">
                  <ul className="flex flex-col gap-3">
                    {vo.items.map((item) => (
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

                  {vo.cancelledReason && (
                    <p className="rounded-md bg-error-50 px-3 py-2 text-xs text-error-600">Cancelled: {vo.cancelledReason}</p>
                  )}
                  {vo.returnReason && (
                    <p className="rounded-md bg-warning-50 px-3 py-2 text-xs text-warning-600">Return requested: {vo.returnReason}</p>
                  )}

                  {(canCancel || canReturn) && (
                    <div className="flex gap-2 pt-1">
                      {canCancel && (
                        <Button variant="outline" size="sm" onClick={() => setActionTarget({ vendorOrderId: vo.id, type: "cancel" })}>
                          Cancel Order
                        </Button>
                      )}
                      {canReturn && (
                        <Button variant="outline" size="sm" onClick={() => setActionTarget({ vendorOrderId: vo.id, type: "return" })}>
                          Request Return
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">Tracking</h3>
                  <OrderTimeline timeline={vo.timeline} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={!!actionTarget}
        onClose={() => setActionTarget(null)}
        title={actionTarget?.type === "cancel" ? "Cancel Order" : "Request Return"}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setActionTarget(null)}>Back</Button>
            <Button size="sm" onClick={submitAction} disabled={!reason.trim()} className="bg-error-600 hover:bg-error-700 border-error-600">
              {actionTarget?.type === "cancel" ? "Confirm Cancellation" : "Submit Return Request"}
            </Button>
          </>
        }
      >
        <Textarea
          label="Reason"
          required
          placeholder={actionTarget?.type === "cancel" ? "Why are you cancelling this order?" : "Describe the issue with your order"}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </Modal>

      <Modal open={invoiceOpen} onClose={() => setInvoiceOpen(false)} title={`Invoice — ${order.id}`} size="lg">
        <div className="flex flex-col gap-4 text-sm">
          <div className="flex justify-between text-text-secondary">
            <span>Order Date</span>
            <span className="text-text">{formatDateTime(order.placedAt)}</span>
          </div>
          {order.vendorOrders.map((vo) => (
            <div key={vo.id}>
              <p className="font-medium text-text">{vo.vendorName}</p>
              <table className="mt-2 w-full text-left">
                <thead>
                  <tr className="text-xs uppercase text-text-secondary">
                    <th className="py-1">Item</th>
                    <th className="py-1 text-right">Qty</th>
                    <th className="py-1 text-right">Price</th>
                    <th className="py-1 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {vo.items.map((item) => (
                    <tr key={item.productId} className="border-t border-border">
                      <td className="py-1.5 text-text">{item.name}</td>
                      <td className="py-1.5 text-right text-text-secondary">{item.qty}</td>
                      <td className="py-1.5 text-right text-text-secondary">{formatCurrency(item.price)}</td>
                      <td className="py-1.5 text-right font-medium text-text">{formatCurrency(item.qty * item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          <div className="flex flex-col gap-1 border-t border-border pt-3">
            <div className="flex justify-between text-text-secondary"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
            <div className="flex justify-between text-text-secondary"><span>Shipping</span><span>{formatCurrency(order.shipping)}</span></div>
            <div className="flex justify-between text-text-secondary"><span>GST</span><span>{formatCurrency(order.gst)}</span></div>
            <div className="flex justify-between text-base font-semibold text-text"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function SummaryStat({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <p className="text-xs text-text-secondary">{label}</p>
      <div className="mt-1 text-sm font-semibold text-text">{value}</div>
    </div>
  );
}
