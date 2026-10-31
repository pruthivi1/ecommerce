import { Link } from "react-router-dom";
import ImageWithFallback from "../common/ImageWithFallback.jsx";

export default function CategoryCard({ category }) {
  return (
    <Link
      to={`/categories/${category.slug}`}
      className="group flex shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <ImageWithFallback
          src={category.image}
          alt={category.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-0.5 p-3.5">
        <span className="text-sm font-semibold text-text">{category.name}</span>
        <span className="text-xs text-text-secondary">{category.meta}</span>
      </div>
    </Link>
  );
}
