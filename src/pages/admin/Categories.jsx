import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader.jsx";
import DataTable from "../../components/dashboard/DataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Button from "../../components/common/Button.jsx";
import Modal from "../../components/common/Modal.jsx";
import Input from "../../components/common/Input.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { useToast } from "../../hooks/useToast.js";
import { getCategories, createCategory, updateCategory, setCategoryStatus } from "../../services/categoryService.js";
import { getProducts } from "../../services/productService.js";
import { validateFields, hasErrors, required } from "../../utils/validators.js";

export default function AdminCategories() {
  const { data: categories, loading, setData } = useAsync(() => getCategories(), []);
  const { data: products } = useAsync(() => getProducts(), []);
  const { show } = useToast();
  const [modalTarget, setModalTarget] = useState(null); // null | "new" | category
  const [form, setForm] = useState({ name: "" });
  const [errors, setErrors] = useState({});

  const refresh = async () => setData(await getCategories());

  const openNew = () => {
    setModalTarget("new");
    setForm({ name: "" });
    setErrors({});
  };
  const openEdit = (category) => {
    setModalTarget(category);
    setForm({ name: category.name });
    setErrors({});
  };

  const handleSave = async () => {
    const validationErrors = validateFields(form, { name: [required] });
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    if (modalTarget === "new") {
      await createCategory({ name: form.name });
      show("Category created.", { type: "success" });
    } else {
      await updateCategory(modalTarget.id, { name: form.name });
      show("Category updated.", { type: "success" });
    }
    await refresh();
    setModalTarget(null);
  };

  const toggleStatus = async (category) => {
    await setCategoryStatus(category.id, category.status === "Active" ? "Inactive" : "Active");
    await refresh();
  };

  const columns = [
    { key: "name", header: "Category" },
    { key: "products", header: "Products", render: (c) => (products ?? []).filter((p) => p.category === c.name).length },
    { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
    {
      key: "actions",
      header: "",
      render: (c) => (
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="ghost" onClick={() => openEdit(c)}>
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" /> Edit
          </Button>
          <Button size="sm" variant="outline" onClick={() => toggleStatus(c)}>
            {c.status === "Active" ? "Deactivate" : "Activate"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Categories"
        description="Manage marketplace product categories."
        actions={
          <Button size="sm" onClick={openNew}>
            <Plus className="h-4 w-4" strokeWidth={2} aria-hidden="true" /> Add Category
          </Button>
        }
      />

      <DataTable columns={columns} data={categories ?? []} loading={loading} emptyTitle="No categories yet" />

      <Modal
        open={!!modalTarget}
        onClose={() => setModalTarget(null)}
        title={modalTarget === "new" ? "Add Category" : "Edit Category"}
        footer={
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
        }
      >
        <Input label="Category Name" required value={form.name} error={errors.name} onChange={(e) => setForm({ name: e.target.value })} />
      </Modal>
    </div>
  );
}
