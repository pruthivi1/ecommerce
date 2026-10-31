import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileCheck2 } from "lucide-react";
import Container from "../../components/common/Container.jsx";
import Stepper from "../../components/common/Stepper.jsx";
import Input from "../../components/common/Input.jsx";
import Select from "../../components/common/Select.jsx";
import Checkbox from "../../components/common/Checkbox.jsx";
import Button from "../../components/common/Button.jsx";
import DemoNotice from "../../components/common/DemoNotice.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useToast } from "../../hooks/useToast.js";
import { updateVendorProfile } from "../../services/vendorService.js";
import { validateFields, hasErrors, required, isEmail, isPhone, isGSTNumber, isPincode } from "../../utils/validators.js";
import { LOCATIONS } from "../../utils/constants.js";
import { getCategories } from "../../services/categoryService.js";
import { useAsync } from "../../hooks/useAsync.js";

const STEP_LABELS = ["Account", "Business Info", "GST Info", "Bank Info", "Documents", "Review"];
const REQUIRED_DOCS = ["GST Certificate", "PAN Card", "Business Registration"];

export default function VendorApply() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { show } = useToast();
  const { data: categories } = useAsync(() => getCategories(), []);

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [account, setAccount] = useState({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "" });
  const [business, setBusiness] = useState({
    businessName: "",
    businessType: "",
    categories: [],
    yearsExperience: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [gst, setGst] = useState({ gstNumber: "", panNumber: "" });
  const [bank, setBank] = useState({ accountName: "", accountNumber: "", ifsc: "", upi: "" });
  const [documents, setDocuments] = useState({});

  const stepValidators = {
    1: () => validateFields(account, { name: [required], email: [required, isEmail], phone: [required, isPhone] }),
    2: () =>
      validateFields(business, {
        businessName: [required],
        businessType: [required],
        addressLine1: [required],
        city: [required],
        state: [required],
        pincode: [required, isPincode],
      }),
    3: () => validateFields(gst, { gstNumber: [required, isGSTNumber] }),
    4: () => validateFields(bank, { accountName: [required], accountNumber: [required], ifsc: [required] }),
    5: () => (REQUIRED_DOCS.every((doc) => documents[doc]) ? {} : { documents: "Please attach all required documents." }),
  };

  const goNext = () => {
    const validator = stepValidators[step];
    const validationErrors = validator ? validator() : {};
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;
    setStep((s) => Math.min(6, s + 1));
  };

  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const toggleCategory = (name) => {
    setBusiness((b) => ({
      ...b,
      categories: b.categories.includes(name) ? b.categories.filter((c) => c !== name) : [...b.categories, name],
    }));
  };

  const handleFileSelect = (docName, file) => {
    setDocuments((d) => ({ ...d, [docName]: file?.name || "attached.pdf" }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // The account itself was already created at /register/vendor — this
      // step fills in the business profile on that same vendor record,
      // which is what an admin reviews for approval.
      const vendor = await updateVendorProfile({
        businessName: business.businessName,
        name: account.name,
        phone: account.phone,
        businessType: business.businessType,
        categories: business.categories.length ? business.categories : ["Other"],
        yearsExperience: Number(business.yearsExperience) || 0,
        location: business.state,
        address: { line1: business.addressLine1, city: business.city, state: business.state, pincode: business.pincode },
        gstNumber: gst.gstNumber,
        bank,
      });
      navigate(`/vendor/application-submitted?id=${vendor.id}`);
    } catch (err) {
      show(err.message, { type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="flex flex-col gap-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">Become a Supplier</h1>
        <p className="mt-1 text-sm text-text-secondary">Complete your business application for marketplace review.</p>
      </div>

      <DemoNotice message="Prototype application — submitted data is stored only for this session and no documents are uploaded to a server." />

      <div className="rounded-lg border border-border bg-white p-6 sm:p-8">
        <Stepper steps={STEP_LABELS} current={step} className="mb-8" />

        {step === 1 && (
          <div className="flex max-w-lg flex-col gap-4">
            <h2 className="text-base font-semibold text-text">Account Details</h2>
            <Input label="Full Name" required value={account.name} error={errors.name} onChange={(e) => setAccount((a) => ({ ...a, name: e.target.value }))} />
            <Input label="Email" type="email" required value={account.email} error={errors.email} onChange={(e) => setAccount((a) => ({ ...a, email: e.target.value }))} />
            <Input label="Phone" required value={account.phone} error={errors.phone} onChange={(e) => setAccount((a) => ({ ...a, phone: e.target.value }))} />
          </div>
        )}

        {step === 2 && (
          <div className="flex max-w-lg flex-col gap-4">
            <h2 className="text-base font-semibold text-text">Business Information</h2>
            <Input label="Business Name" required value={business.businessName} error={errors.businessName} onChange={(e) => setBusiness((b) => ({ ...b, businessName: e.target.value }))} />
            <Select
              label="Business Type"
              required
              value={business.businessType}
              error={errors.businessType}
              onChange={(e) => setBusiness((b) => ({ ...b, businessType: e.target.value }))}
              options={["Manufacturer", "Wholesaler", "Distributor", "Trader", "Cooperative"]}
            />
            <div>
              <span className="text-sm font-medium text-text">Product Categories</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(categories ?? []).filter((c) => c.id !== "more").map((c) => (
                  <Checkbox key={c.id} label={c.name} checked={business.categories.includes(c.name)} onChange={() => toggleCategory(c.name)} />
                ))}
              </div>
            </div>
            <Input
              label="Years in Business"
              type="number"
              min={0}
              value={business.yearsExperience}
              onChange={(e) => setBusiness((b) => ({ ...b, yearsExperience: e.target.value }))}
            />
            <Input label="Address" required value={business.addressLine1} error={errors.addressLine1} onChange={(e) => setBusiness((b) => ({ ...b, addressLine1: e.target.value }))} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Input label="City" required value={business.city} error={errors.city} onChange={(e) => setBusiness((b) => ({ ...b, city: e.target.value }))} />
              <Select label="State" required value={business.state} error={errors.state} onChange={(e) => setBusiness((b) => ({ ...b, state: e.target.value }))} options={LOCATIONS} />
              <Input label="PIN Code" required value={business.pincode} error={errors.pincode} onChange={(e) => setBusiness((b) => ({ ...b, pincode: e.target.value }))} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex max-w-lg flex-col gap-4">
            <h2 className="text-base font-semibold text-text">GST Information</h2>
            <Input
              label="GSTIN"
              required
              value={gst.gstNumber}
              error={errors.gstNumber}
              onChange={(e) => setGst((g) => ({ ...g, gstNumber: e.target.value.toUpperCase() }))}
              hint="15-character GST Identification Number"
            />
            <Input label="PAN Number" value={gst.panNumber} onChange={(e) => setGst((g) => ({ ...g, panNumber: e.target.value.toUpperCase() }))} />
          </div>
        )}

        {step === 4 && (
          <div className="flex max-w-lg flex-col gap-4">
            <h2 className="text-base font-semibold text-text">Bank / Payout Information</h2>
            <Input label="Account Holder Name" required value={bank.accountName} error={errors.accountName} onChange={(e) => setBank((b) => ({ ...b, accountName: e.target.value }))} />
            <Input label="Account Number" required value={bank.accountNumber} error={errors.accountNumber} onChange={(e) => setBank((b) => ({ ...b, accountNumber: e.target.value }))} />
            <Input label="IFSC Code" required value={bank.ifsc} error={errors.ifsc} onChange={(e) => setBank((b) => ({ ...b, ifsc: e.target.value.toUpperCase() }))} />
            <Input label="UPI ID" value={bank.upi} onChange={(e) => setBank((b) => ({ ...b, upi: e.target.value }))} hint="Optional" />
          </div>
        )}

        {step === 5 && (
          <div className="flex max-w-lg flex-col gap-4">
            <h2 className="text-base font-semibold text-text">Documents</h2>
            <p className="text-sm text-text-secondary">Attach the following documents for verification.</p>
            {REQUIRED_DOCS.map((doc) => (
              <label key={doc} className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-dashed border-border p-4 text-sm hover:border-brand-300">
                <span className="flex items-center gap-2 text-text">
                  {documents[doc] ? <FileCheck2 className="h-4 w-4 text-success-600" strokeWidth={1.75} aria-hidden="true" /> : <Upload className="h-4 w-4 text-text-secondary" strokeWidth={1.75} aria-hidden="true" />}
                  {doc}
                </span>
                <span className="text-xs text-text-secondary">{documents[doc] || "Choose file"}</span>
                <input type="file" className="hidden" onChange={(e) => handleFileSelect(doc, e.target.files?.[0])} />
              </label>
            ))}
            {errors.documents && <p className="text-xs font-medium text-error-600">{errors.documents}</p>}
          </div>
        )}

        {step === 6 && (
          <div className="flex max-w-lg flex-col gap-4">
            <h2 className="text-base font-semibold text-text">Review & Submit</h2>
            <ReviewRow label="Name" value={account.name} />
            <ReviewRow label="Business" value={business.businessName} />
            <ReviewRow label="Business Type" value={business.businessType} />
            <ReviewRow label="Categories" value={business.categories.join(", ") || "—"} />
            <ReviewRow label="Address" value={`${business.addressLine1}, ${business.city}, ${business.state} ${business.pincode}`} />
            <ReviewRow label="GSTIN" value={gst.gstNumber} />
            <ReviewRow label="Bank Account" value={`${bank.accountName} · ${bank.accountNumber}`} />
            <ReviewRow label="Documents" value={REQUIRED_DOCS.filter((d) => documents[d]).length + " of " + REQUIRED_DOCS.length + " attached"} />
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
              {submitting ? "Submitting…" : "Submit Application"}
            </Button>
          )}
        </div>
      </div>
    </Container>
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
