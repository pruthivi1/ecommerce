import { Link } from "react-router-dom";
import { Building2, Store, ArrowRight } from "lucide-react";

const OPTIONS = [
  {
    to: "/register/buyer",
    icon: Building2,
    title: "Register as a Buyer",
    description: "Source wholesale products from verified suppliers across India.",
  },
  {
    to: "/register/vendor",
    icon: Store,
    title: "Register as a Vendor",
    description: "List your products and reach business buyers looking to source in bulk.",
  },
];

export default function Register() {
  return (
    <div className="w-full max-w-2xl">
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold text-text sm:text-2xl">Create your MarketBridge account</h1>
        <p className="mt-1 text-sm text-text-secondary">Choose how you'd like to use the marketplace.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {OPTIONS.map(({ to, icon: Icon, title, description }) => (
          <Link
            key={to}
            to={to}
            className="group flex flex-col gap-3 rounded-lg border border-border bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card-hover"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-800 text-white">
              <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <h2 className="text-base font-semibold text-text">{title}</h2>
            <p className="text-sm text-text-secondary">{description}</p>
            <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-brand-700">
              Continue
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
