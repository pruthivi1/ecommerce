import Container from "../common/Container.jsx";
import SectionHeader from "../common/SectionHeader.jsx";
import CategoryCard from "../category/CategoryCard.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { getCategories } from "../../services/categoryService.js";

export default function CategoriesSection() {
  const { data: categories } = useAsync(() => getCategories(), []);

  return (
    <section id="categories" className="py-14 lg:py-20">
      <Container className="flex flex-col gap-8">
        <SectionHeader
          eyebrow="Categories"
          title="Explore Categories"
          subtitle="Source products across growing business categories."
        />

        <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
          {(categories ?? []).map((category) => (
            <div key={category.id} className="w-36 shrink-0 snap-start sm:w-auto">
              <CategoryCard category={category} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
