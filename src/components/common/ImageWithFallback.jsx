import { useState } from "react";
import { ImageOff } from "lucide-react";

export default function ImageWithFallback({ src, alt, className = "", ...rest }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-brand-50 text-brand-300 ${className}`}
        role="img"
        aria-label={alt}
      >
        <ImageOff className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}
