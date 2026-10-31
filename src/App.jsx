import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import MainLayout from "./layouts/MainLayout.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";
import BuyerLayout from "./layouts/BuyerLayout.jsx";
import VendorLayout from "./layouts/VendorLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import ProtectedRoute from "./components/routing/ProtectedRoute.jsx";
import { ROLES } from "./utils/constants.js";

// Public
import Home from "./pages/public/Home.jsx";
import ProductListing from "./pages/public/ProductListing.jsx";
import ProductDetails from "./pages/public/ProductDetails.jsx";
import Categories from "./pages/public/Categories.jsx";
import CategoryProducts from "./pages/public/CategoryProducts.jsx";
import SupplierListing from "./pages/public/SupplierListing.jsx";
import SupplierDetails from "./pages/public/SupplierDetails.jsx";
import About from "./pages/public/About.jsx";
import Contact from "./pages/public/Contact.jsx";
import HowItWorks from "./pages/public/HowItWorks.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import OrderConfirmation from "./pages/OrderConfirmation.jsx";
import ComingSoon from "./pages/public/ComingSoon.jsx";
import NotFound from "./pages/NotFound.jsx";

// Vendor onboarding (public — pre-approval)
import VendorApply from "./pages/vendor/Apply.jsx";
import ApplicationSubmitted from "./pages/vendor/ApplicationSubmitted.jsx";

// Auth
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import RegisterBuyer from "./pages/auth/RegisterBuyer.jsx";
import RegisterVendor from "./pages/auth/RegisterVendor.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";

// Buyer
import BuyerDashboard from "./pages/buyer/Dashboard.jsx";
import BuyerOrders from "./pages/buyer/Orders.jsx";
import BuyerOrderDetails from "./pages/buyer/OrderDetails.jsx";
import BuyerQuotes from "./pages/buyer/Quotes.jsx";
import BuyerWishlist from "./pages/buyer/Wishlist.jsx";
import BuyerSuppliers from "./pages/buyer/Suppliers.jsx";
import BuyerAddresses from "./pages/buyer/Addresses.jsx";
import BuyerBusinessProfile from "./pages/buyer/BusinessProfile.jsx";
import BuyerNotifications from "./pages/buyer/Notifications.jsx";
import BuyerSettings from "./pages/buyer/Settings.jsx";

// Vendor
import VendorDashboard from "./pages/vendor/Dashboard.jsx";
import VendorProducts from "./pages/vendor/Products.jsx";
import VendorProductForm from "./pages/vendor/ProductForm.jsx";
import VendorInventory from "./pages/vendor/Inventory.jsx";
import VendorOrders from "./pages/vendor/Orders.jsx";
import VendorOrderDetails from "./pages/vendor/OrderDetails.jsx";
import VendorQuotes from "./pages/vendor/Quotes.jsx";
import VendorCustomers from "./pages/vendor/Customers.jsx";
import VendorEarnings from "./pages/vendor/Earnings.jsx";
import VendorPayouts from "./pages/vendor/Payouts.jsx";
import VendorReviews from "./pages/vendor/Reviews.jsx";
import VendorStoreSettings from "./pages/vendor/StoreSettings.jsx";
import VendorNotifications from "./pages/vendor/Notifications.jsx";

// Admin
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminVendors from "./pages/admin/Vendors.jsx";
import VendorApproval from "./pages/admin/VendorApproval.jsx";
import AdminBuyers from "./pages/admin/Buyers.jsx";
import AdminProducts from "./pages/admin/Products.jsx";
import AdminCategories from "./pages/admin/Categories.jsx";
import AdminOrders from "./pages/admin/Orders.jsx";
import AdminOrderDetails from "./pages/admin/OrderDetails.jsx";
import AdminPayments from "./pages/admin/Payments.jsx";
import AdminRefunds from "./pages/admin/Refunds.jsx";
import AdminCommissions from "./pages/admin/Commissions.jsx";
import AdminPayouts from "./pages/admin/Payouts.jsx";
import AdminCoupons from "./pages/admin/Coupons.jsx";
import AdminReports from "./pages/admin/Reports.jsx";
import AdminSettings from "./pages/admin/Settings.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductListing />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:slug" element={<CategoryProducts />} />
          <Route path="/suppliers" element={<SupplierListing />} />
          <Route path="/suppliers/:id" element={<SupplierDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute role={ROLES.BUYER}>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute role={ROLES.BUYER}>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-confirmation/:orderId"
            element={
              <ProtectedRoute role={ROLES.BUYER}>
                <OrderConfirmation />
              </ProtectedRoute>
            }
          />
          <Route path="/vendor/apply" element={<VendorApply />} />
          <Route path="/vendor/application-submitted" element={<ApplicationSubmitted />} />
          <Route path="/privacy" element={<ComingSoon title="Privacy Policy" />} />
          <Route path="/terms" element={<ComingSoon title="Terms" />} />
          <Route path="/refund-policy" element={<ComingSoon title="Refund Policy" />} />
          <Route path="/help" element={<ComingSoon title="Help Center" />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/buyer" element={<RegisterBuyer />} />
          <Route path="/register/vendor" element={<RegisterVendor />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route
          path="/buyer"
          element={
            <ProtectedRoute role={ROLES.BUYER}>
              <BuyerLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<BuyerDashboard />} />
          <Route path="orders" element={<BuyerOrders />} />
          <Route path="orders/:id" element={<BuyerOrderDetails />} />
          <Route path="quotes" element={<BuyerQuotes />} />
          <Route path="wishlist" element={<BuyerWishlist />} />
          <Route path="suppliers" element={<BuyerSuppliers />} />
          <Route path="addresses" element={<BuyerAddresses />} />
          <Route path="business-profile" element={<BuyerBusinessProfile />} />
          <Route path="notifications" element={<BuyerNotifications />} />
          <Route path="settings" element={<BuyerSettings />} />
        </Route>

        <Route
          path="/vendor"
          element={
            <ProtectedRoute role={ROLES.VENDOR}>
              <VendorLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<VendorDashboard />} />
          <Route path="products" element={<VendorProducts />} />
          <Route path="products/new" element={<VendorProductForm />} />
          <Route path="products/:id/edit" element={<VendorProductForm />} />
          <Route path="inventory" element={<VendorInventory />} />
          <Route path="orders" element={<VendorOrders />} />
          <Route path="orders/:id" element={<VendorOrderDetails />} />
          <Route path="quotes" element={<VendorQuotes />} />
          <Route path="customers" element={<VendorCustomers />} />
          <Route path="earnings" element={<VendorEarnings />} />
          <Route path="payouts" element={<VendorPayouts />} />
          <Route path="reviews" element={<VendorReviews />} />
          <Route path="settings" element={<VendorStoreSettings />} />
          <Route path="notifications" element={<VendorNotifications />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute role={ROLES.ADMIN}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="vendors" element={<AdminVendors />} />
          <Route path="vendors/:id" element={<VendorApproval />} />
          <Route path="buyers" element={<AdminBuyers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetails />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="refunds" element={<AdminRefunds />} />
          <Route path="commissions" element={<AdminCommissions />} />
          <Route path="payouts" element={<AdminPayouts />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
