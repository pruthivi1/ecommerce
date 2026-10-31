import { useState } from "react";
import PageHeader from "../../components/dashboard/PageHeader.jsx";
import Input from "../../components/common/Input.jsx";
import Checkbox from "../../components/common/Checkbox.jsx";
import Button from "../../components/common/Button.jsx";
import DemoNotice from "../../components/common/DemoNotice.jsx";
import { useToast } from "../../hooks/useToast.js";
import { validateFields, hasErrors, required, minLength } from "../../utils/validators.js";

export default function BuyerSettings() {
  const { show } = useToast();
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [prefs, setPrefs] = useState({ orderUpdates: true, quoteUpdates: true, marketing: false });

  const handlePasswordSave = (e) => {
    e.preventDefault();
    const validationErrors = validateFields(passwordForm, {
      current: [required],
      next: [required, (v) => minLength(v, 6)],
      confirm: [required, (v) => (v !== passwordForm.next ? "Passwords do not match." : "")],
    });
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;
    setPasswordForm({ current: "", next: "", confirm: "" });
    show("Password updated (prototype only).", { type: "success" });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Manage your account preferences." />

      <div className="max-w-xl rounded-lg border border-border bg-white p-6">
        <h2 className="text-sm font-semibold text-text">Change Password</h2>
        <DemoNotice className="mt-3" message="Prototype only — no password is actually changed." />
        <form onSubmit={handlePasswordSave} className="mt-4 flex flex-col gap-4">
          <Input label="Current Password" type="password" value={passwordForm.current} error={errors.current} onChange={(e) => setPasswordForm((f) => ({ ...f, current: e.target.value }))} />
          <Input label="New Password" type="password" value={passwordForm.next} error={errors.next} onChange={(e) => setPasswordForm((f) => ({ ...f, next: e.target.value }))} />
          <Input label="Confirm New Password" type="password" value={passwordForm.confirm} error={errors.confirm} onChange={(e) => setPasswordForm((f) => ({ ...f, confirm: e.target.value }))} />
          <Button type="submit" className="w-fit">Update Password</Button>
        </form>
      </div>

      <div className="max-w-xl rounded-lg border border-border bg-white p-6">
        <h2 className="text-sm font-semibold text-text">Notification Preferences</h2>
        <div className="mt-4 flex flex-col gap-3">
          <Checkbox label="Order status updates" checked={prefs.orderUpdates} onChange={(e) => setPrefs((p) => ({ ...p, orderUpdates: e.target.checked }))} />
          <Checkbox label="Quote responses" checked={prefs.quoteUpdates} onChange={(e) => setPrefs((p) => ({ ...p, quoteUpdates: e.target.checked }))} />
          <Checkbox label="Marketing emails" checked={prefs.marketing} onChange={(e) => setPrefs((p) => ({ ...p, marketing: e.target.checked }))} />
        </div>
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => show("Preferences saved.", { type: "success" })}>
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
