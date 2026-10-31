import { Link } from "react-router-dom";
import { MapPin, Heart } from "lucide-react";
import ImageWithFallback from "../common/ImageWithFallback.jsx";
import Rating from "../common/Rating.jsx";
import PriceDisplay from "../common/PriceDisplay.jsx";
import MOQDisplay from "../common/MOQDisplay.jsx";
import { VerifiedBadge } from "../common/Badge.jsx";
import { useWishlist } from "../../hooks/useWishlist.js";
import { useToast } from "../../hooks/useToast.js";

export default function ProductCard({ product, showWishlist = true }) {
  const { has, toggle } = useWishlist();
  const { show } = useToast();
  const inWishlist = has(product.id);

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggle(product);
      show(inWishlist ? "Removed from wishlist" : "Added to wishlist", { type: "success" });
    } catch (err) {
      show(err.message, { type: "error" });
    }
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        <ImageWithFallback
          src={product.images?.[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {showWishlist && (
          <button
            type="button"
            onClick={handleWishlist}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={inWishlist}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-text-secondary shadow-sm transition-colors hover:text-error-600"
          >
            <Heart className={`h-4 w-4 ${inWishlist ? "fill-error-500 text-error-500" : ""}`} strokeWidth={1.75} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-text sm:text-base">
          {product.name}
        </h3>

        <Rating value={product.rating} />

        <PriceDisplay price={product.price} unit={product.unit} />

        <MOQDisplay moq={product.moq} moqUnit={product.moqUnit} />

        {product.vendor?.verified && <VerifiedBadge />}

        <div className="mt-auto flex flex-col gap-0.5 border-t border-border pt-3">
          <span className="text-sm font-medium text-text">{product.vendor?.name}</span>
          <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
            <MapPin className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
            {product.vendor?.location}
          </span>
        </div>
      </div>
    </Link>
  );
}
