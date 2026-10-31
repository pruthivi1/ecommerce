import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Tags, Lock, Building2 } from "lucide-react";
import Container from "../common/Container.jsx";
import Button from "../common/Button.jsx";
import ImageWithFallback from "../common/ImageWithFallback.jsx";

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Verified Suppliers" },
  { icon: Tags, label: "Wholesale Pricing" },
  { icon: Lock, label: "Secure Payments" },
  { icon: Building2, label: "Business-focused Marketplace" },
];

const COLLAGE_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=500&q=80",
    alt: "Electronics wholesale products",
    className: "col-span-2 aspect-[16/9]",
  },
  {
    src: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80",
    alt: "Handwoven sarees",
    className: "col-span-1 aspect-square",
  },
  {
    src: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=400&q=80",
    alt: "Apparel and shirts",
    className: "col-span-1 aspect-square",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Handloom.jpg/500px-Handloom.jpg",
    alt: "Handloom fabric",
    className: "col-span-2 aspect-[16/9]",
  },
];

export default function Hero() {
  return (
    <section className="border-b border-border bg-white">
      <Container className="grid gap-10 py-12 lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-20">
        <div className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center rounded-md bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
            B2B Wholesale Sourcing
          </span>

          <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight text-text sm:text-5xl lg:text-[3.25rem]">
            Source Products Directly From Trusted Indian Suppliers
          </h1>

          <p className="max-w-xl text-base text-text-secondary sm:text-lg">
            Discover wholesale products from verified suppliers and grow your business with a
            simpler way to source.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button as={Link} to="/products" size="lg">
              Explore Products
              <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </Button>
            <Button as={Link} to="/register/vendor" variant="secondary" size="lg">
              Become a Supplier
            </Button>
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-border pt-6 sm:grid-cols-4">
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0 text-success-600" strokeWidth={2} aria-hidden="true" />
                <dt className="sr-only">Trust indicator</dt>
                <dd className="text-xs font-medium text-text-secondary sm:text-sm">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {COLLAGE_IMAGES.map((img) => (
            <div
              key={img.alt}
              className={`overflow-hidden rounded-lg border border-border bg-slate-100 shadow-card ${img.className}`}
            >
              <ImageWithFallback src={img.src} alt={img.alt} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
