import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { toast } from "react-toastify";
import { useShop } from "../utils/ShopContext";
import { formatPrice } from "../utils/index";

// PaymentForm renders Stripe's PaymentElement and confirms the card payment,
// then places the order (the backend verifies the payment server-side).
const PaymentForm = ({ paymentIntentId, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { makeNewOrder } = useShop();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError("");

    // Confirm the card payment with Stripe (no redirect for card payments).
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message || "Payment failed. Please try again.");
      toast.error(stripeError.message || "Payment failed");
      setProcessing(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      // Payment succeeded — place the order (backend re-verifies).
      await makeNewOrder(paymentIntentId);
    } else {
      setError("Payment could not be completed.");
      toast.error("Payment could not be completed");
    }
    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="brand-card p-8">
      <h3 className="brand-heading text-xl mb-2">Payment</h3>
      <p className="text-sm text-ash mb-6">
        Test mode — use card <span className="text-fog">4242 4242 4242 4242</span>,
        any future expiry, any CVC.
      </p>

      <PaymentElement />

      {error && (
        <div className="mt-4 rounded-btn border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="brand-btn w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? "Processing…" : `Pay ${formatPrice(amount)}`}
      </button>
    </form>
  );
};
export default PaymentForm;
