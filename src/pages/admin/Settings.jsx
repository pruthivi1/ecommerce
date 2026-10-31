import { useState } from "react";
import PageHeader from "../../components/dashboard/PageHeader.jsx";
import Input from "../../components/common/Input.jsx";
import Checkbox from "../../components/common/Checkbox.jsx";
import Button from "../../components/common/Button.jsx";
import { useToast } from "../../hooks/useToast.js";

export default function AdminSettings() {
  const { show } = useToast();
  const [form, setForm] = useState({
    platformName: "MarketBridge",
    supportEmail: "support@marketbridge.example",
    supportPhone: "+91 80 4000 1234",
  });
  const [flags, setFlags] = useState({ maintenanceMode: false, autoApproveVendors: false, autoApproveProducts: false });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Platform-wide configuration." />

      <div className="max-w-xl rounded-lg border border-border bg-white p-6">
        <h2 className="text-sm font-semibold text-text">General</h2>
        <div className="mt-4 flex flex-col gap-4">
          <Input label="Platform Name" value={form.platformName} onChange={(e) => setForm((f) => ({ ...f, platformName: e.target.value }))} />
          <Input label="Support Email" type="email" value={form.supportEmail} onChange={(e) => setForm((f) => ({ ...f, supportEmail: e.target.value }))} />
          <Input label="Support Phone" value={form.supportPhone} onChange={(e) => setForm((f) => ({ ...f, supportPhone: e.target.value }))} />
        </div>
      </div>

      <div className="max-w-xl rounded-lg border border-border bg-white p-6">
        <h2 className="text-sm font-semibold text-text">Platform Flags</h2>
        <div className="mt-4 flex flex-col gap-3">
          <Checkbox label="Maintenance mode" checked={flags.maintenanceMode} onChange={(e) => setFlags((f) => ({ ...f, maintenanceMode: e.target.checked }))} />
          <Checkbox label="Auto-approve new vendors" checked={flags.autoApproveVendors} onChange={(e) => setFlags((f) => ({ ...f, autoApproveVendors: e.target.checked }))} />
          <Checkbox label="Auto-approve new products" checked={flags.autoApproveProducts} onChange={(e) => setFlags((f) => ({ ...f, autoApproveProducts: e.target.checked }))} />
        </div>
      </div>

      <Button className="w-fit" onClick={() => show("Settings saved.", { type: "success" })}>
        Save Settings
      </Button>
    </div>
  );
}
