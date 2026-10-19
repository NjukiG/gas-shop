import { useEffect } from "react";
import { useAuth } from "../utils/AuthContext";
import { Link } from "react-router-dom";
import { useShop } from "../utils/ShopContext";
import { CartItemsList, CartTotals } from "../components";

const Cart = () => {
  const { user } = useAuth();
  const { cartItems, fetchCartDetails } = useShop();

  useEffect(() => {
    fetchCartDetails();
  }, []);

  return (
    <section className="section-block">
      <div className="border-b border-graphite pb-5">
        <p className="brand-eyebrow mb-1">Your bag</p>
        <h1 className="brand-heading text-3xl">Shopping cart</h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-lg text-ash">Your cart is empty.</p>
          <Link to="/products" className="brand-btn mt-6">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <CartItemsList />
          </div>
          <div className="lg:col-span-4">
            <CartTotals />
            {user ? (
              <Link to="/checkout" className="brand-btn w-full mt-6">
                Proceed to checkout
              </Link>
            ) : (
              <Link to="/login" className="brand-btn w-full mt-6">
                Please log in
              </Link>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default Cart;
