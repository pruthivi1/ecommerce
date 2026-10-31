import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingCart, AlertTriangle, ArrowRight } from "lucide-react";
import Container from "../components/common/Container.jsx";
import Breadcrumb from "../components/common/Breadcrumb.jsx";
import Button from "../components/common/Button.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import ImageWithFallback from "../components/common/ImageWithFallback.jsx";
import { useCart } from "../hooks/useCart.js";
import { formatCurrency } from "../utils/format.js";

export default function Cart() {
  const { vendorGroups, totals, checkoutIssues, updateQty, remove, itemCount } = useCart();

  if (itemCount === 0) {
    return (
      <Container className="py-16">
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Browse the marketplace and add wholesale products to get started."
          action={
            <Button as={Link} to="/products" size="sm">
              Explore Products
            </Button>
          }
        />
      </Container>
    );
  }

  return (
    <Container className="flex flex-col gap-6 py-8">
      <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Cart" }]} />
      <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">Your Cart</h1>

      {checkoutIssues.length > 0 && (
        <div className="flex items-start gap-2 rounded-md border border-warning-500/30 bg-warning-50 px-4 py-3 text-sm text-warning-600">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
          <div>
            <p className="font-medium">Resolve these before checkout:</p>
            <ul className="mt-1 list-disc pl-4">
              {checkoutIssues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6">
          {vendorGroups.map((group) => (
            <div key={group.vendorId} className="overflow-hidden rounded-lg border border-border bg-white">
              <div className="flex items-center justify-between border-b border-border bg-bg px-4 py-3">
                <Link to={`/suppliers/${group.vendorId}`} className="text-sm font-semibold text-text hover:text-brand-700">
                  {group.vendor?.name || "Vendor"}
                </Link>
                <span className="text-xs text-text-secondary">{group.vendor?.location}</span>
              </div>

              {group.unavailable && (
                <div className="flex items-start gap-2 border-b border-border bg-error-50 px-4 py-2.5 text-sm text-error-600">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                  <p>
                    <span className="font-medium">Seller unavailable.</span> {group.unavailableReason}
                  </p>
                </div>
              )}

              <ul className="divide-y divide-border">
                {group.items.map((item) => (
                  <li key={item.productId} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-slate-100">
                      <ImageWithFallback src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <Link to={`/products/${item.productId}`} className="text-sm font-medium text-text hover:text-brand-700">
                        {item.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-text-secondary">
                        {formatCurrency(item.price)} / {item.unit} · MOQ {item.moq} {item.moqUnit}
                        {item.qty < item.moq && <span className="ml-1 font-medium text-warning-600">Below MOQ</span>}
                      </p>
                      {item.negotiated && (
                        <p className="mt-0.5 text-xs font-medium text-success-600">Negotiated quote price — locked in.</p>
                      )}
                      {item.priceChanged && (
                        <p className="mt-0.5 text-xs font-medium text-brand-700">
                          Price updated to {formatCurrency(item.price)} since you added this item.
                        </p>
                      )}
                      {item.unavailable && !group.unavailable && (
                        <p className="mt-0.5 text-xs font-medium text-error-600">{item.unavailableReason}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-md border border-border">
                        <button
                          type="button"
                          onClick={() => updateQty(item.productId, item.qty - 1)}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="flex h-9 w-9 items-center justify-center text-text-secondary hover:bg-slate-50"
                        >
                          <Minus className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                        </button>
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => updateQty(item.productId, Math.max(1, Number(e.target.value) || 1))}
                          className="h-9 w-16 border-x border-border text-center text-sm focus:outline-none"
                          aria-label={`Quantity of ${item.name}`}
                        />
                        <button
                          type="button"
                          onClick={() => updateQty(item.productId, item.qty + 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="flex h-9 w-9 items-center justify-center text-text-secondary hover:bg-slate-50"
                        >
                          <Plus className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                        </button>
                      </div>
                      <span className="w-24 shrink-0 text-right text-sm font-semibold text-text">
                        {formatCurrency(item.qty * item.price)}
                      </span>
                      <button
                        type="button"
                        onClick={() => remove(item.productId)}
                        aria-label={`Remove ${item.name} from cart`}
                        className="text-text-secondary hover:text-error-600"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
                <span className="text-text-secondary">Vendor subtotal</span>
                <span className="font-semibold text-text">{formatCurrency(group.subtotal)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex h-fit flex-col gap-4 rounded-lg border border-border bg-white p-5">
          <h2 className="text-sm font-semibold text-text">Order Summary</h2>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-text-secondary">
              <span>Subtotal</span>
              <span className="text-text">{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Shipping</span>
              <span className="text-text">{formatCurrency(totals.shipping)}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>GST (18%)</span>
              <span className="text-text">{formatCurrency(totals.gst)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-text">
              <span>Total</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>
          <Button as={Link} to="/checkout" size="lg" disabled={checkoutIssues.length > 0}>
            Proceed to Checkout
            <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </Button>
          {checkoutIssues.length > 0 && (
            <p className="text-xs text-warning-600">Resolve the issues above to continue.</p>
          )}
        </div>
      </div>
    </Container>
  );
}
