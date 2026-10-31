import { useParams } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import ImageWithFallback from "../../components/common/ImageWithFallback.jsx";
import LoadingState from "../../components/common/LoadingState.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import OrderTimeline from "../../components/order/OrderTimeline.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { getOrderById } from "../../services/orderService.js";
import { getVendorById } from "../../data/vendors.js";
import { demoUsers } from "../../data/users.js";
import { formatCurrency, formatDateTime } from "../../utils/format.js";

export default function AdminOrderDetails() {
  const { id } = useParams();
  const { data: order, loading, error } = useAsync(() => getOrderById(id), [id]);

  if (loading) return <LoadingState count={1} />;
  if (error || !order) return <ErrorState message="Order not found." />;

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Orders", to: "/admin/orders" }, { label: order.id }]} />

      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text sm:text-2xl">Master Order {order.id}</h1>
          <p className="text-sm text-text-secondary">
            Buyer: {demoUsers.buyer.businessName} · Placed {formatDateTime(order.placedAt)}
          </p>
        </div>
        <StatusBadge status={order.paymentStatus} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryStat label="Payment Method" value={order.paymentMethod} />
        <SummaryStat label="Vendors" value={order.vendorOrders.length} />
        <SummaryStat label="Items" value={order.vendorOrders.reduce((s, vo) => s + vo.items.reduce((s2, i) => s2 + i.qty, 0), 0)} />
        <SummaryStat label="Total" value={formatCurrency(order.total)} />
      </div>

      <div className="flex flex-col gap-5">
        {order.vendorOrders.map((vo) => {
          const vendor = getVendorById(vo.vendorId);
          return (
            <div key={vo.id} className="rounded-lg border border-border bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                <div>
                  <p className="text-sm font-semibold text-text">{vendor?.name} Order</p>
                  <p className="text-xs text-text-secondary">{vo.id}</p>
                </div>
                <StatusBadge status={vo.status} />
              </div>
              <div className="grid grid-cols-1 gap-6 pt-4 lg:grid-cols-[1fr_260px]">
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
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">Tracking</h3>
                  <OrderTimeline timeline={vo.timeline} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
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
