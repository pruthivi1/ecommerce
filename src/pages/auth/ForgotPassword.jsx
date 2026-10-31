import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, CheckCircle2 } from "lucide-react";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import DemoNotice from "../../components/common/DemoNotice.jsx";
import { mockRequestPasswordReset } from "../../services/authService.js";
import { validateFields, hasErrors, required, isEmail } from "../../utils/validators.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateFields({ email }, { email: [required, isEmail] });
    setError(errors.email || "");
    if (hasErrors(errors)) return;

    setSubmitting(true);
    try {
      await mockRequestPasswordReset(email);
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-lg border border-border bg-white p-7 shadow-card sm:p-8">
      {sent ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2 className="h-10 w-10 text-success-600" strokeWidth={1.5} aria-hidden="true" />
          <h1 className="text-lg font-semibold text-text">Check your email</h1>
          <p className="text-sm text-text-secondary">
            If an account exists for <span className="font-medium text-text">{email}</span>, a reset link has been sent (prototype only — no email is actually sent).
          </p>
          <Link to="/login" className="text-sm font-medium text-brand-700 hover:underline">
            Back to login
          </Link>
        </div>
      ) : (
        <>
          <h1 className="text-xl font-semibold text-text">Reset your password</h1>
          <p className="mt-1 text-sm text-text-secondary">Enter your email and we'll send you a reset link.</p>
          <DemoNotice className="mt-4" message="Prototype only — no email is sent and no password is changed." />

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <Input
              label="Email address"
              type="email"
              required
              value={email}
              error={error}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@business.com"
            />
            <Button type="submit" size="lg" disabled={submitting}>
              <Mail className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              {submitting ? "Sending…" : "Send Reset Link"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            <Link to="/login" className="font-medium text-brand-700 hover:underline">
              Back to login
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
