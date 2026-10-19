import { useShop } from "../utils/ShopContext";
import ProductsGrid from "./ProductsGrid";

const ProductsContainer = () => {
  const { products } = useShop();
  const totalProducts = (products || []).length;

  return (
    <section className="section-block">
      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-graphite pb-5">
        <div>
          <p className="brand-eyebrow mb-1">The collection</p>
          <h1 className="brand-heading text-3xl">All fragrances</h1>
        </div>
        <p className="text-sm text-ash whitespace-nowrap">
          {totalProducts} {totalProducts === 1 ? "scent" : "scents"}
        </p>
      </div>

      {/* PRODUCTS */}
      {totalProducts === 0 ? (
        <p className="text-lg text-ash mt-16">
          No fragrances available right now. Check back soon.
        </p>
      ) : (
        <ProductsGrid />
      )}
    </section>
  );
};

export default ProductsContainer;
