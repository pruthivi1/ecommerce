import { useState } from "react";
import { Mail, Phone, MapPin, CheckCircle2 } from "lucide-react";
import Container from "../../components/common/Container.jsx";
import Breadcrumb from "../../components/common/Breadcrumb.jsx";
import Input from "../../components/common/Input.jsx";
import Textarea from "../../components/common/Textarea.jsx";
import Button from "../../components/common/Button.jsx";
import { validateFields, hasErrors, required, isEmail } from "../../utils/validators.js";

const initialForm = { name: "", email: "", subject: "", message: "" };

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateFields(form, {
      name: [required],
      email: [required, isEmail],
      message: [required],
    });
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;
    setSubmitted(true);
    setForm(initialForm);
  };

  return (
    <Container className="flex flex-col gap-8 py-8">
      <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Contact" }]} />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">Contact Us</h1>
            <p className="mt-2 text-sm text-text-secondary">
              Questions about buying or selling on MarketBridge? Reach out and our team will get back to you.
            </p>
          </div>
          <div className="flex flex-col gap-4 text-sm text-text-secondary">
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-brand-700" strokeWidth={1.75} aria-hidden="true" /> support@marketbridge.example
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-brand-700" strokeWidth={1.75} aria-hidden="true" /> +91 80 4000 1234
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-700" strokeWidth={1.75} aria-hidden="true" /> Bengaluru, Karnataka, India
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-white p-6">
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <CheckCircle2 className="h-10 w-10 text-success-600" strokeWidth={1.5} aria-hidden="true" />
              <p className="font-medium text-text">Message sent</p>
              <p className="text-sm text-text-secondary">We'll get back to you within 1–2 business days.</p>
              <Button variant="secondary" size="sm" onClick={() => setSubmitted(false)}>
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Name"
                  required
                  value={form.name}
                  error={errors.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
                <Input
                  label="Email"
                  type="email"
                  required
                  value={form.email}
                  error={errors.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <Input
                label="Subject"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              />
              <Textarea
                label="Message"
                required
                value={form.message}
                error={errors.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              />
              <Button type="submit" className="w-fit">
                Send Message
              </Button>
            </form>
          )}
        </div>
      </div>
    </Container>
  );
}
