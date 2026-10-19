import { useShop } from "../utils/ShopContext";
import ProductCard from "./ProductCard";

// FeaturedProductsGrid shows only featured products (used on the landing teaser).
const FeaturedProductsGrid = () => {
  const { products } = useShop();

  const featured = (products || []).filter((p) => p.featured === true);

  return (
    <div className="pt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {featured.map((product) => (
        <ProductCard key={product.ID} product={product} />
      ))}
    </div>
  );
};
export default FeaturedProductsGrid;
