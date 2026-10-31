import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/common/Input.jsx";
import Select from "../../components/common/Select.jsx";
import Button from "../../components/common/Button.jsx";
import DemoNotice from "../../components/common/DemoNotice.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useToast } from "../../hooks/useToast.js";
import { mockRegisterBuyer } from "../../services/authService.js";
import { validateFields, hasErrors, required, isEmail, isPhone, minLength } from "../../utils/validators.js";

const initialForm = { name: "", businessName: "", businessType: "", email: "", phone: "", password: "" };

export default function RegisterBuyer() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { loginWithSession } = useAuth();
  const { show } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateFields(form, {
      name: [required],
      businessName: [required],
      businessType: [required],
      email: [required, isEmail],
      phone: [required, isPhone],
      password: [required, (v) => minLength(v, 6)],
    });
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setSubmitting(true);
    try {
      const session = await mockRegisterBuyer(form);
      loginWithSession(session);
      show("Account created. Welcome to MarketBridge!", { type: "success" });
      navigate("/buyer/dashboard");
    } catch (err) {
      show(err.message, { type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg rounded-lg border border-border bg-white p-7 shadow-card sm:p-8">
      <h1 className="text-xl font-semibold text-text">Create a Buyer Account</h1>
      <p className="mt-1 text-sm text-text-secondary">Start sourcing wholesale products from verified suppliers.</p>
      <DemoNotice className="mt-4" />

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input label="Your Name" required value={form.name} error={errors.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <Input
          label="Business Name"
          required
          value={form.businessName}
          error={errors.businessName}
          onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
        />
        <Select
          label="Business Type"
          required
          value={form.businessType}
          error={errors.businessType}
          onChange={(e) => setForm((f) => ({ ...f, businessType: e.target.value }))}
          options={["Retailer", "Wholesaler", "Distributor", "Manufacturer", "Other"]}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            error={errors.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <Input
            label="Phone"
            required
            value={form.phone}
            error={errors.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            hint="10-digit mobile number"
          />
        </div>
        <Input
          label="Password"
          type="password"
          required
          value={form.password}
          error={errors.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        />
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? "Creating account…" : "Create Buyer Account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
