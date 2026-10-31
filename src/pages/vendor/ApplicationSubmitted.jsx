import { Link, useSearchParams } from "react-router-dom";
import { Clock, Home } from "lucide-react";
import Container from "../../components/common/Container.jsx";
import Button from "../../components/common/Button.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";

export default function ApplicationSubmitted() {
  const [searchParams] = useSearchParams();
  const vendorId = searchParams.get("id");

  return (
    <Container className="flex flex-col items-center gap-5 py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-warning-50 text-warning-600">
        <Clock className="h-8 w-8" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <div>
        <h1 className="text-2xl font-semibold text-text sm:text-3xl">Application Submitted</h1>
        <p className="mt-2 max-w-md text-sm text-text-secondary">
          Thanks for applying to sell on MarketBridge. Our team typically reviews applications within 2-3 business days.
        </p>
      </div>
      <div className="flex items-center gap-2 rounded-md border border-border bg-white px-4 py-2.5">
        <span className="text-sm text-text-secondary">Application status:</span>
        <StatusBadge status="Pending" />
      </div>
      {vendorId && <p className="text-xs text-text-secondary">Reference ID: {vendorId}</p>}
      <div className="flex gap-2">
        <Button as={Link} to="/vendor/dashboard">
          Go to Vendor Dashboard
        </Button>
        <Button as={Link} to="/" variant="secondary">
          <Home className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          Back to Home
        </Button>
      </div>
    </Container>
  );
}
