import { Link } from "react-router-dom";
import { formatPrice } from "../utils/index";

// ProductCard — the single, reusable fragrance card used across the landing
// (featured) and the shop grid. Modern, classy, dark/platinum styling.
const ProductCard = ({ product }) => {
  const { ID, Title, Price, Image, Brand, concentration, size } = product;

  return (
    <Link
      to={`/products/${ID}`}
      className="group brand-card overflow-hidden transition-all duration-300 hover:border-platinum/60 hover:-translate-y-1"
    >
      {/* IMAGE */}
      <div className="aspect-square w-full overflow-hidden bg-graphite">
        <img
          alt={Title}
          src={Image}
          loading="lazy"
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* DETAILS */}
      <div className="p-5">
        <p className="brand-eyebrow mb-1">{Brand}</p>
        <h3 className="font-display text-lg font-semibold tracking-tightest text-fog">
          {Title}
        </h3>

        {(concentration || size) && (
          <p className="mt-1 text-xs text-ash">
            {[concentration, size].filter(Boolean).join(" · ")}
          </p>
        )}

        <p className="mt-4 font-display text-base font-semibold text-platinum">
          {formatPrice(Price)}
        </p>
      </div>
    </Link>
  );
};
export default ProductCard;
