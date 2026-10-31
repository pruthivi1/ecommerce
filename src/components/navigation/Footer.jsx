import { Link } from "react-router-dom";
import { Store } from "lucide-react";
import Container from "../common/Container.jsx";
import { LinkedinIcon, XIcon, InstagramIcon, FacebookIcon } from "../common/SocialIcons.jsx";

const COLUMNS = [
  {
    title: "Marketplace",
    links: [
      { label: "Products", to: "/products" },
      { label: "Categories", to: "/categories" },
      { label: "Suppliers", to: "/suppliers" },
      { label: "How It Works", to: "/how-it-works" },
    ],
  },
  {
    title: "For Buyers",
    links: [
      { label: "Browse Products", to: "/products" },
      { label: "Orders", to: "/buyer/orders" },
      { label: "Quotes", to: "/buyer/quotes" },
      { label: "Business Account", to: "/register/buyer" },
    ],
  },
  {
    title: "For Suppliers",
    links: [
      { label: "Become a Supplier", to: "/register/vendor" },
      { label: "Vendor Login", to: "/login?role=vendor" },
      { label: "Seller Guide", to: "/how-it-works" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "Help Center", to: "/help" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms", to: "/terms" },
      { label: "Refund Policy", to: "/refund-policy" },
    ],
  },
];

const SOCIALS = [
  { icon: LinkedinIcon, label: "LinkedIn", href: "#" },
  { icon: XIcon, label: "X (Twitter)", href: "#" },
  { icon: InstagramIcon, label: "Instagram", href: "#" },
  { icon: FacebookIcon, label: "Facebook", href: "#" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <Container className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 sm:grid-cols-3 lg:grid-cols-6 lg:py-16">
        <div className="col-span-2 flex flex-col gap-4 sm:col-span-3 lg:col-span-1">
          <Link to="/" className="flex items-center gap-2 text-base font-extrabold tracking-tight text-brand-800">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-800 text-white" aria-hidden="true">
              <Store className="h-4.5 w-4.5" strokeWidth={2} />
            </span>
            MARKETBRIDGE
          </Link>
          <p className="max-w-xs text-sm text-text-secondary">
            India's B2B marketplace connecting business buyers with verified wholesale suppliers.
          </p>
          <div className="flex items-center gap-2">
            {SOCIALS.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-text-secondary transition-colors hover:border-brand-300 hover:text-brand-700"
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title} className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-text">{column.title}</h3>
            <ul className="flex flex-col gap-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-text-secondary transition-colors hover:text-brand-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>

      <div className="border-t border-border">
        <Container className="flex flex-col items-center justify-between gap-2 py-6 text-xs text-text-secondary sm:flex-row">
          <p>&copy; 2026 MarketBridge. All rights reserved.</p>
          <p>Made for Indian businesses, by design.</p>
        </Container>
      </div>
    </footer>
  );
}
