import Container from "../common/Container.jsx";
import SectionHeader from "../common/SectionHeader.jsx";
import SupplierCard from "../supplier/SupplierCard.jsx";
import LoadingState from "../common/LoadingState.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { getVendors } from "../../services/vendorService.js";

export default function SuppliersSection() {
  const { data: vendors, loading } = useAsync(() => getVendors({ publicOnly: true }), []);
  const featured = (vendors ?? []).slice(0, 4);

  return (
    <section id="suppliers" className="py-14 lg:py-20">
      <Container className="flex flex-col gap-8">
        <SectionHeader
          eyebrow="Suppliers"
          title="Meet Verified Suppliers"
          subtitle="Connect with businesses supplying products across India."
        />

        {loading ? (
          <LoadingState count={4} />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((vendor) => (
              <SupplierCard key={vendor.id} supplier={vendor} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
