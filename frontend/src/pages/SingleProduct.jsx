import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatPrice } from "../utils/index";
import { useShop } from "../utils/ShopContext";
import QuantityStepper from "../components/QuantityStepper";
import Loading from "../components/Loading";

const SingleProduct = () => {
  const { ID } = useParams();
  const { product, productLoading, fetchProductById, addItemToCart } = useShop();
  const [amount, setAmount] = useState(1);

  useEffect(() => {
    fetchProductById(ID);
  }, [ID]);

  const handleAddItem = () => {
    addItemToCart(product.ID, amount);
  };

  // Show the spinner while loading or before the product resolves.
  if (productLoading || !product || !product.ID) {
    return <Loading />;
  }

  return (
    <section className="section-block">
      {/* BREADCRUMBS */}
      <nav className="text-sm text-ash">
        <Link to="/" className="hover:text-platinum transition-colors">
          Home
        </Link>
        <span className="mx-2 text-graphite">/</span>
        <Link to="/products" className="hover:text-platinum transition-colors">
          Shop
        </Link>
        <span className="mx-2 text-graphite">/</span>
        <span className="text-fog">{product.Title}</span>
      </nav>

      {/* PRODUCT */}
      <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* IMAGE */}
        <div className="brand-card overflow-hidden">
          <img
            src={product.Image}
            alt={product.Title}
            className="w-full aspect-square object-cover"
          />
        </div>

        {/* INFO */}
        <div>
          <p className="brand-eyebrow mb-2">{product.Brand}</p>
          <h1 className="brand-heading text-4xl">{product.Title}</h1>

          <p className="mt-4 font-display text-2xl font-semibold text-platinum">
            {formatPrice(product.Price)}
          </p>

          {/* FRAGRANCE META */}
          {(product.size || product.concentration) && (
            <div className="mt-6 flex flex-wrap gap-3">
              {product.concentration && (
                <span className="rounded-btn border border-graphite px-3 py-1 text-xs uppercase tracking-wider text-ash">
                  {product.concentration}
                </span>
              )}
              {product.size && (
                <span className="rounded-btn border border-graphite px-3 py-1 text-xs uppercase tracking-wider text-ash">
                  {product.size}
                </span>
              )}
            </div>
          )}

          {product.description && (
            <p className="mt-6 leading-8 text-ash">{product.description}</p>
          )}

          {/* SCENT NOTES */}
          {product.scent_notes && (
            <div className="mt-6 brand-card p-5">
              <p className="brand-eyebrow mb-2">Scent notes</p>
              <p className="text-sm leading-7 text-fog">{product.scent_notes}</p>
            </div>
          )}

          {/* AMOUNT */}
          <div className="mt-8">
            <label className="brand-eyebrow block mb-2">Quantity</label>
            <QuantityStepper value={amount} onChange={setAmount} />
          </div>

          {/* ADD TO CART */}
          <button className="brand-btn mt-8" onClick={handleAddItem}>
            Add to cart · {formatPrice(product.Price * amount)}
          </button>
        </div>
      </div>
    </section>
  );
};
export default SingleProduct;
