import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CartTotals from "../components/CartTotals";
import CheckoutForm from "../components/CheckoutForm";
import StripeCheckout from "../components/StripeCheckout";
import { useAuth } from "../utils/AuthContext";
import { useShop } from "../utils/ShopContext";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cartItems,
    cartSummary,
    fetchShippingDetails,
    shippingDetails,
    createPaymentIntent,
  } = useShop();

  const [step, setStep] = useState("shipping"); // "shipping" | "payment"
  const [payment, setPayment] = useState(null); // { clientSecret, paymentIntentId, amount }

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

  // After shipping is saved, create the payment intent and move to payment.
  const handleShippingReady = async () => {
    const intent = await createPaymentIntent();
    if (intent) {
      setPayment(intent);
      setStep("payment");
    }
  };

  return (
    <section className="section-block">
      <div className="border-b border-graphite pb-5">
        <p className="brand-eyebrow mb-1">Almost there</p>
        <h1 className="brand-heading text-3xl">Checkout</h1>
      </div>

      {/* Step indicator */}
      <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-wider">
        <span className={step === "shipping" ? "text-platinum" : "text-ash"}>
          1. Shipping
        </span>
        <span className="text-graphite">—</span>
        <span className={step === "payment" ? "text-platinum" : "text-ash"}>
          2. Payment
        </span>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7">
          {step === "shipping" ? (
            <CheckoutForm
              shippingDetails={shippingDetails}
              onReady={handleShippingReady}
            />
          ) : (
            <StripeCheckout
              clientSecret={payment?.clientSecret}
              paymentIntentId={payment?.paymentIntentId}
              amount={payment?.amount ?? cartSummary.total}
            />
          )}

          {step === "payment" && (
            <button
              onClick={() => setStep("shipping")}
              className="mt-4 text-sm text-ash hover:text-platinum transition-colors"
            >
              ← Edit shipping details
            </button>
          )}
        </div>

        <div className="lg:col-span-5">
          <CartTotals />
        </div>
      </div>
    </section>
  );
};

export default Checkout;
