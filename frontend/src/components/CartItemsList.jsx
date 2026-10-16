import CartItem from "./CartItem";
import { useShop } from "../utils/ShopContext";
const CartItemsList = () => {
  const { cartItems } = useShop();

  if (!cartItems || !Array.isArray(cartItems)) {
    console.error("cartItems is not an array:", cartItems);
    return null; // Or some fallback UI
  }

  return (
    <div>
      {cartItems.map((item) => {
        return <CartItem key={item.ID} cartItem={item} />;
      })}
    </div>
  );
};
export default CartItemsList;
