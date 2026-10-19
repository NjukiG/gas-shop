import { formatPrice } from "../utils/index";
import { useShop } from "../utils/ShopContext";
import QuantityStepper from "./QuantityStepper";

const CartItem = ({ cartItem }) => {
  const { removeItemFromCart, updateCartItemQuantity } = useShop();

  const { ID, Title, Price, Image, Brand } = cartItem.product;

  const handleRemoveItem = () => {
    removeItemFromCart(ID);
  };

  const handleQuantityChange = (newQty) => {
    // Persist to the backend; totals refresh from the server response.
    updateCartItemQuantity(ID, newQty);
  };

  return (
    <article className="flex flex-col gap-y-4 sm:flex-row sm:items-center flex-wrap border-b border-graphite py-6 first:pt-0 last:border-b-0">
      {/* IMAGE */}
      <img
        src={Image}
        alt={Title}
        className="h-24 w-24 rounded-box sm:h-28 sm:w-28 object-cover bg-graphite"
      />

      {/* INFO */}
      <div className="sm:ml-8 flex-1">
        <h3 className="font-display font-semibold text-fog tracking-tightest">
          {Title}
        </h3>
        <p className="brand-eyebrow mt-1">{Brand}</p>

        {/* QUANTITY + REMOVE */}
        <div className="mt-3 flex items-center gap-x-6">
          <QuantityStepper
            value={cartItem.quantity}
            onChange={handleQuantityChange}
            size="sm"
          />
          <button
            className="text-sm text-ash hover:text-platinum transition-colors"
            onClick={handleRemoveItem}
          >
            Remove
          </button>
        </div>
      </div>

      {/* PRICE */}
      <p className="font-display font-semibold text-platinum sm:ml-auto">
        {formatPrice(Price * cartItem.quantity)}
      </p>
    </article>
  );
};
export default CartItem;
