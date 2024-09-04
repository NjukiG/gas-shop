import { useNavigate } from "react-router-dom";
import CartTotals from "../components/CartTotals";
import SectionTitle from "../components/SectionTitle";
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
    }

    if (cartItems.length === 0) {
      toast.warn("Your cart is empty");
      navigate("/");
    }

    fetchShippingDetails();
  }, [user, cartItems]);

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <SectionTitle text="Place Your Order" />
      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <CheckoutForm shippingDetails={shippingDetails} />
        <CartTotals />
      </div>
    </div>
  );
};

export default Checkout;
