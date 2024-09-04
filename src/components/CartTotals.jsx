import { useShop } from "../utils/ShopContext";
import { formatPrice } from "../utils/index";

const CartTotals = () => {
  const { cartTotals } = useShop();
  const shipping = 150 * 100;
  const tax = 0.1 * cartTotals * 100;
  const total = (cartTotals  * 100)  + shipping + tax;

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-6 text-gray-800">
        Order Summary
      </h3>
      <div className="space-y-4">
        {/* SUBTOTAL */}
        <div className="flex justify-between items-center text-sm border-b border-gray-200 pb-2">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-900">
            {formatPrice(cartTotals)}
          </span>
        </div>

        {/* SHIPPING */}
        <div className="flex justify-between items-center text-sm border-b border-gray-200 pb-2">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium text-gray-900">
            {formatPrice(shipping)}
          </span>
        </div>

        {/* TAX */}
        <div className="flex justify-between items-center text-sm border-b border-gray-200 pb-2">
          <span className="text-gray-600">Tax</span>
          <span className="font-medium text-gray-900">{formatPrice(tax)}</span>
        </div>

        {/* TOTAL */}
        <div className="flex justify-between items-center text-lg font-bold mt-4">
          <span className="text-gray-800">Order Total</span>
          <span className="text-gray-900">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default CartTotals;
