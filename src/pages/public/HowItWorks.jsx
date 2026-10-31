import { Link } from "react-router-dom";
import { Search, ClipboardList, ShoppingBag, TrendingUp, FileCheck, Package, Truck, Wallet } from "lucide-react";
import Container from "../../components/common/Container.jsx";
import Breadcrumb from "../../components/common/Breadcrumb.jsx";
import Button from "../../components/common/Button.jsx";

const BUYER_STEPS = [
  { icon: Search, title: "Discover", description: "Find products and suppliers that match your business." },
  { icon: ClipboardList, title: "Compare", description: "Review pricing, MOQ and supplier information." },
  { icon: ShoppingBag, title: "Order", description: "Purchase products securely through the platform." },
  { icon: TrendingUp, title: "Grow", description: "Build reliable sourcing relationships and grow your business." },
];

const VENDOR_STEPS = [
  { icon: FileCheck, title: "Apply", description: "Submit your business details and documents for verification." },
  { icon: Package, title: "List Products", description: "Add products with MOQ and bulk pricing once approved." },
  { icon: Truck, title: "Fulfil Orders", description: "Receive and process orders from verified business buyers." },
  { icon: Wallet, title: "Get Paid", description: "Track earnings and request payouts from your dashboard." },
];

function StepGrid({ steps }) {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map(({ icon: Icon, title, description }, index) => (
        <div key={title} className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
              <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span className="text-2xl font-extrabold text-slate-200">{String(index + 1).padStart(2, "0")}</span>
          </div>
          <h3 className="text-base font-semibold text-text">{title}</h3>
          <p className="text-sm text-text-secondary">{description}</p>
        </div>
      ))}
    </div>
  );
}

export default function HowItWorks() {
  return (
    <Container className="flex flex-col gap-12 py-8">
      <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "How It Works" }]} />

      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">How MarketBridge Works</h1>
        <p className="mt-2 text-sm text-text-secondary sm:text-base">
          A simpler way for Indian businesses to source products and for suppliers to reach verified buyers.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <h2 className="text-lg font-semibold text-text">For Buyers</h2>
        <StepGrid steps={BUYER_STEPS} />
        <Button as={Link} to="/products" className="w-fit">
          Explore Products
        </Button>
      </div>

      <div className="flex flex-col gap-6 border-t border-border pt-10">
        <h2 className="text-lg font-semibold text-text">For Suppliers</h2>
        <StepGrid steps={VENDOR_STEPS} />
        <Button as={Link} to="/vendor/apply" variant="secondary" className="w-fit">
          Become a Supplier
        </Button>
      </div>
    </Container>
  );
}
