import { Search, ClipboardList, ShoppingBag, TrendingUp } from "lucide-react";
import Container from "../common/Container.jsx";
import SectionHeader from "../common/SectionHeader.jsx";

const STEPS = [
  {
    number: "01",
    icon: Search,
    title: "Discover",
    description: "Find products and suppliers that match your business.",
  },
  {
    number: "02",
    icon: ClipboardList,
    title: "Compare",
    description: "Review pricing, MOQ and supplier information.",
  },
  {
    number: "03",
    icon: ShoppingBag,
    title: "Order",
    description: "Purchase products securely through the platform.",
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "Grow",
    description: "Build reliable sourcing relationships and grow your business.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border bg-white py-14 lg:py-20">
      <Container className="flex flex-col gap-10">
        <SectionHeader eyebrow="Process" title="How It Works" align="center" />

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ number, icon: Icon, title, description }, index) => (
            <div key={number} className="relative flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="text-2xl font-extrabold text-slate-200">{number}</span>
              </div>
              <h3 className="text-base font-semibold text-text">{title}</h3>
              <p className="text-sm text-text-secondary">{description}</p>
              {index < STEPS.length - 1 && (
                <span className="absolute right-[-1rem] top-6 hidden h-px w-8 bg-border lg:block" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
