import { useState } from "react";
import { Plus } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader.jsx";
import DataTable from "../../components/dashboard/DataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Button from "../../components/common/Button.jsx";
import Modal from "../../components/common/Modal.jsx";
import Input from "../../components/common/Input.jsx";
import Select from "../../components/common/Select.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { useToast } from "../../hooks/useToast.js";
import { getCoupons, createCoupon, updateCoupon } from "../../services/adminService.js";
import { validateFields, hasErrors, required, isPositiveNumber } from "../../utils/validators.js";
import { formatDate } from "../../utils/format.js";

const emptyForm = { code: "", discountType: "Percentage", discountValue: "", minOrder: "", expiry: "" };

export default function AdminCoupons() {
  const { data: coupons, loading, setData } = useAsync(() => getCoupons(), []);
  const { show } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const refresh = async () => setData(await getCoupons());

  const handleSave = async () => {
    const validationErrors = validateFields(form, {
      code: [required],
      discountValue: [required, isPositiveNumber],
      minOrder: [required],
      expiry: [required],
    });
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    await createCoupon({
      code: form.code.toUpperCase(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minOrder: Number(form.minOrder),
      expiry: form.expiry,
    });
    await refresh();
    show("Coupon created.", { type: "success" });
    setModalOpen(false);
    setForm(emptyForm);
  };

  const toggleStatus = async (coupon) => {
    await updateCoupon(coupon.id, { status: coupon.status === "Active" ? "Inactive" : "Active" });
    await refresh();
  };

  const columns = [
    { key: "code", header: "Coupon Code" },
    { key: "discountType", header: "Discount Type" },
    { key: "discountValue", header: "Value", render: (c) => (c.discountType === "Percentage" ? `${c.discountValue}%` : `₹${c.discountValue}`) },
    { key: "minOrder", header: "Min Order", render: (c) => `₹${c.minOrder.toLocaleString("en-IN")}` },
    { key: "expiry", header: "Expiry", render: (c) => formatDate(c.expiry) },
    { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
    {
      key: "actions",
      header: "",
      render: (c) => (
        <Button size="sm" variant="outline" onClick={() => toggleStatus(c)}>
          {c.status === "Active" ? "Deactivate" : "Activate"}
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Coupons"
        description="Manage marketplace discount coupons."
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" strokeWidth={2} aria-hidden="true" /> Create Coupon
          </Button>
        }
      />

      <DataTable columns={columns} data={coupons ?? []} loading={loading} emptyTitle="No coupons yet" />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Coupon" footer={<Button size="sm" onClick={handleSave}>Create</Button>}>
        <div className="flex flex-col gap-4">
          <Input label="Coupon Code" required value={form.code} error={errors.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} />
          <Select label="Discount Type" value={form.discountType} onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))} options={["Percentage", "Flat"]} />
          <Input label="Discount Value" type="number" min={1} required value={form.discountValue} error={errors.discountValue} onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))} />
          <Input label="Minimum Order (₹)" type="number" min={0} required value={form.minOrder} error={errors.minOrder} onChange={(e) => setForm((f) => ({ ...f, minOrder: e.target.value }))} />
          <Input label="Expiry Date" type="date" required value={form.expiry} error={errors.expiry} onChange={(e) => setForm((f) => ({ ...f, expiry: e.target.value }))} />
        </div>
      </Modal>
    </div>
  );
}
