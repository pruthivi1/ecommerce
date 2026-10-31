import { Link } from "react-router-dom";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Button from "../../components/common/Button.jsx";
import ImageWithFallback from "../../components/common/ImageWithFallback.jsx";
import { useWishlist } from "../../hooks/useWishlist.js";
import { useCart } from "../../hooks/useCart.js";
import { useToast } from "../../hooks/useToast.js";
import { formatCurrency } from "../../utils/format.js";

export default function Wishlist() {
  const { items, remove } = useWishlist();
  const { add } = useCart();
  const { show } = useToast();

  const moveToCart = async (item) => {
    try {
      await add({ id: item.productId, vendorId: item.vendorId, name: item.name, images: [item.image], price: item.price, unit: item.unit, moq: item.moq, moqUnit: item.moqUnit }, item.moq);
      await remove(item.productId);
      show(`${item.name} moved to cart.`, { type: "success" });
    } catch (err) {
      show(err.message, { type: "error" });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Wishlist" description="Products you've saved for later." />

      {items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Save products you're interested in to find them here later."
          action={
            <Button as={Link} to="/products" size="sm">
              Browse Products
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.productId} className="flex flex-col gap-3 rounded-lg border border-border bg-white p-4">
              <Link to={`/products/${item.productId}`} className="aspect-square w-full overflow-hidden rounded-md bg-slate-100">
                <ImageWithFallback src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </Link>
              <div>
                <Link to={`/products/${item.productId}`} className="text-sm font-medium text-text hover:text-brand-700">
                  {item.name}
                </Link>
                <p className="mt-1 text-sm text-text-secondary">{formatCurrency(item.price)} / {item.unit} · MOQ {item.moq}</p>
              </div>
              <div className="mt-auto flex gap-2">
                <Button size="sm" className="flex-1" onClick={() => moveToCart(item)}>
                  <ShoppingCart className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                  Move to Cart
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => remove(item.productId)}
                  aria-label={`Remove ${item.name} from wishlist`}
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
