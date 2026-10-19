import { Link } from "react-router-dom";
import FeaturedProductsGrid from "./FeaturedProductsGrid";

const FeaturedProducts = () => {
  return (
    <section id="featured" className="section-block border-t border-graphite">
      <div className="flex items-end justify-between border-b border-graphite pb-5">
        <h2 className="brand-heading text-3xl">Featured fragrances</h2>
        <Link
          to="products"
          className="brand-eyebrow hover:text-platinum transition-colors whitespace-nowrap"
        >
          View all →
        </Link>
      </div>
      <FeaturedProductsGrid />
    </section>
  );
};
export default FeaturedProducts;
