import { useShop } from "../utils/ShopContext";
import ProductsGrid from "./ProductsGrid";
import Loading from "./Loading";

const ProductsContainer = () => {
  const { products, productsLoading } = useShop();
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
          {productsLoading
            ? "Loading…"
            : `${totalProducts} ${totalProducts === 1 ? "scent" : "scents"}`}
        </p>
      </div>

      {/* PRODUCTS */}
      {productsLoading ? (
        <Loading />
      ) : totalProducts === 0 ? (
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
