import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatPrice } from "../utils/index";
import { useShop } from "../utils/ShopContext";

const SingleProduct = () => {
  const { ID } = useParams();

  const { product, fetchProductById, addItemToCart } = useShop();
  console.log(product);

  useEffect(() => {
    fetchProductById(ID);
  }, [ID]);

  const [amount, setAmount] = useState(1);

  const handleAmount = (e) => {
    setAmount(parseInt(e.target.value));
  };

  const handleAddItem = () => {
    addItemToCart(product.ID, amount);
  };

  const dollarsAmount = formatPrice(product.Price * 100);

  return (
    <section className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="text-md breadcrumbs">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/products">Products</Link>
          </li>
        </ul>
      </div>
      {/* PRODUCT */}
      <div className="mt-6 grid gap-y-8 lg:grid-cols-2 lg:gap-x-16">
        {/* IMAGE */}
        <img
          src={product.Image}
          alt={product.Title}
          className="w-96 h-96 object-cover rounded-lg lg:w-full  "
        />
        {/* PRODUCT INFO */}
        <div>
          <h1 className="capitalize text-3xl font-bold">{product.Title}</h1>
          <h4 className="text-xl text-neutral-content font-bold mt-2">
            {product.Company}
          </h4>

          <p className="mt-3 text-xl">{dollarsAmount}</p>

          <p className="mt-6 leading-8">{product.description}</p>

          {/* AMOUNT */}
          <div className="form-control w-full max-w-xs">
            <label className="label">
              <h4 className="text-md font-medium tracking-wider capitalize">
                Amount
              </h4>
            </label>
            <select
              className="select select-secondary select-bordered select-md"
              value={amount}
              onChange={handleAmount}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
          </div>
          {/* CART BUTTON */}
          <div className="mt-10 ">
            <button
              className="btn btn-secondary btn-md"
              onClick={handleAddItem}
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
export default SingleProduct;
