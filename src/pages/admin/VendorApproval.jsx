import { useState } from "react";
import { useParams } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb.jsx";
import Button from "../../components/common/Button.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Modal from "../../components/common/Modal.jsx";
import Textarea from "../../components/common/Textarea.jsx";
import LoadingState from "../../components/common/LoadingState.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { useToast } from "../../hooks/useToast.js";
import { getVendorById, setVendorStatus, requestVendorChanges } from "../../services/vendorService.js";
import { formatDate } from "../../utils/format.js";
import { VENDOR_STATUS } from "../../utils/constants.js";

export default function VendorApproval() {
  const { id } = useParams();
  const { show } = useToast();
  const { data: vendor, loading, error, setData } = useAsync(() => getVendorById(id), [id]);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [changesOpen, setChangesOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [changesMessage, setChangesMessage] = useState("");
  const [processing, setProcessing] = useState(false);

  if (loading) return <LoadingState count={1} />;
  if (error || !vendor) return <ErrorState message="Vendor not found." />;

  const updateStatus = async (status, rejectionReason) => {
    setProcessing(true);
    const updated = await setVendorStatus(id, status, rejectionReason);
    setData(updated);
    setProcessing(false);
    show(`Vendor ${status.toLowerCase()}.`, { type: "success" });
  };

  const handleReject = async () => {
    await updateStatus(VENDOR_STATUS.REJECTED, reason);
    setRejectOpen(false);
    setReason("");
  };

  const handleRequestChanges = async () => {
    setProcessing(true);
    await requestVendorChanges(id, changesMessage);
    setProcessing(false);
    show("Change request sent to the vendor.", { type: "success" });
    setChangesOpen(false);
    setChangesMessage("");
  };

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Vendors", to: "/admin/vendors" }, { label: vendor.name }]} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-text sm:text-2xl">{vendor.businessName}</h1>
          <p className="text-sm text-text-secondary">Applied on {formatDate(vendor.joinedDate)}</p>
        </div>
        <StatusBadge status={vendor.status} />
      </div>

      {vendor.status === VENDOR_STATUS.PENDING && (
        <div className="flex gap-2">
          <Button onClick={() => updateStatus(VENDOR_STATUS.APPROVED)} disabled={processing}>
            Approve
          </Button>
          <Button variant="outline" onClick={() => setRejectOpen(true)} disabled={processing}>
            Reject
          </Button>
          <Button variant="ghost" onClick={() => setChangesOpen(true)} disabled={processing}>
            Request Changes
          </Button>
        </div>
      )}

      {vendor.status === VENDOR_STATUS.APPROVED && (
        <Button variant="outline" onClick={() => updateStatus(VENDOR_STATUS.SUSPENDED)} disabled={processing} className="w-fit">
          Suspend Vendor
        </Button>
      )}
      {vendor.status === VENDOR_STATUS.SUSPENDED && (
        <Button onClick={() => updateStatus(VENDOR_STATUS.APPROVED)} disabled={processing} className="w-fit">
          Reinstate Vendor
        </Button>
      )}

      {vendor.rejectionReason && (
        <p className="rounded-md bg-error-50 px-4 py-3 text-sm text-error-600">Rejection reason: {vendor.rejectionReason}</p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title="Business Details">
          <Row label="Business Name" value={vendor.businessName} />
          <Row label="Owner" value={vendor.ownerName} />
          <Row label="Business Type" value={vendor.businessType} />
          <Row label="GST Number" value={vendor.gstNumber} />
          <Row label="Categories" value={vendor.categories?.join(", ")} />
          <Row label="Email" value={vendor.email} />
          <Row label="Phone" value={vendor.phone} />
          <Row
            label="Address"
            value={`${vendor.address?.line1}, ${vendor.address?.city}, ${vendor.address?.state} ${vendor.address?.pincode}`}
          />
        </Section>

        <Section title="Bank / Payout Information">
          <Row label="Account Name" value={vendor.bank?.accountName} />
          <Row label="Account Number" value={vendor.bank?.accountNumber} />
          <Row label="IFSC" value={vendor.bank?.ifsc} />
          <Row label="UPI" value={vendor.bank?.upi || "—"} />
        </Section>
      </div>

      <Section title="Documents">
        <div className="flex flex-col gap-2">
          {(vendor.documents || []).map((doc) => (
            <div key={doc.name} className="flex items-center justify-between border-b border-border py-2 text-sm last:border-b-0">
              <span className="text-text">{doc.name}</span>
              <StatusBadge status={doc.status} />
            </div>
          ))}
        </div>
      </Section>

      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject Vendor Application"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleReject} disabled={!reason.trim()} className="bg-error-600 hover:bg-error-700 border-error-600">
              Confirm Rejection
            </Button>
          </>
        }
      >
        <Textarea label="Rejection Reason" required placeholder="Explain why this application is being rejected..." value={reason} onChange={(e) => setReason(e.target.value)} />
      </Modal>

      <Modal
        open={changesOpen}
        onClose={() => setChangesOpen(false)}
        title="Request Changes"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setChangesOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleRequestChanges} disabled={!changesMessage.trim() || processing}>
              Send Request
            </Button>
          </>
        }
      >
        <Textarea
          label="What needs to change?"
          required
          placeholder="e.g. Please re-upload a clearer GST certificate..."
          value={changesMessage}
          onChange={(e) => setChangesMessage(e.target.value)}
        />
      </Modal>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <h2 className="mb-3 text-sm font-semibold text-text">{title}</h2>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b border-border py-2 text-sm last:border-b-0">
      <span className="text-text-secondary">{label}</span>
      <span className="max-w-[60%] text-right font-medium text-text">{value || "—"}</span>
    </div>
  );
}
