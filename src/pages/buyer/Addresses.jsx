import { useState } from "react";
import { MapPin, Trash2, Star, Plus } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader.jsx";
import Button from "../../components/common/Button.jsx";
import Modal from "../../components/common/Modal.jsx";
import Input from "../../components/common/Input.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import LoadingState from "../../components/common/LoadingState.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { useToast } from "../../hooks/useToast.js";
import { getAddresses, addAddress, setDefaultAddress, removeAddress } from "../../services/addressService.js";
import { validateFields, hasErrors, required, isPincode, isPhone } from "../../utils/validators.js";

const initialForm = { label: "", line1: "", line2: "", city: "", state: "", pincode: "", phone: "" };

export default function Addresses() {
  const { data: addresses, loading, setData } = useAsync(() => getAddresses(), []);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const { show } = useToast();

  const refresh = async () => setData(await getAddresses());

  const handleSave = async () => {
    const validationErrors = validateFields(form, {
      label: [required],
      line1: [required],
      city: [required],
      state: [required],
      pincode: [required, isPincode],
      phone: [required, isPhone],
    });
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    await addAddress(form);
    await refresh();
    setModalOpen(false);
    setForm(initialForm);
    show("Address added.", { type: "success" });
  };

  const handleSetDefault = async (id) => {
    await setDefaultAddress(id);
    await refresh();
  };

  const handleRemove = async (id) => {
    await removeAddress(id);
    await refresh();
    show("Address removed.", { type: "success" });
  };

  if (loading) return <LoadingState count={2} />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Addresses"
        description="Manage your business shipping addresses."
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            Add Address
          </Button>
        }
      />

      {(addresses ?? []).length === 0 ? (
        <EmptyState icon={MapPin} title="No addresses saved" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div key={addr.id} className="flex flex-col gap-2 rounded-lg border border-border bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-text">{addr.label}</span>
                {addr.isDefault && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-700">
                    <Star className="h-3 w-3 fill-brand-700" aria-hidden="true" /> Default
                  </span>
                )}
              </div>
              <p className="text-sm text-text-secondary">
                {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} {addr.pincode}
              </p>
              <p className="text-sm text-text-secondary">Phone: {addr.phone}</p>
              <div className="mt-2 flex gap-2">
                {!addr.isDefault && (
                  <Button size="sm" variant="outline" onClick={() => handleSetDefault(addr.id)}>
                    Set as Default
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => handleRemove(addr.id)} aria-label="Remove address">
                  <Trash2 className="h-3.5 w-3.5 text-error-600" strokeWidth={1.75} aria-hidden="true" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Address" footer={<Button size="sm" onClick={handleSave}>Save Address</Button>}>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Label" placeholder="e.g. Warehouse" value={form.label} error={errors.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
            <Input label="Phone" value={form.phone} error={errors.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </div>
          <Input label="Address Line 1" value={form.line1} error={errors.line1} onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))} />
          <Input label="Address Line 2" value={form.line2} onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Input label="City" value={form.city} error={errors.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
            <Input label="State" value={form.state} error={errors.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} />
            <Input label="PIN Code" value={form.pincode} error={errors.pincode} onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
