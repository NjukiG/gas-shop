import { useShop } from "../utils/ShopContext";
import { formatPrice } from "../utils/index";

// Shipping, tax and total come from the backend (ReviewCart) so the cart
// preview always matches the final order exactly. All amounts are in cents.
const CartTotals = () => {
  const { cartSummary } = useShop();
  const { subtotal, shipping, tax, total } = cartSummary;

  return (
    <div className="brand-card p-8">
      <h3 className="brand-heading text-xl mb-6">Order summary</h3>
      <div className="space-y-4">
        {/* SUBTOTAL */}
        <div className="flex justify-between items-center text-sm border-b border-graphite pb-3">
          <span className="text-ash">Subtotal</span>
          <span className="font-medium text-fog">{formatPrice(subtotal)}</span>
        </div>

        {/* SHIPPING */}
        <div className="flex justify-between items-center text-sm border-b border-graphite pb-3">
          <span className="text-ash">Shipping</span>
          <span className="font-medium text-fog">{formatPrice(shipping)}</span>
        </div>

        {/* TAX */}
        <div className="flex justify-between items-center text-sm border-b border-graphite pb-3">
          <span className="text-ash">Tax (10%)</span>
          <span className="font-medium text-fog">{formatPrice(tax)}</span>
        </div>

        {/* TOTAL */}
        <div className="flex justify-between items-center text-lg font-bold mt-4">
          <span className="text-fog">Order total</span>
          <span className="text-platinum">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default CartTotals;
