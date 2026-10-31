import { useState } from "react";
import PageHeader from "../../components/dashboard/PageHeader.jsx";
import DataTable from "../../components/dashboard/DataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Button from "../../components/common/Button.jsx";
import Modal from "../../components/common/Modal.jsx";
import Input from "../../components/common/Input.jsx";
import Textarea from "../../components/common/Textarea.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useToast } from "../../hooks/useToast.js";
import { getQuotes, respondToQuote } from "../../services/quoteService.js";
import { getProductsByVendor } from "../../services/productService.js";
import { demoUsers } from "../../data/users.js";
import { formatCurrency, formatDate } from "../../utils/format.js";
import { QUOTE_STATUS } from "../../utils/constants.js";

export default function VendorQuotes() {
  const { user } = useAuth();
  const { show } = useToast();
  const vendorId = user?.vendorId || "v1";
  const { data: quotes, loading, setData } = useAsync(() => getQuotes({ vendorId }), [vendorId]);
  const { data: products } = useAsync(() => getProductsByVendor(vendorId), [vendorId]);
  const [responseTarget, setResponseTarget] = useState(null); // { quote, type }
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");

  const refresh = async () => setData(await getQuotes({ vendorId }));

  const openResponse = (quote, type) => {
    setResponseTarget({ quote, type });
    setPrice(quote.targetPrice || "");
    setMessage("");
  };

  const submitResponse = async () => {
    const { quote, type } = responseTarget;
    const status = type === "accept" ? QUOTE_STATUS.ACCEPTED : type === "reject" ? QUOTE_STATUS.REJECTED : QUOTE_STATUS.COUNTER_OFFER;
    try {
      await respondToQuote(quote.id, { status, price: type === "reject" ? null : Number(price), message }, vendorId);
      await refresh();
      show(`Quote ${quote.id} updated.`, { type: "success" });
      setResponseTarget(null);
    } catch (err) {
      show(err.message, { type: "error" });
    }
  };

  const columns = [
    { key: "id", header: "Quote ID" },
    { key: "buyer", header: "Buyer", render: () => demoUsers.buyer.businessName },
    { key: "product", header: "Product", render: (q) => products?.find((p) => p.id === q.productId)?.name || "—" },
    { key: "quantity", header: "Quantity" },
    { key: "targetPrice", header: "Requested Price", render: (q) => (q.targetPrice ? formatCurrency(q.targetPrice) : "—") },
    { key: "deliveryLocation", header: "Delivery Location" },
    { key: "date", header: "Date", render: (q) => formatDate(q.createdAt) },
    { key: "status", header: "Status", render: (q) => <StatusBadge status={q.status} /> },
    {
      key: "actions",
      header: "",
      render: (q) =>
        q.status === QUOTE_STATUS.PENDING ? (
          <div className="flex gap-1.5">
            <Button size="sm" onClick={() => openResponse(q, "accept")}>Accept</Button>
            <Button size="sm" variant="outline" onClick={() => openResponse(q, "counter")}>Counter</Button>
            <Button size="sm" variant="ghost" onClick={() => openResponse(q, "reject")}>Reject</Button>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Quote Requests" description="Respond to buyer requests for bulk pricing." />
      <DataTable columns={columns} data={quotes ?? []} loading={loading} emptyTitle="No quote requests yet." />

      <Modal
        open={!!responseTarget}
        onClose={() => setResponseTarget(null)}
        title={
          responseTarget?.type === "accept" ? "Accept Quote" : responseTarget?.type === "reject" ? "Reject Quote" : "Send Counter Offer"
        }
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setResponseTarget(null)}>Cancel</Button>
            <Button size="sm" onClick={submitResponse}>Submit</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {responseTarget?.type !== "reject" && (
            <Input label="Price per unit (₹)" type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
          )}
          <Textarea label="Message to buyer" value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
}
