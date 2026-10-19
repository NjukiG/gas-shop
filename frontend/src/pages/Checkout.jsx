import { useNavigate } from "react-router-dom";
import CartTotals from "../components/CartTotals";
import { useAuth } from "../utils/AuthContext";
import { useShop } from "../utils/ShopContext";
import CheckoutForm from "../components/CheckoutForm";
import { useEffect } from "react";
import { toast } from "react-toastify";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, fetchShippingDetails, shippingDetails } = useShop();

  useEffect(() => {
    if (!user) {
      toast.warn("You must be logged in to checkout");
      navigate("/login");
      return;
    }
    if (cartItems.length === 0) {
      toast.warn("Your cart is empty");
      navigate("/");
      return;
    }
    fetchShippingDetails();
  }, [user, cartItems]);

  return (
    <section className="section-block">
      <div className="border-b border-graphite pb-5">
        <p className="brand-eyebrow mb-1">Almost there</p>
        <h1 className="brand-heading text-3xl">Checkout</h1>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7">
          <CheckoutForm shippingDetails={shippingDetails} />
        </div>
        <div className="lg:col-span-5">
          <CartTotals />
        </div>
      </div>
    </section>
  );
};

export default Checkout;
