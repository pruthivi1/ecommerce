import { Link } from "react-router-dom";
import Container from "../common/Container.jsx";
import Button from "../common/Button.jsx";

export default function CTASection() {
  return (
    <section className="py-14 lg:py-20">
      <Container>
        <div className="flex flex-col items-center gap-6 rounded-xl border border-brand-800 bg-brand-900 px-6 py-14 text-center sm:px-12 lg:py-16">
          <h2 className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
            Ready to Grow Your Business?
          </h2>
          <p className="max-w-xl text-sm text-brand-100 sm:text-base">
            Discover suppliers, source products and simplify your wholesale purchasing.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button as={Link} to="/products" size="lg" className="bg-white text-brand-800 hover:bg-brand-50">
              Start Sourcing
            </Button>
            <Button
              as={Link}
              to="/register/vendor"
              size="lg"
              variant="ghost"
              className="border border-brand-600 text-white hover:bg-brand-800"
            >
              Become a Supplier
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
