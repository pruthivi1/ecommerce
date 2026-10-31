export default function PriceDisplay({ price, unit, className = "" }) {
  return (
    <p className={`text-text ${className}`}>
      <span className="text-lg font-semibold">
        &#8377;{price.toLocaleString("en-IN")}
      </span>
      <span className="text-sm text-text-secondary"> / {unit}</span>
    </p>
  );
}
