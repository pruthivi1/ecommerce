import { ShieldCheck, Tags, PackageCheck, Lock, Search, FileText } from "lucide-react";
import Container from "../common/Container.jsx";
import SectionHeader from "../common/SectionHeader.jsx";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Verified Suppliers",
    description: "Discover suppliers with business verification information.",
  },
  {
    icon: Tags,
    title: "Wholesale Pricing",
    description: "Access pricing designed for bulk purchasing.",
  },
  {
    icon: PackageCheck,
    title: "Bulk Ordering",
    description: "Purchase products based on your business requirements.",
  },
  {
    icon: Lock,
    title: "Secure Payments",
    description: "Complete purchases through a secure payment flow.",
  },
  {
    icon: Search,
    title: "Supplier Discovery",
    description: "Explore businesses and products across multiple categories.",
  },
  {
    icon: FileText,
    title: "Transparent Information",
    description: "See pricing, MOQ and supplier details before ordering.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="border-t border-border bg-white py-14 lg:py-20">
      <Container className="flex flex-col gap-10">
        <SectionHeader
          eyebrow="Why MarketBridge"
          title="Built for Business Sourcing"
          align="center"
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col gap-3 rounded-lg border border-border bg-bg p-6 transition-colors duration-200 hover:border-brand-200 hover:bg-white hover:shadow-card"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-800 text-white">
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <h3 className="text-base font-semibold text-text">{title}</h3>
              <p className="text-sm text-text-secondary">{description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
