import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Check, MapPin, CreditCard, ClipboardCheck, AlertTriangle } from "lucide-react";
import Container from "../components/common/Container.jsx";
import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input.jsx";
import ImageWithFallback from "../components/common/ImageWithFallback.jsx";
import { useCart } from "../hooks/useCart.js";
import { useToast } from "../hooks/useToast.js";
import { useAsync } from "../hooks/useAsync.js";
import { getAddresses, addAddress } from "../services/addressService.js";
import { createOrder } from "../services/orderService.js";
import { PAYMENT_METHODS, getPaymentsStatus } from "../services/paymentService.js";
import { formatCurrency } from "../utils/format.js";
import { validateFields, hasErrors, required, isPincode, isPhone } from "../utils/validators.js";

const STEPS = [
  { id: 1, label: "Address", icon: MapPin },
  { id: 2, label: "Review", icon: ClipboardCheck },
  { id: 3, label: "Payment", icon: CreditCard },
];

function StepIndicator({ step }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-4">
      {STEPS.map((s, index) => (
        <li key={s.id} className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold ${
                step > s.id
                  ? "border-brand-700 bg-brand-700 text-white"
                  : step === s.id
                    ? "border-brand-700 text-brand-700"
                    : "border-border text-text-secondary"
              }`}
            >
              {step > s.id ? <Check className="h-4 w-4" strokeWidth={2.5} /> : s.id}
            </span>
            <span className={`hidden text-sm font-medium sm:inline ${step >= s.id ? "text-text" : "text-text-secondary"}`}>
              {s.label}
            </span>
          </div>
          {index < STEPS.length - 1 && <span className="h-px w-6 bg-border sm:w-12" />}
        </li>
      ))}
    </ol>
  );
}

export default function Checkout() {
  const { vendorGroups, totals, checkoutIssues, clear, itemCount } = useCart();
  const { show } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const { data: addresses, setData: setAddresses } = useAsync(() => getAddresses(), []);
  const { data: paymentsStatus } = useAsync(() => getPaymentsStatus(), []);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddAddress, setShowAddAddress] = useState(false);

  useEffect(() => {
    if (!addresses || selectedAddressId) return;
    setSelectedAddressId(addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || null);
  }, [addresses, selectedAddressId]);
  const [addressForm, setAddressForm] = useState({ label: "", line1: "", city: "", state: "", pincode: "", phone: "" });
  const [addressErrors, setAddressErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [processing, setProcessing] = useState(false);

  if (itemCount === 0) {
    return (
      <Container className="flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="text-xl font-semibold text-text">Your cart is empty</h1>
        <p className="text-sm text-text-secondary">Add products to your cart before checking out.</p>
        <Button as={Link} to="/products" size="sm">
          Explore Products
        </Button>
      </Container>
    );
  }

  const handleAddAddress = async () => {
    const errors = validateFields(addressForm, {
      label: [required],
      line1: [required],
      city: [required],
      state: [required],
      pincode: [required, isPincode],
      phone: [required, isPhone],
    });
    setAddressErrors(errors);
    if (hasErrors(errors)) return;

    const newAddress = await addAddress(addressForm);
    setAddresses(await getAddresses());
    setSelectedAddressId(newAddress.id);
    setShowAddAddress(false);
    setAddressForm({ label: "", line1: "", city: "", state: "", pincode: "", phone: "" });
  };

  const handlePlaceOrder = async () => {
    if (paymentsStatus && !paymentsStatus.configured) {
      show("Payments are not configured in this environment, so an order cannot be placed.", { type: "error" });
      return;
    }
    // Final guard against a cart that went stale while the buyer was on the
    // payment step — a price change, a vendor suspension or stock running
    // out between "Continue to Review" and clicking Pay must still block.
    // The server re-checks this independently regardless.
    if (checkoutIssues.length > 0) {
      show(checkoutIssues[0], { type: "error" });
      setStep(2);
      return;
    }
    setProcessing(true);
    try {
      const order = await createOrder({ addressId: selectedAddressId, paymentMethod: "razorpay" });
      await clear();
      navigate(`/order-confirmation/${order.id}`);
    } catch (err) {
      show(err.message || "Payment failed. Please try again.", { type: "error" });
    } finally {
      setProcessing(false);
    }
  };

  const selectedAddress = (addresses ?? []).find((a) => a.id === selectedAddressId);

  return (
    <Container className="flex flex-col gap-8 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">Checkout</h1>
      <StepIndicator step={step} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6">
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-semibold text-text">Business / Shipping Address</h2>
              <div className="flex flex-col gap-3">
                {(addresses ?? []).map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex cursor-pointer flex-col gap-1 rounded-lg border p-4 text-sm ${
                      selectedAddressId === addr.id ? "border-brand-700 bg-brand-50" : "border-border bg-white"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="h-4 w-4 text-brand-700"
                      />
                      <span className="font-medium text-text">{addr.label}</span>
                      {addr.isDefault && <span className="text-xs text-text-secondary">(Default)</span>}
                    </span>
                    <span className="pl-6 text-text-secondary">
                      {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} {addr.pincode}
                    </span>
                    <span className="pl-6 text-text-secondary">Phone: {addr.phone}</span>
                  </label>
                ))}
              </div>

              {showAddAddress ? (
                <div className="flex flex-col gap-3 rounded-lg border border-border bg-white p-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input label="Label" placeholder="e.g. Warehouse" value={addressForm.label} error={addressErrors.label} onChange={(e) => setAddressForm((f) => ({ ...f, label: e.target.value }))} />
                    <Input label="Phone" value={addressForm.phone} error={addressErrors.phone} onChange={(e) => setAddressForm((f) => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <Input label="Address Line" value={addressForm.line1} error={addressErrors.line1} onChange={(e) => setAddressForm((f) => ({ ...f, line1: e.target.value }))} />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Input label="City" value={addressForm.city} error={addressErrors.city} onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))} />
                    <Input label="State" value={addressForm.state} error={addressErrors.state} onChange={(e) => setAddressForm((f) => ({ ...f, state: e.target.value }))} />
                    <Input label="PIN Code" value={addressForm.pincode} error={addressErrors.pincode} onChange={(e) => setAddressForm((f) => ({ ...f, pincode: e.target.value }))} />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddAddress}>Save Address</Button>
                    <Button size="sm" variant="outline" onClick={() => setShowAddAddress(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="w-fit" onClick={() => setShowAddAddress(true)}>
                  + Add New Address
                </Button>
              )}

              <Button size="lg" className="w-fit" disabled={!selectedAddressId} onClick={() => setStep(2)}>
                Continue to Review
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-semibold text-text">Order Review</h2>

              {checkoutIssues.length > 0 && (
                <div className="flex items-start gap-2 rounded-md border border-warning-500/30 bg-warning-50 px-4 py-3 text-sm text-warning-600">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                  <div>
                    <p className="font-medium">This order can't be placed yet:</p>
                    <ul className="mt-1 list-disc pl-4">
                      {checkoutIssues.map((issue) => (
                        <li key={issue}>{issue}</li>
                      ))}
                    </ul>
                    <Link to="/cart" className="mt-1 inline-block font-medium underline">
                      Go back to your cart to fix this
                    </Link>
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-border bg-white p-4 text-sm">
                <span className="font-medium text-text">Shipping to:</span> {selectedAddress?.line1}, {selectedAddress?.city}, {selectedAddress?.state} {selectedAddress?.pincode}
              </div>

              {vendorGroups.map((group) => (
                <div key={group.vendorId} className="overflow-hidden rounded-lg border border-border bg-white">
                  <div className="border-b border-border bg-bg px-4 py-2.5 text-sm font-semibold text-text">
                    {group.vendor?.name}
                  </div>
                  <ul className="divide-y divide-border">
                    {group.items.map((item) => (
                      <li key={item.productId} className="flex items-center gap-3 p-3.5 text-sm">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-slate-100">
                          <ImageWithFallback src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                        <span className="flex-1 text-text">{item.name}</span>
                        <span className="text-text-secondary">Qty {item.qty}</span>
                        <span className="w-24 text-right font-medium text-text">{formatCurrency(item.qty * item.price)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)} disabled={checkoutIssues.length > 0}>Continue to Payment</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-semibold text-text">Payment</h2>
              <p className="text-sm text-text-secondary">
                You'll be redirected to Razorpay's secure checkout to complete payment.
              </p>
              <div className="flex flex-col gap-3">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 text-sm ${
                      paymentMethod === method.id ? "border-brand-700 bg-brand-50" : "border-border bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                      className="mt-0.5 h-4 w-4 text-brand-700"
                    />
                    <span>
                      <span className="block font-medium text-text">{method.label}</span>
                      <span className="text-text-secondary">{method.description}</span>
                    </span>
                  </label>
                ))}
              </div>
              {paymentsStatus && !paymentsStatus.configured && (
                <p className="text-sm font-medium text-warning-600">
                  Payments are not configured in this environment (no Razorpay keys set on the backend) — an order cannot be placed here yet.
                </p>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} disabled={processing}>Back</Button>
                <Button onClick={handlePlaceOrder} disabled={processing || checkoutIssues.length > 0 || (paymentsStatus && !paymentsStatus.configured)}>
                  {processing ? "Waiting for payment…" : `Pay ${formatCurrency(totals.total)}`}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex h-fit flex-col gap-3 rounded-lg border border-border bg-white p-5">
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
        </div>
      </div>
    </Container>
  );
}
