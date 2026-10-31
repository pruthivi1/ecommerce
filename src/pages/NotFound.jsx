import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";
import Container from "../components/common/Container.jsx";
import Button from "../components/common/Button.jsx";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center gap-4 py-24 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <Compass className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <h1 className="text-2xl font-semibold text-text sm:text-3xl">Page Not Found</h1>
      <p className="max-w-md text-sm text-text-secondary sm:text-base">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Button as={Link} to="/" variant="secondary" className="mt-2">
        <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        Back to Home
      </Button>
    </Container>
  );
}
