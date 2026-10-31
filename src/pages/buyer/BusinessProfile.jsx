import { useState } from "react";
import PageHeader from "../../components/dashboard/PageHeader.jsx";
import Input from "../../components/common/Input.jsx";
import Select from "../../components/common/Select.jsx";
import Button from "../../components/common/Button.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useToast } from "../../hooks/useToast.js";
import { validateFields, hasErrors, required, isEmail, isPhone, isGSTNumber } from "../../utils/validators.js";

export default function BusinessProfile() {
  const { user, setUser } = useAuth();
  const { show } = useToast();
  const [form, setForm] = useState({
    businessName: user?.businessName || "",
    businessType: user?.businessType || "Retailer",
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    gstNumber: user?.gstNumber || "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const validationErrors = validateFields(form, {
      businessName: [required],
      name: [required],
      email: [required, isEmail],
      phone: [required, isPhone],
      gstNumber: form.gstNumber ? [isGSTNumber] : [],
    });
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setSaving(true);
    setUser((prev) => ({ ...prev, ...form }));
    setTimeout(() => {
      setSaving(false);
      show("Business profile updated.", { type: "success" });
    }, 400);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Business Profile" description="Keep your business details up to date." />

      <div className="max-w-2xl rounded-lg border border-border bg-white p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Business Name" required value={form.businessName} error={errors.businessName} onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))} />
          <Select
            label="Business Type"
            value={form.businessType}
            onChange={(e) => setForm((f) => ({ ...f, businessType: e.target.value }))}
            options={["Retailer", "Wholesaler", "Distributor", "Manufacturer", "Other"]}
          />
          <Input label="Contact Name" required value={form.name} error={errors.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Email" type="email" required value={form.email} error={errors.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <Input label="Phone" required value={form.phone} error={errors.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <Input
            label="GST Number"
            value={form.gstNumber}
            error={errors.gstNumber}
            onChange={(e) => setForm((f) => ({ ...f, gstNumber: e.target.value.toUpperCase() }))}
            hint="Optional — required for GST invoices"
          />
        </div>
        <Button className="mt-6" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
