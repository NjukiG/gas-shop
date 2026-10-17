import { useState } from "react";
import { formatPrice, generateAmountOptions } from "../utils/index";
import { useShop } from "../utils/ShopContext";
const CartItem = ({ cartItem }) => {
  const { removeItemFromCart } = useShop();
  const [amount, setAmount] = useState(cartItem.quantity);

  const { ID, Title, Price, Image, Brand, Shipping, description, featured } =
    cartItem.product;

  const handleRemoveItem = () => {
    removeItemFromCart(ID);
  };

  const handleAmount = (e) => {
    setAmount(parseInt(e.target.value));
  };

  return (
    <article
      key={ID}
      className="mb-12 flex flex-col gap-y-4 sm:flex-row flex-wrap border-b border-base-300 pb-6 last:border-b-0"
    >
      {/* IMAGE */}
      <img
        src={Image}
        alt={Title}
        className="h-24 w-24 rounded-lg sm:h-32 sm:w-32 object-cover"
      />
      {/* INFO */}
      <div className="sm:ml-16 sm:w-48">
        {/* TITLE */}
        <h3 className="capitalize font-medium">{Title}</h3>
        {/* BRAND */}
        <h4 className="mt-2 capitalize text-sm">{Brand}</h4>
      </div>
      <div className="sm:ml-12">
        {/* AMOUNT */}
        <div className="form-control max-w-xs">
          <label htmlFor="amount" className="label p-0">
            <span className="label-text">{cartItem.quantity}</span>
          </label>
          <select
            name="amount"
            id="amount"
            className="mt-2 select select-base select-bordered select-xs"
            value={cartItem.quantity}
            onChange={handleAmount}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>{" "}
          </select>
        </div>
        {/* REMOVE */}
        <button
          className="mt-2 link link-primary link-hover text-sm"
          onClick={handleRemoveItem}
        >
          Remove
        </button>
      </div>

      {/* PRICE */}
      <p className="font-medium sm:ml-auto">
        {formatPrice(Price * cartItem.quantity)}
      </p>
    </article>
  );
};
export default CartItem;
