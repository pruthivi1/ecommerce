export const categories = [
  {
    id: "electronics",
    slug: "electronics",
    name: "Electronics",
    meta: "Wholesale products",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80",
    subcategories: ["Audio", "Lighting", "Mobile Accessories", "Small Appliances"],
    status: "Active",
  },
  {
    id: "apparel",
    slug: "apparel",
    name: "Apparel",
    meta: "Wholesale products",
    image: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=600&q=80",
    subcategories: ["Shirts", "T-Shirts", "Trousers", "Ethnic Wear"],
    status: "Active",
  },
  {
    id: "sarees",
    slug: "sarees",
    name: "Sarees",
    meta: "Wholesale products",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
    subcategories: ["Cotton Sarees", "Silk Sarees", "Printed Sarees"],
    status: "Active",
  },
  {
    id: "handloom",
    slug: "handloom",
    name: "Handloom",
    meta: "Wholesale products",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/India_-_Varanasi_roll_of_fabric_-_0997.jpg/500px-India_-_Varanasi_roll_of_fabric_-_0997.jpg",
    subcategories: ["Fabric Rolls", "Handloom Sarees", "Handloom Furnishing"],
    status: "Active",
  },
  {
    id: "home-living",
    slug: "home-living",
    name: "Home & Living",
    meta: "Wholesale products",
    image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80",
    subcategories: ["Bedding", "Decor", "Kitchenware"],
    status: "Active",
  },
  {
    id: "accessories",
    slug: "accessories",
    name: "Accessories",
    meta: "Wholesale products",
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=600&q=80",
    subcategories: ["Bags", "Jewelry", "Belts"],
    status: "Active",
  },
  {
    id: "beauty",
    slug: "beauty-personal-care",
    name: "Beauty & Personal Care",
    meta: "Wholesale products",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
    subcategories: ["Skincare", "Haircare", "Grooming"],
    status: "Active",
  },
  {
    id: "more",
    slug: "more",
    name: "More",
    meta: "Explore all categories",
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80",
    subcategories: [],
    status: "Active",
  },
];

export function getCategoryBySlug(slug) {
  return categories.find((c) => c.slug === slug);
}
