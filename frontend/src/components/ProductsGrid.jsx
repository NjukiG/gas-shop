import { useShop } from "../utils/ShopContext";
import ProductCard from "./ProductCard";

// ProductsGrid shows the full catalog (used on the Shop page).
const ProductsGrid = () => {
  const { products } = useShop();

  return (
    <div className="pt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {(products || []).map((product) => (
        <ProductCard key={product.ID} product={product} />
      ))}
    </div>
  );
};
export default ProductsGrid;
