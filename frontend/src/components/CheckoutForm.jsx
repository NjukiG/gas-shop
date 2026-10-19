import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useShop } from "../utils/ShopContext";

const emptyForm = {
  Address: "",
  City: "",
  State: "",
  PostalCode: "",
  Country: "",
  PhoneNumber: "",
};

const fields = [
  { name: "Address", label: "Address", type: "text", full: true },
  { name: "City", label: "City", type: "text" },
  { name: "State", label: "State / County", type: "text" },
  { name: "PostalCode", label: "Postal code", type: "text" },
  { name: "Country", label: "Country", type: "text" },
  { name: "PhoneNumber", label: "Phone number", type: "tel", full: true },
];

// CheckoutForm collects/saves shipping details. On successful save it calls
// onReady() so the parent can advance to the payment step.
const CheckoutForm = ({ shippingDetails, onReady }) => {
  const { updateShippingDetails } = useShop();
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (shippingDetails && shippingDetails.Address) {
      setForm({
        Address: shippingDetails.Address || "",
        City: shippingDetails.City || "",
        State: shippingDetails.State || "",
        PostalCode: shippingDetails.PostalCode || "",
        Country: shippingDetails.Country || "",
        PhoneNumber: shippingDetails.PhoneNumber || "",
      });
    }
  }, [shippingDetails]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, (v || "").trim()])
    );
    const missing = fields.filter((f) => !trimmed[f.name]);
    if (missing.length > 0) {
      toast.error(
        `Please complete all shipping fields: ${missing
          .map((f) => f.label)
          .join(", ")}`
      );
      return;
    }
    if (!/\d/.test(trimmed.PhoneNumber)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setSubmitting(true);
    const saved = await updateShippingDetails(trimmed);
    setSubmitting(false);
    if (saved) {
      onReady();
    }
  };

  return (
    <div className="brand-card p-8">
      <h3 className="brand-heading text-xl mb-6">Shipping information</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {fields.map((field) => (
          <div key={field.name} className={field.full ? "sm:col-span-2" : ""}>
            <label htmlFor={field.name} className="brand-eyebrow block mb-2">
              {field.label}
            </label>
            <input
              type={field.type}
              id={field.name}
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              required
              className="w-full rounded-btn bg-onyx border border-graphite px-4 py-3 text-sm text-fog placeholder-ash focus:border-platinum focus:outline-none transition-colors"
            />
          </div>
        ))}

        <div className="sm:col-span-2 mt-2">
          <button
            type="submit"
            disabled={submitting}
            className="brand-btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving…" : "Continue to payment"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;
