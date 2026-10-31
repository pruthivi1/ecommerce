import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Container from "../common/Container.jsx";
import SectionHeader from "../common/SectionHeader.jsx";
import Button from "../common/Button.jsx";
import ProductCard from "../product/ProductCard.jsx";
import LoadingState from "../common/LoadingState.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { getProducts } from "../../services/productService.js";

export default function FeaturedProducts() {
  const { data: products, loading } = useAsync(() => getProducts({ publicOnly: true, sort: "rating-desc" }), []);
  const featured = (products ?? []).slice(0, 8);

  return (
    <section id="products" className="border-t border-border bg-white py-14 lg:py-20">
      <Container className="flex flex-col gap-8">
        <SectionHeader
          eyebrow="Marketplace"
          title="Featured Products"
          subtitle="Wholesale products from suppliers on the marketplace."
          action={
            <Button as={Link} to="/products" variant="outline" size="sm">
              View All Products
              <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </Button>
          }
        />

        {loading ? (
          <LoadingState count={8} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
