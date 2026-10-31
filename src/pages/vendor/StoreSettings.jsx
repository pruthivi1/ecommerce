import { useEffect, useState } from "react";
import PageHeader from "../../components/dashboard/PageHeader.jsx";
import Input from "../../components/common/Input.jsx";
import Textarea from "../../components/common/Textarea.jsx";
import Button from "../../components/common/Button.jsx";
import LoadingState from "../../components/common/LoadingState.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useToast } from "../../hooks/useToast.js";
import { getVendorById, updateVendor } from "../../services/vendorService.js";
import { validateFields, hasErrors, required, isEmail, isPhone } from "../../utils/validators.js";

export default function VendorStoreSettings() {
  const { user } = useAuth();
  const { show } = useToast();
  const vendorId = user?.vendorId || "v1";
  const { data: vendor, loading, setData } = useAsync(() => getVendorById(vendorId), [vendorId]);

  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (vendor) setForm({ name: vendor.name, email: vendor.email, phone: vendor.phone, about: vendor.about });
  }, [vendor]);

  if (loading || !form) return <LoadingState count={1} />;

  const handleSave = async () => {
    const validationErrors = validateFields(form, { name: [required], email: [required, isEmail], phone: [required, isPhone] });
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setSaving(true);
    const updated = await updateVendor(vendorId, form);
    setData(updated);
    setSaving(false);
    show("Store settings updated.", { type: "success" });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Store Settings" description="Update how your store appears to buyers." />

      <div className="max-w-2xl rounded-lg border border-border bg-white p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Store Name" required value={form.name} error={errors.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Contact Email" type="email" required value={form.email} error={errors.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <Input label="Contact Phone" required value={form.phone} error={errors.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        </div>
        <Textarea label="About Your Store" className="mt-4" value={form.about} onChange={(e) => setForm((f) => ({ ...f, about: e.target.value }))} rows={4} />
        <Button className="mt-6" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
