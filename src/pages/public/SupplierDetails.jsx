import { useState } from "react";
import { useParams } from "react-router-dom";
import { MapPin, Package, Star, Clock, Mail, Phone } from "lucide-react";
import Container from "../../components/common/Container.jsx";
import Breadcrumb from "../../components/common/Breadcrumb.jsx";
import Button from "../../components/common/Button.jsx";
import Tabs from "../../components/common/Tabs.jsx";
import Modal from "../../components/common/Modal.jsx";
import Textarea from "../../components/common/Textarea.jsx";
import ImageWithFallback from "../../components/common/ImageWithFallback.jsx";
import { VerifiedBadge } from "../../components/common/Badge.jsx";
import ProductCard from "../../components/product/ProductCard.jsx";
import LoadingState from "../../components/common/LoadingState.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { getVendorById } from "../../services/vendorService.js";
import { getProductsByVendor } from "../../services/productService.js";
import { getReviewsByVendor, addReview } from "../../services/reviewService.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useToast } from "../../hooks/useToast.js";
import { formatDate } from "../../utils/format.js";

export default function SupplierDetails() {
  const { id } = useParams();
  const { data: vendor, loading, error } = useAsync(() => getVendorById(id), [id]);

  if (loading) return <Container className="py-8"><LoadingState count={1} /></Container>;
  if (error || !vendor) return <Container className="py-16"><ErrorState message="Supplier not found." /></Container>;

  return <SupplierDetailsContent vendor={vendor} />;
}

function SupplierDetailsContent({ vendor }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [contactOpen, setContactOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const { show } = useToast();
  const { user } = useAuth();

  const { data: products, loading: productsLoading } = useAsync(() => getProductsByVendor(vendor.id), [vendor.id]);
  const { data: reviews, setData: setReviews } = useAsync(() => getReviewsByVendor(vendor.id), [vendor.id]);

  const sendMessage = () => {
    setContactOpen(false);
    setContactMessage("");
    show("Your message has been sent to the supplier.", { type: "success" });
  };

  const submitReview = async () => {
    if (!reviewForm.comment.trim()) {
      show("Add a short comment before submitting your review.", { type: "error" });
      return;
    }
    setReviewSubmitting(true);
    try {
      await addReview({
        vendorId: vendor.id,
        author: user?.businessName || user?.name || "ABC Textiles Pvt. Ltd.",
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });
      setReviews(await getReviewsByVendor(vendor.id));
      setReviewForm({ rating: 5, comment: "" });
      setReviewOpen(false);
      show("Review submitted. Thanks for the feedback!", { type: "success" });
    } finally {
      setReviewSubmitting(false);
    }
  };

  const tabs = [
    { value: "overview", label: "Overview" },
    { value: "products", label: `Products (${products?.length ?? 0})` },
    { value: "reviews", label: `Reviews (${reviews?.length ?? 0})` },
    { value: "business", label: "Business Information" },
  ];

  return (
    <Container className="flex flex-col gap-6 py-8">
      <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Suppliers", to: "/suppliers" }, { label: vendor.name }]} />

      <div className="flex flex-col gap-5 rounded-lg border border-border bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-slate-100">
            <ImageWithFallback src={vendor.image} alt={vendor.name} className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-xl font-semibold text-text sm:text-2xl">{vendor.name}</h1>
            {vendor.verified && <VerifiedBadge />}
            <span className="inline-flex items-center gap-1 text-sm text-text-secondary">
              <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
              {vendor.location}
              <Star className="ml-2 h-3.5 w-3.5 fill-warning-500 text-warning-500" aria-hidden="true" />
              {vendor.rating || "New"}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setActiveTab("products")}>
            View Products
          </Button>
          <Button onClick={() => setContactOpen(true)}>Contact Supplier</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:max-w-md">
        <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-white p-4 text-center">
          <Package className="h-4.5 w-4.5 text-brand-600" strokeWidth={1.75} aria-hidden="true" />
          <span className="text-lg font-semibold text-text">{vendor.productsCount}</span>
          <span className="text-xs text-text-secondary">Products</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-white p-4 text-center">
          <Clock className="h-4.5 w-4.5 text-brand-600" strokeWidth={1.75} aria-hidden="true" />
          <span className="text-lg font-semibold text-text">{vendor.yearsExperience}</span>
          <span className="text-xs text-text-secondary">Years</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-white p-4 text-center">
          <Star className="h-4.5 w-4.5 fill-warning-500 text-warning-500" aria-hidden="true" />
          <span className="text-lg font-semibold text-text">{vendor.rating || "—"}</span>
          <span className="text-xs text-text-secondary">Rating</span>
        </div>
      </div>

      <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} />

      {activeTab === "overview" && (
        <div className="max-w-2xl text-sm leading-relaxed text-text-secondary">
          <p>{vendor.about}</p>
        </div>
      )}

      {activeTab === "products" && (
        <>
          {productsLoading && <LoadingState count={4} />}
          {!productsLoading && products?.length === 0 && <EmptyState title="No products listed yet" />}
          {!productsLoading && products?.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "reviews" && (
        <div className="flex max-w-2xl flex-col gap-4">
          <Button variant="outline" size="sm" className="w-fit" onClick={() => setReviewOpen(true)}>
            Write a Review
          </Button>
          {(reviews ?? []).length === 0 && <EmptyState title="No reviews yet" />}
          {(reviews ?? []).map((review) => (
            <div key={review.id} className="rounded-lg border border-border bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-text">{review.author}</span>
                <span className="text-sm text-warning-600">{"★".repeat(review.rating)}</span>
              </div>
              <p className="mt-2 text-sm text-text-secondary">{review.comment}</p>
              <p className="mt-1 text-xs text-text-secondary">{review.date}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "business" && (
        <dl className="grid max-w-2xl grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
          {[
            ["Business Name", vendor.businessName],
            ["Business Type", vendor.businessType],
            ["GST Number", vendor.gstNumber],
            ["Joined", formatDate(vendor.joinedDate)],
            ["Address", `${vendor.address?.line1}, ${vendor.address?.city}, ${vendor.address?.state} ${vendor.address?.pincode}`],
            ["Categories", vendor.categories?.join(", ")],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between border-b border-border py-2 sm:justify-start sm:gap-4">
              <dt className="text-text-secondary">{label}</dt>
              <dd className="text-right font-medium text-text sm:text-left">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      <Modal open={contactOpen} onClose={() => setContactOpen(false)} title={`Contact ${vendor.name}`}>
        <div className="flex flex-col gap-4">
          <p className="flex items-center gap-2 text-sm text-text-secondary">
            <Mail className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" /> {vendor.email}
          </p>
          <p className="flex items-center gap-2 text-sm text-text-secondary">
            <Phone className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" /> {vendor.phone}
          </p>
          <Textarea
            label="Message"
            placeholder="Introduce your business and what you're looking to source..."
            value={contactMessage}
            onChange={(e) => setContactMessage(e.target.value)}
          />
          <Button onClick={sendMessage} disabled={!contactMessage.trim()}>
            Send Message
          </Button>
        </div>
      </Modal>

      <Modal open={reviewOpen} onClose={() => setReviewOpen(false)} title={`Review ${vendor.name}`}>
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
            placeholder="Share your experience working with this supplier..."
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
