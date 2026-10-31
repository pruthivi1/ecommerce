import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Package } from "lucide-react";
import Container from "../components/common/Container.jsx";
import Button from "../components/common/Button.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import LoadingState from "../components/common/LoadingState.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { getOrderById } from "../services/orderService.js";
import { formatCurrency, formatDateTime } from "../utils/format.js";

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const { data: order, loading, error } = useAsync(() => getOrderById(orderId), [orderId]);

  if (loading) return <Container className="py-16"><LoadingState count={1} /></Container>;
  if (error || !order) return <Container className="py-16"><ErrorState message="Order not found." /></Container>;

  return (
    <Container className="flex flex-col items-center gap-6 py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success-50 text-success-600">
        <CheckCircle2 className="h-8 w-8" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <div>
        <h1 className="text-2xl font-semibold text-text sm:text-3xl">Order Placed Successfully</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Order <span className="font-medium text-text">{order.id}</span> was placed on {formatDateTime(order.placedAt)}.
        </p>
      </div>

      <div className="w-full max-w-md rounded-lg border border-border bg-white p-6 text-left">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <span className="text-sm text-text-secondary">Total Paid</span>
          <span className="text-lg font-semibold text-text">{formatCurrency(order.total)}</span>
        </div>
        <ul className="mt-3 flex flex-col gap-2">
          {order.vendorOrders.map((vo) => (
            <li key={vo.id} className="flex items-center gap-2 text-sm text-text-secondary">
              <Package className="h-4 w-4 text-brand-600" strokeWidth={1.75} aria-hidden="true" />
              {vo.items.length} item(s) from vendor order {vo.id}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button as={Link} to={`/buyer/orders/${order.id}`} size="lg">
          View Order Details
        </Button>
        <Button as={Link} to="/products" variant="secondary" size="lg">
          Continue Shopping
        </Button>
      </div>
    </Container>
  );
}
