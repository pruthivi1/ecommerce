import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart, Store, Heart, LayoutDashboard, LogOut } from "lucide-react";
import Container from "../common/Container.jsx";
import Button from "../common/Button.jsx";
import IconButton from "../common/IconButton.jsx";
import Dropdown, { DropdownItem } from "../common/Dropdown.jsx";
import SearchBar from "./SearchBar.jsx";
import AnnouncementBar from "./AnnouncementBar.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useCart } from "../../hooks/useCart.js";
import { useWishlist } from "../../hooks/useWishlist.js";
import { ROLES } from "../../utils/constants.js";

const NAV_LINKS = [
  { label: "Categories", to: "/categories" },
  { label: "Products", to: "/products" },
  { label: "Suppliers", to: "/suppliers" },
];

const ROLE_DASHBOARD = {
  [ROLES.BUYER]: { label: "Buyer Dashboard", to: "/buyer/dashboard" },
  [ROLES.VENDOR]: { label: "Vendor Dashboard", to: "/vendor/dashboard" },
  [ROLES.ADMIN]: { label: "Admin Dashboard", to: "/admin/dashboard" },
};

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, role, user, logout } = useAuth();
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const navigate = useNavigate();

  const dashboard = ROLE_DASHBOARD[role];

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white">
      <AnnouncementBar />

      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 text-lg font-extrabold tracking-tight text-brand-800"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-800 text-white"
            aria-hidden="true"
          >
            <Store className="h-4.5 w-4.5" strokeWidth={2} />
          </span>
          MARKETBRIDGE
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-slate-100 hover:text-brand-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden max-w-md flex-1 lg:block">
          <SearchBar />
        </div>

        <div className="hidden items-center gap-1 lg:flex">
          {!isAuthenticated && (
            <Link
              to="/register/vendor"
              className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50"
            >
              Become a Supplier
            </Link>
          )}

          <IconButton icon={Heart} label="View wishlist" badge={wishlistItems.length || undefined} onClick={() => navigate("/buyer/wishlist")} />
          <IconButton icon={ShoppingCart} label="View cart" badge={itemCount || undefined} onClick={() => navigate("/cart")} />

          {isAuthenticated ? (
            <Dropdown
              trigger={() => (
                <button type="button" className="ml-1 flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-sm font-medium text-text hover:bg-slate-50">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-700 text-xs font-semibold text-white">
                    {(user?.name || "U").slice(0, 1).toUpperCase()}
                  </span>
                  {user?.name?.split(" ")[0] || "Account"}
                </button>
              )}
            >
              {dashboard && (
                <DropdownItem onClick={() => navigate(dashboard.to)}>
                  <LayoutDashboard className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                  {dashboard.label}
                </DropdownItem>
              )}
              <DropdownItem onClick={handleLogout}>
                <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                Log out
              </DropdownItem>
            </Dropdown>
          ) : (
            <>
              <Link
                to="/login"
                className="ml-1 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-slate-100"
              >
                Login
              </Link>
              <Button as={Link} to="/register" size="sm">
                Register
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <IconButton icon={ShoppingCart} label="View cart" badge={itemCount || undefined} onClick={() => navigate("/cart")} />
          <IconButton
            icon={mobileOpen ? X : Menu}
            label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          />
        </div>
      </Container>

      <div className="border-t border-border px-4 py-3 sm:px-6 lg:hidden">
        <SearchBar />
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-white lg:hidden">
          <Container className="flex flex-col gap-1 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-text hover:bg-slate-100"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/buyer/wishlist"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium text-text hover:bg-slate-100"
            >
              Wishlist {wishlistItems.length > 0 && `(${wishlistItems.length})`}
            </Link>
            {!isAuthenticated && (
              <Link
                to="/register/vendor"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
              >
                Become a Supplier
              </Link>
            )}
            {isAuthenticated ? (
              <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
                {dashboard && (
                  <Button as={Link} to={dashboard.to} size="sm" onClick={() => setMobileOpen(false)}>
                    {dashboard.label}
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Log out
                </Button>
              </div>
            ) : (
              <div className="mt-2 flex items-center gap-2 border-t border-border pt-3">
                <Button as={Link} to="/login" variant="outline" size="sm" className="flex-1" onClick={() => setMobileOpen(false)}>
                  Login
                </Button>
                <Button as={Link} to="/register" size="sm" className="flex-1" onClick={() => setMobileOpen(false)}>
                  Register
                </Button>
              </div>
            )}
          </Container>
        </div>
      )}
    </header>
  );
}
