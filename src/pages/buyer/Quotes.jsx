import { Link } from "react-router-dom";
import PageHeader from "../../components/dashboard/PageHeader.jsx";
import DataTable from "../../components/dashboard/DataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Button from "../../components/common/Button.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { useCart } from "../../hooks/useCart.js";
import { useToast } from "../../hooks/useToast.js";
import { getQuotes, acceptQuote } from "../../services/quoteService.js";
import { getProducts } from "../../services/productService.js";
import { getVendors } from "../../services/vendorService.js";
import { formatCurrency } from "../../utils/format.js";

export default function BuyerQuotes() {
  const { data: quotes, loading, setData } = useAsync(() => getQuotes({}), []);
  const { data: products } = useAsync(() => getProducts(), []);
  const { data: vendors } = useAsync(() => getVendors(), []);
  const { refresh: refreshCart } = useCart();
  const { show } = useToast();

  const findProduct = (productId) => products?.find((p) => p.id === productId);
  const findVendorName = (vendorId) => vendors?.find((v) => v.id === vendorId)?.name;

  const handleAccept = async (quote) => {
    try {
      // Re-validation of product/vendor eligibility, cart insertion at the
      // negotiated price, and quote-state transition all happen atomically
      // server-side (see backend quoteService.acceptQuote).
      await acceptQuote(quote.id);
      setData(await getQuotes({}));
      await refreshCart();
      show(`Quote accepted. ${quote.quantity} unit(s) added to your cart at the negotiated price.`, { type: "success" });
    } catch (err) {
      show(err.message, { type: "error" });
    }
  };

  const columns = [
    { key: "id", header: "Quote ID" },
    { key: "vendor", header: "Supplier", render: (q) => findVendorName(q.vendorId) || "—" },
    { key: "product", header: "Product", render: (q) => findProduct(q.productId)?.name || "—" },
    { key: "quantity", header: "Quantity", render: (q) => q.quantity },
    { key: "targetPrice", header: "Requested Price", render: (q) => (q.targetPrice ? formatCurrency(q.targetPrice) : "—") },
    {
      key: "response",
      header: "Vendor Response",
      render: (q) =>
        q.vendorResponse ? (
          <span>
            {q.vendorResponse.price ? formatCurrency(q.vendorResponse.price) : ""} {q.vendorResponse.message && <span className="block text-xs text-text-secondary">{q.vendorResponse.message}</span>}
          </span>
        ) : (
          <span className="text-text-secondary">Awaiting response</span>
        ),
    },
    { key: "status", header: "Status", render: (q) => <StatusBadge status={q.status} /> },
    {
      key: "actions",
      header: "",
      render: (q) =>
        q.status === "Counter Offer" ? (
          <Button size="sm" onClick={() => handleAccept(q)}>
            Accept & Add to Cart
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Quote Requests"
        description="Track quote requests you've sent to suppliers."
        actions={
          <Button as={Link} to="/products" variant="secondary" size="sm">
            Browse Products
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={quotes ?? []}
        loading={loading}
        emptyTitle="No quote requests yet."
        emptyDescription="Request a quote from any product page to negotiate bulk pricing."
      />
    </div>
  );
}
