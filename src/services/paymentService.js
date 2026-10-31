import { apiGet, apiPost } from "./apiClient.js";

export const PAYMENT_METHODS = [
  { id: "razorpay", label: "Razorpay", description: "Pay securely via Razorpay — cards, UPI, netbanking and wallets." },
];

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load the payment provider. Check your connection and try again."));
    document.body.appendChild(script);
  });
}

export async function getPaymentsStatus() {
  return apiGet("/payments/status");
}

/**
 * Creates a Razorpay order sized to the buyer's CURRENT server-side cart
 * total, opens the Razorpay checkout modal, and resolves with the
 * signature-bearing payment details once the buyer completes payment.
 * Never resolves with a fabricated "success" — a cancelled or failed
 * payment rejects, and if Razorpay isn't configured on the backend the
 * initial order-create call throws a clear "payments not configured" error
 * instead of faking a checkout.
 */
export async function collectPayment() {
  const idempotencyKey = crypto.randomUUID();
  const order = await apiPost("/payments/razorpay/order", { idempotencyKey });
  await loadRazorpayScript();

  return new Promise((resolve, reject) => {
    const razorpay = new window.Razorpay({
      key: order.keyId,
      amount: Math.round(order.amount * 100),
      currency: order.currency,
      order_id: order.razorpay_order_id,
      name: "MarketBridge",
      description: "Order payment",
      handler: (response) => {
        resolve({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
          idempotencyKey,
        });
      },
      modal: { ondismiss: () => reject(new Error("Payment was cancelled.")) },
    });
    razorpay.on("payment.failed", () => reject(new Error("Payment failed. Please try again.")));
    razorpay.open();
  });
}
