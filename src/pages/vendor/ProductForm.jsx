import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, Upload } from "lucide-react";
import Stepper from "../../components/common/Stepper.jsx";
import Input from "../../components/common/Input.jsx";
import Select from "../../components/common/Select.jsx";
import Textarea from "../../components/common/Textarea.jsx";
import Button from "../../components/common/Button.jsx";
import ImageWithFallback from "../../components/common/ImageWithFallback.jsx";
import LoadingState from "../../components/common/LoadingState.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useToast } from "../../hooks/useToast.js";
import { getCategories } from "../../services/categoryService.js";
import { getProductById, createProduct, updateProduct } from "../../services/productService.js";
import { validateFields, hasErrors, required, isPositiveNumber, isNonNegativeNumber } from "../../utils/validators.js";
import { slugify } from "../../utils/format.js";

const STEP_LABELS = ["Basic Info", "Pricing", "Inventory", "Images", "Shipping", "Review"];

const emptyForm = {
  name: "",
  category: "",
  subcategory: "",
  brand: "",
  sku: "",
  description: "",
  price: "",
  moq: "",
  moqUnit: "pieces",
  unit: "piece",
  bulkPricing: [{ minQty: "", maxQty: "", price: "" }],
  stock: "",
  lowStockThreshold: "",
  images: [],
  shippingInfo: "",
};

export default function VendorProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { show } = useToast();
  const vendorId = user?.vendorId || "v1";

  const { data: categories } = useAsync(() => getCategories(), []);
  const { data: existingProduct, loading: loadingProduct } = useAsync(
    () => (isEdit ? getProductById(id) : Promise.resolve(null)),
    [id]
  );

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existingProduct) {
      setForm({
        name: existingProduct.name || "",
        category: existingProduct.category || "",
        subcategory: existingProduct.subcategory || "",
        brand: existingProduct.brand || "",
        sku: existingProduct.sku || "",
        description: existingProduct.description || "",
        price: existingProduct.price ?? "",
        moq: existingProduct.moq ?? "",
        moqUnit: existingProduct.moqUnit || "pieces",
        unit: existingProduct.unit || "piece",
        bulkPricing: existingProduct.bulkPricing?.length
          ? existingProduct.bulkPricing.map((t) => ({ minQty: t.minQty, maxQty: t.maxQty ?? "", price: t.price }))
          : emptyForm.bulkPricing,
        stock: existingProduct.stock ?? "",
        lowStockThreshold: existingProduct.lowStockThreshold ?? "",
        images: existingProduct.images || [],
        shippingInfo: existingProduct.shippingInfo || "",
      });
    }
  }, [existingProduct]);

  const selectedCategory = (categories ?? []).find((c) => c.name === form.category);

  const stepValidators = {
    1: () => validateFields(form, { name: [required], category: [required], sku: [required] }),
    2: () => validateFields(form, { price: [required, isPositiveNumber], moq: [required, isPositiveNumber] }),
    3: () => validateFields(form, { stock: [required, isNonNegativeNumber] }),
  };

  const goNext = () => {
    const validator = stepValidators[step];
    const validationErrors = validator ? validator() : {};
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;
    setStep((s) => Math.min(6, s + 1));
  };
  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const updateBulkTier = (index, field, value) => {
    setForm((f) => ({
      ...f,
      bulkPricing: f.bulkPricing.map((tier, i) => (i === index ? { ...tier, [field]: value } : tier)),
    }));
  };
  const addBulkTier = () => setForm((f) => ({ ...f, bulkPricing: [...f.bulkPricing, { minQty: "", maxQty: "", price: "" }] }));
  const removeBulkTier = (index) => setForm((f) => ({ ...f, bulkPricing: f.bulkPricing.filter((_, i) => i !== index) }));

  const handleImageSelect = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm((f) => ({ ...f, images: [...f.images, url] }));
  };
  const removeImage = (index) => setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        slug: slugify(form.name),
        category: form.category,
        subcategory: form.subcategory,
        brand: form.brand,
        sku: form.sku,
        description: form.description,
        price: Number(form.price),
        moq: Number(form.moq),
        moqUnit: form.moqUnit,
        unit: form.unit,
        bulkPricing: form.bulkPricing
          .filter((t) => t.minQty && t.price)
          .map((t) => ({ minQty: Number(t.minQty), maxQty: t.maxQty ? Number(t.maxQty) : null, price: Number(t.price) })),
        stock: Number(form.stock),
        lowStockThreshold: Number(form.lowStockThreshold) || 20,
        images: form.images,
        shippingInfo: form.shippingInfo,
        vendorId,
        location: user?.location,
      };

      if (isEdit) {
        await updateProduct(id, payload);
        show("Product updated.", { type: "success" });
      } else {
        await createProduct(payload);
        show("Product submitted for approval.", { type: "success" });
      }
      navigate("/vendor/products");
    } finally {
      setSubmitting(false);
    }
  };

  if (isEdit && loadingProduct) {
    return <LoadingState count={1} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-text sm:text-2xl">{isEdit ? "Edit Product" : "Add Product"}</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {isEdit ? "Update product details." : "New products are reviewed before appearing on the marketplace."}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-white p-6 sm:p-8">
        <Stepper steps={STEP_LABELS} current={step} className="mb-8" />

        {step === 1 && (
          <div className="flex max-w-lg flex-col gap-4">
            <Input label="Product Name" required value={form.name} error={errors.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Category"
                required
                value={form.category}
                error={errors.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value, subcategory: "" }))}
                options={(categories ?? []).filter((c) => c.id !== "more").map((c) => c.name)}
              />
              <Select
                label="Subcategory"
                value={form.subcategory}
                onChange={(e) => setForm((f) => ({ ...f, subcategory: e.target.value }))}
                options={selectedCategory?.subcategories || []}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Brand" value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} />
              <Input label="SKU" required value={form.sku} error={errors.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />
            </div>
            <Textarea label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={5} />
          </div>
        )}

        {step === 2 && (
          <div className="flex max-w-2xl flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input label="Base / Wholesale Price (₹)" type="number" min={0} required value={form.price} error={errors.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
              <Input label="MOQ" type="number" min={1} required value={form.moq} error={errors.moq} onChange={(e) => setForm((f) => ({ ...f, moq: e.target.value }))} />
              <Input label="Unit" value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} placeholder="piece, meter, set..." />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-text">Bulk Pricing Tiers</span>
                <Button type="button" variant="outline" size="sm" onClick={addBulkTier}>
                  <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" /> Add Tier
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                {form.bulkPricing.map((tier, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min qty"
                      value={tier.minQty}
                      onChange={(e) => updateBulkTier(index, "minQty", e.target.value)}
                      className="w-24 rounded-md border border-border px-2.5 py-2 text-sm focus:border-brand-500 focus:outline-none"
                    />
                    <span className="text-text-secondary">–</span>
                    <input
                      type="number"
                      placeholder="Max qty"
                      value={tier.maxQty}
                      onChange={(e) => updateBulkTier(index, "maxQty", e.target.value)}
                      className="w-24 rounded-md border border-border px-2.5 py-2 text-sm focus:border-brand-500 focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Price (₹)"
                      value={tier.price}
                      onChange={(e) => updateBulkTier(index, "price", e.target.value)}
                      className="w-28 rounded-md border border-border px-2.5 py-2 text-sm focus:border-brand-500 focus:outline-none"
                    />
                    <button type="button" onClick={() => removeBulkTier(index)} aria-label="Remove tier" className="text-text-secondary hover:text-error-600">
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid max-w-lg grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Stock" type="number" min={0} required value={form.stock} error={errors.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} />
            <Input label="Low Stock Threshold" type="number" min={0} value={form.lowStockThreshold} onChange={(e) => setForm((f) => ({ ...f, lowStockThreshold: e.target.value }))} hint="Default: 20" />
          </div>
        )}

        {step === 4 && (
          <div className="flex max-w-lg flex-col gap-4">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border p-6 text-sm text-text-secondary hover:border-brand-300">
              <Upload className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              Upload product image
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelect(e.target.files?.[0])} />
            </label>
            {form.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {form.images.map((img, index) => (
                  <div key={img} className="group relative aspect-square overflow-hidden rounded-md border border-border bg-slate-100">
                    <ImageWithFallback src={img} alt={`Product ${index + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      aria-label="Remove image"
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-error-600 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="max-w-lg">
            <Textarea
              label="Shipping Information"
              value={form.shippingInfo}
              onChange={(e) => setForm((f) => ({ ...f, shippingInfo: e.target.value }))}
              placeholder="Dispatch time, packaging, freight notes..."
              rows={5}
            />
          </div>
        )}

        {step === 6 && (
          <div className="flex max-w-lg flex-col gap-2">
            <ReviewRow label="Name" value={form.name} />
            <ReviewRow label="Category" value={`${form.category}${form.subcategory ? ` / ${form.subcategory}` : ""}`} />
            <ReviewRow label="SKU" value={form.sku} />
            <ReviewRow label="Price" value={`₹${form.price} / ${form.unit}`} />
            <ReviewRow label="MOQ" value={`${form.moq} ${form.moqUnit}`} />
            <ReviewRow label="Bulk Tiers" value={`${form.bulkPricing.filter((t) => t.minQty && t.price).length} tier(s)`} />
            <ReviewRow label="Stock" value={form.stock} />
            <ReviewRow label="Images" value={`${form.images.length} attached`} />
          </div>
        )}

        <div className="mt-8 flex gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={goBack} disabled={submitting}>
              Back
            </Button>
          )}
          {step < 6 ? (
            <Button onClick={goNext}>Continue</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting…" : isEdit ? "Save Changes" : "Submit Product"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex justify-between border-b border-border py-2 text-sm">
      <span className="text-text-secondary">{label}</span>
      <span className="max-w-[60%] text-right font-medium text-text">{value || "—"}</span>
    </div>
  );
}
