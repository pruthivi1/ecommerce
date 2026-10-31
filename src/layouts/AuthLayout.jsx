import { Link, Outlet } from "react-router-dom";
import { Store } from "lucide-react";
import Container from "../components/common/Container.jsx";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="border-b border-border bg-white">
        <Container className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-brand-800">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-800 text-white" aria-hidden="true">
              <Store className="h-4.5 w-4.5" strokeWidth={2} />
            </span>
            MARKETBRIDGE
          </Link>
          <Link to="/" className="text-sm font-medium text-text-secondary hover:text-brand-700">
            Back to Marketplace
          </Link>
        </Container>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
