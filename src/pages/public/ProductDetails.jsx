import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Minus, Plus, ShieldCheck, MapPin, Star, FileText, ShoppingCart, PackageX } from "lucide-react";
import Container from "../../components/common/Container.jsx";
import Breadcrumb from "../../components/common/Breadcrumb.jsx";
import Button from "../../components/common/Button.jsx";
import Tabs from "../../components/common/Tabs.jsx";
import Modal from "../../components/common/Modal.jsx";
import Input from "../../components/common/Input.jsx";
import Textarea from "../../components/common/Textarea.jsx";
import ImageWithFallback from "../../components/common/ImageWithFallback.jsx";
import Rating from "../../components/common/Rating.jsx";
import { VerifiedBadge } from "../../components/common/Badge.jsx";
import BulkPricingTable from "../../components/product/BulkPricingTable.jsx";
import ProductCard from "../../components/product/ProductCard.jsx";
import LoadingState from "../../components/common/LoadingState.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { getPublicProductById, getRelatedProducts } from "../../services/productService.js";
import { getReviewsByProduct, addReview } from "../../services/reviewService.js";
import { createQuote } from "../../services/quoteService.js";
import { useCart } from "../../hooks/useCart.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useToast } from "../../hooks/useToast.js";
import { formatCurrency } from "../../utils/format.js";
import { validateFields, hasErrors, required, isPositiveNumber } from "../../utils/validators.js";
import { ROLES } from "../../utils/constants.js";

function priceForQty(product, qty) {
  const tier = [...product.bulkPricing].reverse().find((t) => qty >= t.minQty);
  return tier ? tier.price : product.price;
}

export default function ProductDetails() {
  const { id } = useParams();
  const { data: result, loading, error } = useAsync(() => getPublicProductById(id), [id]);

  if (loading) return <Container className="py-8"><LoadingState count={1} /></Container>;
  if (error) return <Container className="py-16"><ErrorState message={error} /></Container>;
  if (!result?.found) return <Container className="py-16"><ErrorState message="Product not found." /></Container>;

  if (!result.available) {
    return (
      <Container className="py-16">
        <EmptyState
          icon={PackageX}
          title="Product unavailable"
          description={result.reason || "This product is currently unavailable."}
          action={
            <Button as={Link} to="/products" size="sm">
              Browse Products
            </Button>
          }
        />
      </Container>
    );
  }

  return <ProductDetailsContent product={result.product} />;
}

function ProductDetailsContent({ product }) {
  const { add } = useCart();
  const { user, role } = useAuth();
  const { show } = useToast();
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(product.moq);
  const [activeTab, setActiveTab] = useState("description");
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({ quantity: product.moq, targetPrice: "", deliveryLocation: "", message: "" });
  const [quoteErrors, setQuoteErrors] = useState({});
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const { data: relatedProducts } = useAsync(() => getRelatedProducts(product), [product.id]);
  const { data: reviews, setData: setReviews } = useAsync(() => getReviewsByProduct(product.id), [product.id]);

  const submitReview = async () => {
    if (!reviewForm.comment.trim()) {
      show("Add a short comment before submitting your review.", { type: "error" });
      return;
    }
    setReviewSubmitting(true);
    try {
      await addReview({
        productId: product.id,
        vendorId: product.vendorId,
        author: user?.businessName || user?.name || "ABC Textiles Pvt. Ltd.",
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });
      setReviews(await getReviewsByProduct(product.id));
      setReviewForm({ rating: 5, comment: "" });
      setReviewOpen(false);
      show("Review submitted. Thanks for the feedback!", { type: "success" });
    } finally {
      setReviewSubmitting(false);
    }
  };

  const unitPrice = priceForQty(product, qty);
  const estimatedTotal = unitPrice * qty;

  const handleAddToCart = async () => {
    if (role === ROLES.VENDOR || role === ROLES.ADMIN) {
      show("Switch to a buyer account to add items to cart.", { type: "error" });
      return;
    }
    if (qty < product.moq) {
      show(`Minimum order quantity is ${product.moq} ${product.moqUnit}.`, { type: "error" });
      return;
    }
    if (product.stock != null && qty > product.stock) {
      show(`Only ${product.stock} ${product.moqUnit} available in stock.`, { type: "error" });
      return;
    }
    try {
      await add(product, qty);
    } catch (err) {
      show(err.message, { type: "error" });
      return;
    }
    show(`Added ${qty} ${product.moqUnit} to cart.`, { type: "success" });
  };

  const openQuote = () => {
    if (role === ROLES.VENDOR || role === ROLES.ADMIN) {
      show("Switch to a buyer account to request a quote.", { type: "error" });
      return;
    }
    setQuoteForm({ quantity: product.moq, targetPrice: "", deliveryLocation: "", message: "" });
    setQuoteErrors({});
    setQuoteSubmitted(false);
    setQuoteOpen(true);
  };

  const submitQuote = async () => {
    const errors = validateFields(quoteForm, {
      quantity: [required, isPositiveNumber],
      deliveryLocation: [required],
    });
    setQuoteErrors(errors);
    if (hasErrors(errors)) return;

    setQuoteSubmitting(true);
    try {
      await createQuote({
        buyerId: user?.id || "buyer-1",
        actingRole: role,
        productId: product.id,
        vendorId: product.vendorId,
        quantity: Number(quoteForm.quantity),
        targetPrice: quoteForm.targetPrice ? Number(quoteForm.targetPrice) : null,
        deliveryLocation: quoteForm.deliveryLocation,
        message: quoteForm.message,
      });
      setQuoteSubmitted(true);
    } catch (err) {
      show(err.message, { type: "error" });
    } finally {
      setQuoteSubmitting(false);
    }
  };

  const tabs = [
    { value: "description", label: "Description" },
    { value: "specifications", label: "Specifications" },
    { value: "pricing", label: "Bulk Pricing" },
    { value: "shipping", label: "Shipping" },
    { value: "supplier", label: "Supplier" },
    { value: "reviews", label: `Reviews (${reviews?.length ?? 0})` },
  ];

  return (
    <Container className="flex flex-col gap-8 py-8">
      <Breadcrumb
        items={[
          { label: "Home", to: "/" },
          { label: product.category, to: `/products?category=${encodeURIComponent(product.category)}` },
          { label: product.name },
        ]}
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="aspect-square w-full overflow-hidden rounded-lg border border-border bg-slate-100">
            <ImageWithFallback src={product.images[activeImage]} alt={product.name} className="h-full w-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, index) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`h-16 w-16 overflow-hidden rounded-md border-2 ${index === activeImage ? "border-brand-700" : "border-transparent"}`}
                >
                  <ImageWithFallback src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">{product.name}</h1>
            <div className="mt-2 flex items-center gap-3">
              <Rating value={product.rating} />
              <span className="text-sm text-text-secondary">({product.reviewCount} reviews)</span>
              {product.vendor?.verified && <VerifiedBadge />}
            </div>
          </div>

          <div className="flex items-end gap-2 border-y border-border py-4">
            <span className="text-3xl font-semibold text-text">{formatCurrency(unitPrice)}</span>
            <span className="pb-1 text-sm text-text-secondary">/ {product.unit}</span>
            {unitPrice < product.price && (
              <span className="pb-1 text-xs font-medium text-success-600">Bulk price applied</span>
            )}
          </div>

          <p className="text-sm text-text-secondary">
            MOQ: <span className="font-semibold text-text">{product.moq} {product.moqUnit}</span> · SKU: {product.sku}
          </p>

          <BulkPricingTable tiers={product.bulkPricing} unit={product.unit} activeQty={qty} />

          <div className="flex flex-col gap-3">
            <label htmlFor="qty" className="text-sm font-medium text-text">
              Quantity ({product.moqUnit})
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-md border border-border">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="flex h-11 w-11 items-center justify-center text-text-secondary hover:bg-slate-50"
                >
                  <Minus className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                </button>
                <input
                  id="qty"
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                  className="h-11 w-20 border-x border-border text-center text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="flex h-11 w-11 items-center justify-center text-text-secondary hover:bg-slate-50"
                >
                  <Plus className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                </button>
              </div>
              {qty < product.moq && (
                <span className="text-xs font-medium text-warning-600">Below MOQ of {product.moq}</span>
              )}
            </div>

            <div className="rounded-md bg-bg px-4 py-3 text-sm">
              Estimated total: <span className="font-semibold text-text">{formatCurrency(estimatedTotal)}</span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={handleAddToCart} size="lg" className="flex-1">
                <ShoppingCart className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                Add to Cart
              </Button>
              <Button onClick={openQuote} variant="secondary" size="lg" className="flex-1">
                <FileText className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                Request Quote
              </Button>
            </div>
          </div>

          {product.vendor && (
            <div className="flex items-center justify-between rounded-lg border border-border bg-white p-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-text">{product.vendor.name}</span>
                <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
                  <MapPin className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
                  {product.vendor.location}
                  <Star className="ml-2 h-3 w-3 fill-warning-500 text-warning-500" aria-hidden="true" />
                  {product.vendor.rating}
                </span>
              </div>
              <Button as={Link} to={`/suppliers/${product.vendor.id}`} variant="outline" size="sm">
                View Supplier
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} />
        <div className="max-w-3xl text-sm text-text">
          {activeTab === "description" && <p className="leading-relaxed text-text-secondary">{product.description}</p>}

          {activeTab === "specifications" && (
            <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              {Object.entries(product.specifications || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-border py-2 sm:justify-start sm:gap-4">
                  <dt className="text-text-secondary">{key}</dt>
                  <dd className="font-medium text-text">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          {activeTab === "pricing" && <BulkPricingTable tiers={product.bulkPricing} unit={product.unit} activeQty={qty} className="max-w-md" />}

          {activeTab === "shipping" && <p className="leading-relaxed text-text-secondary">{product.shippingInfo}</p>}

          {activeTab === "supplier" && product.vendor && (
            <div className="flex flex-col gap-2">
              <p className="text-text-secondary">
                <span className="font-medium text-text">{product.vendor.name}</span> is based in {product.vendor.location}
                {product.vendor.verified ? ", verified by MarketBridge." : "."}
              </p>
              <Button as={Link} to={`/suppliers/${product.vendor.id}`} variant="outline" size="sm" className="w-fit">
                View full supplier profile
              </Button>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="flex flex-col gap-4">
              <Button variant="outline" size="sm" className="w-fit" onClick={() => setReviewOpen(true)}>
                Write a Review
              </Button>
              {(reviews ?? []).length === 0 && <p className="text-text-secondary">No reviews yet for this product.</p>}
              {(reviews ?? []).map((review) => (
                <div key={review.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-text">{review.author}</span>
                    <Rating value={review.rating} />
                  </div>
                  <p className="mt-2 text-text-secondary">{review.comment}</p>
                  <p className="mt-1 text-xs text-text-secondary">{review.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {relatedProducts?.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-text">Related Products</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      <Modal open={quoteOpen} onClose={() => setQuoteOpen(false)} title="Request a Quote">
        {quoteSubmitted ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <ShieldCheck className="h-10 w-10 text-success-600" strokeWidth={1.5} aria-hidden="true" />
            <p className="font-medium text-text">Quote request submitted</p>
            <p className="text-sm text-text-secondary">
              {product.vendor?.name} will respond to your request. Track it from your Quotes page.
            </p>
            <Button as={Link} to="/buyer/quotes" size="sm" onClick={() => setQuoteOpen(false)}>
              View My Quotes
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-text-secondary">
              Product: <span className="font-medium text-text">{product.name}</span>
            </p>
            <Input
              label="Required Quantity"
              type="number"
              min={1}
              required
              value={quoteForm.quantity}
              error={quoteErrors.quantity}
              onChange={(e) => setQuoteForm((f) => ({ ...f, quantity: e.target.value }))}
            />
            <Input
              label="Target Price (per unit)"
              type="number"
              min={0}
              placeholder="Optional"
              value={quoteForm.targetPrice}
              onChange={(e) => setQuoteForm((f) => ({ ...f, targetPrice: e.target.value }))}
            />
            <Input
              label="Delivery Location"
              required
              placeholder="City, State"
              value={quoteForm.deliveryLocation}
              error={quoteErrors.deliveryLocation}
              onChange={(e) => setQuoteForm((f) => ({ ...f, deliveryLocation: e.target.value }))}
            />
            <Textarea
              label="Message"
              placeholder="Any additional requirements..."
              value={quoteForm.message}
              onChange={(e) => setQuoteForm((f) => ({ ...f, message: e.target.value }))}
            />
            <Button onClick={submitQuote} disabled={quoteSubmitting}>
              {quoteSubmitting ? "Submitting…" : "Submit Quote Request"}
            </Button>
          </div>
        )}
      </Modal>

      <Modal open={reviewOpen} onClose={() => setReviewOpen(false)} title="Write a Review">
        <div className="flex flex-col gap-4">
          <div>
            <span className="mb-1.5 block text-sm font-medium text-text">Rating</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                  aria-label={`${star} star${star > 1 ? "s" : ""}`}
                  className="p-0.5"
                >
                  <Star
                    className={`h-6 w-6 ${star <= reviewForm.rating ? "fill-warning-500 text-warning-500" : "text-border"}`}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
          </div>
          <Textarea
            label="Your Review"
            required
            placeholder="Share your experience with this product..."
            value={reviewForm.comment}
            onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
          />
          <Button onClick={submitReview} disabled={reviewSubmitting}>
            {reviewSubmitting ? "Submitting…" : "Submit Review"}
          </Button>
        </div>
      </Modal>
    </Container>
  );
}
