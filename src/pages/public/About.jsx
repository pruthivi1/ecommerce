import { ShieldCheck, Tags, Handshake, Building2 } from "lucide-react";
import Container from "../../components/common/Container.jsx";
import Breadcrumb from "../../components/common/Breadcrumb.jsx";
import SectionHeader from "../../components/common/SectionHeader.jsx";

const VALUES = [
  { icon: ShieldCheck, title: "Verified suppliers", description: "Every supplier on the marketplace goes through a business verification review before listing products." },
  { icon: Tags, title: "Transparent pricing", description: "Wholesale pricing, MOQ and bulk pricing tiers are shown upfront — no hidden negotiation required." },
  { icon: Handshake, title: "Built for B2B", description: "Quote requests, bulk ordering and business accounts are core to how the platform works, not an afterthought." },
  { icon: Building2, title: "India-first", description: "Designed around how Indian wholesale buyers and suppliers actually do business." },
];

export default function About() {
  return (
    <Container className="flex flex-col gap-10 py-8">
      <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "About" }]} />

      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">About MarketBridge</h1>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">
          MarketBridge is a B2B wholesale marketplace connecting Indian business buyers with verified suppliers
          across electronics, apparel, sarees, handloom, home & living, accessories and beauty categories. We're
          building the sourcing layer for businesses that need reliable suppliers, clear MOQ and bulk pricing, and a
          simpler way to place and track wholesale orders.
        </p>
      </div>

      <div>
        <SectionHeader title="What we stand for" />
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {VALUES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col gap-3 rounded-lg border border-border bg-white p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-800 text-white">
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <h3 className="text-base font-semibold text-text">{title}</h3>
              <p className="text-sm text-text-secondary">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
