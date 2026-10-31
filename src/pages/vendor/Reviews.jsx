import PageHeader from "../../components/dashboard/PageHeader.jsx";
import Rating from "../../components/common/Rating.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import LoadingState from "../../components/common/LoadingState.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useAsync } from "../../hooks/useAsync.js";
import { getReviewsByVendor } from "../../services/reviewService.js";
import { getProductsByVendor } from "../../services/productService.js";
import { formatDate } from "../../utils/format.js";

export default function VendorReviews() {
  const { user } = useAuth();
  const vendorId = user?.vendorId || "v1";
  const { data: reviews, loading } = useAsync(() => getReviewsByVendor(vendorId), [vendorId]);
  const { data: products } = useAsync(() => getProductsByVendor(vendorId), [vendorId]);

  const productName = (productId) => products?.find((p) => p.id === productId)?.name;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Reviews" description="Feedback from buyers on your products and store." />

      {loading && <LoadingState count={3} />}
      {!loading && (reviews ?? []).length === 0 && <EmptyState title="No reviews yet" />}
      {!loading && (reviews ?? []).length > 0 && (
        <div className="flex flex-col gap-3">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-lg border border-border bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-text">{review.author}</span>
                <Rating value={review.rating} />
              </div>
              {review.productId && (
                <p className="mt-1 text-xs text-text-secondary">On {productName(review.productId) || "a product"}</p>
              )}
              <p className="mt-2 text-sm text-text-secondary">{review.comment}</p>
              <p className="mt-1 text-xs text-text-secondary">{formatDate(review.date)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
