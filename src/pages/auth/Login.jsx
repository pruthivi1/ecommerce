import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import DemoNotice from "../../components/common/DemoNotice.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useToast } from "../../hooks/useToast.js";
import { validateFields, hasErrors, required, isEmail } from "../../utils/validators.js";
import { ROLES } from "../../utils/constants.js";

const ROLE_HOME = {
  [ROLES.BUYER]: "/buyer/dashboard",
  [ROLES.VENDOR]: "/vendor/dashboard",
  [ROLES.ADMIN]: "/admin/dashboard",
};

const ROLE_OPTIONS = [
  { value: ROLES.BUYER, label: "Buyer" },
  { value: ROLES.VENDOR, label: "Vendor" },
  { value: ROLES.ADMIN, label: "Admin" },
];

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { switchRole } = useAuth();
  const { show } = useToast();

  const [role, setRole] = useState(searchParams.get("role") || ROLES.BUYER);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = searchParams.get("redirect");

  const goToDashboard = async (selectedRole) => {
    setSubmitting(true);
    await switchRole(selectedRole);
    setSubmitting(false);
    show(`Signed in as ${selectedRole}.`, { type: "success" });
    navigate(redirectTo || ROLE_HOME[selectedRole]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateFields(form, {
      email: [required, isEmail],
      password: [required],
    });
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;
    await goToDashboard(role);
  };

  return (
    <div className="w-full max-w-md rounded-lg border border-border bg-white p-7 shadow-card sm:p-8">
      <h1 className="text-xl font-semibold text-text">Log in to MarketBridge</h1>
      <p className="mt-1 text-sm text-text-secondary">Access your business dashboard.</p>

      <DemoNotice className="mt-4" />

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text">Log in as</span>
          <div className="grid grid-cols-3 gap-2">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRole(opt.value)}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  role === opt.value ? "border-brand-700 bg-brand-50 text-brand-700" : "border-border text-text-secondary hover:bg-slate-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Email address"
          type="email"
          required
          value={form.email}
          error={errors.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="you@business.com"
        />
        <Input
          label="Password"
          type="password"
          required
          value={form.password}
          error={errors.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          placeholder="••••••••"
        />

        <div className="flex items-center justify-end">
          <Link to="/forgot-password" className="text-xs font-medium text-brand-700 hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? "Signing in…" : "Log In"}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-text-secondary">or continue with a demo account</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {ROLE_OPTIONS.map((opt) => (
          <Button key={opt.value} variant="outline" size="sm" onClick={() => goToDashboard(opt.value)} disabled={submitting}>
            {opt.label} Demo
          </Button>
        ))}
      </div>

      <p className="mt-6 text-center text-sm text-text-secondary">
        New to MarketBridge?{" "}
        <Link to="/register" className="font-medium text-brand-700 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
