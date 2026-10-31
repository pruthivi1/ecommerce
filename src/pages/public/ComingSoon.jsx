import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import Container from "../../components/common/Container.jsx";
import Breadcrumb from "../../components/common/Breadcrumb.jsx";
import Button from "../../components/common/Button.jsx";

export default function ComingSoon({ title }) {
  return (
    <Container className="flex flex-col items-center gap-4 py-20 text-center">
      <Breadcrumb items={[{ label: "Home", to: "/" }, { label: title }]} className="self-start" />
      <span className="mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <Clock className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <h1 className="text-2xl font-semibold text-text sm:text-3xl">{title}</h1>
      <p className="max-w-md text-sm text-text-secondary sm:text-base">
        Information will be available here soon.
      </p>
      <Button as={Link} to="/" variant="secondary" className="mt-2">
        Back to Home
      </Button>
    </Container>
  );
}
