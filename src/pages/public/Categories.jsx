import Container from "../../components/common/Container.jsx";
import Breadcrumb from "../../components/common/Breadcrumb.jsx";
import CategoryCard from "../../components/category/CategoryCard.jsx";
import LoadingState from "../../components/common/LoadingState.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { getCategories } from "../../services/categoryService.js";

export default function Categories() {
  const { data: categories, loading } = useAsync(() => getCategories(), []);

  return (
    <Container className="flex flex-col gap-6 py-8">
      <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Categories" }]} />
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">Explore Categories</h1>
        <p className="text-sm text-text-secondary">Source products across growing business categories.</p>
      </div>

      {loading ? (
        <LoadingState count={8} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {(categories ?? []).map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </Container>
  );
}
