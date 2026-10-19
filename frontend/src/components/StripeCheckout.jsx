import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "./PaymentForm";

// Load Stripe once, outside the component, with the publishable key.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Dark appearance so Stripe Elements match the ScentCity theme.
const appearance = {
  theme: "night",
  variables: {
    colorPrimary: "#B8BCC4", // platinum
    colorBackground: "#15171C", // onyx
    colorText: "#E8EAED", // fog
    colorDanger: "#C97A7A",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    borderRadius: "6px",
  },
};

// StripeCheckout wraps the PaymentForm with the Elements provider, supplying
// the clientSecret from the backend-created PaymentIntent.
const StripeCheckout = ({ clientSecret, paymentIntentId, amount }) => {
  if (!clientSecret) return null;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
      <PaymentForm paymentIntentId={paymentIntentId} amount={amount} />
    </Elements>
  );
};
export default StripeCheckout;
