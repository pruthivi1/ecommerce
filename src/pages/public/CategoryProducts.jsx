import { useParams, Link } from "react-router-dom";
import Container from "../../components/common/Container.jsx";
import Breadcrumb from "../../components/common/Breadcrumb.jsx";
import ProductCard from "../../components/product/ProductCard.jsx";
import LoadingState from "../../components/common/LoadingState.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import Button from "../../components/common/Button.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { getCategoryBySlug } from "../../services/categoryService.js";
import { getProducts } from "../../services/productService.js";

export default function CategoryProducts() {
  const { slug } = useParams();
  const { data: category, loading: categoryLoading } = useAsync(() => getCategoryBySlug(slug), [slug]);
  const { data: products, loading: productsLoading, error } = useAsync(
    () => (category ? getProducts({ category: category.name, publicOnly: true }) : Promise.resolve([])),
    [category?.id]
  );

  const loading = categoryLoading || productsLoading;

  if (!categoryLoading && !category) {
    return (
      <Container className="py-16">
        <ErrorState message="Category not found." />
      </Container>
    );
  }

  return (
    <Container className="flex flex-col gap-6 py-8">
      <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Categories", to: "/categories" }, { label: category?.name || "" }]} />

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">{category?.name}</h1>
        {category?.subcategories?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {category.subcategories.map((sub) => (
              <span key={sub} className="rounded-full border border-border bg-white px-3 py-1 text-xs text-text-secondary">
                {sub}
              </span>
            ))}
          </div>
        )}
      </div>

      {loading && <LoadingState count={8} />}
      {error && <ErrorState message={error} />}
      {!loading && !error && products?.length === 0 && (
        <EmptyState
          title="No products found"
          description="There are no active products in this category yet."
          action={
            <Button as={Link} to="/products" variant="secondary" size="sm">
              Browse All Products
            </Button>
          }
        />
      )}
      {!loading && !error && products?.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </Container>
  );
}
