import { useState } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { formatPrice } from "../utils/index";

// Maps order status to a badge color classes.
const statusStyles = (status) => {
  switch (status) {
    case "Delivered":
      return "bg-success/15 text-success border-success/30";
    case "Shipped":
    case "Processed":
      return "bg-info/15 text-info border-info/30";
    case "Cancelled":
      return "bg-error/15 text-error border-error/30";
    default: // Pending / pending
      return "bg-warning/15 text-warning border-warning/30";
  }
};

const OrderCard = ({ order }) => {
  const [open, setOpen] = useState(false);

  const {
    ID,
    OrderItems = [],
    Status,
    PaymentStatus,
    Subtotal,
    Shipping,
    Tax,
    TotalPrice,
    CreatedAt,
  } = order;

  const paymentStyles =
    PaymentStatus === "paid"
      ? "bg-success/15 text-success border-success/30"
      : PaymentStatus === "failed"
      ? "bg-error/15 text-error border-error/30"
      : "bg-warning/15 text-warning border-warning/30";

  const itemCount = OrderItems.reduce((sum, i) => sum + (i.Quantity || 0), 0);

  return (
    <div className="brand-card overflow-hidden">
      {/* HEADER (clickable) */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-graphite/40 transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <span className="font-display font-semibold text-fog">
            Order #{ID}
          </span>
          <span className="text-xs text-ash">
            {new Date(CreatedAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
          <span className="text-xs text-ash">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {PaymentStatus && (
            <span
              className={`hidden sm:inline-block rounded-btn border px-3 py-1 text-xs uppercase tracking-wider ${paymentStyles}`}
            >
              Payment · {PaymentStatus === "paid" ? "Paid" : PaymentStatus}
            </span>
          )}
          <span
            className={`hidden sm:inline-block rounded-btn border px-3 py-1 text-xs uppercase tracking-wider ${statusStyles(
              Status
            )}`}
          >
            Order · {Status}
          </span>
          <span className="font-display font-semibold text-platinum whitespace-nowrap">
            {formatPrice(TotalPrice)}
          </span>
          <FaChevronDown
            className={`text-ash transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* DETAILS */}
      {open && (
        <div className="border-t border-graphite p-5">
          {/* Statuses on mobile (hidden in the header on small screens) */}
          <div className="sm:hidden flex flex-wrap gap-2 mb-4">
            {PaymentStatus && (
              <span
                className={`inline-block rounded-btn border px-3 py-1 text-xs uppercase tracking-wider ${paymentStyles}`}
              >
                Payment · {PaymentStatus === "paid" ? "Paid" : PaymentStatus}
              </span>
            )}
            <span
              className={`inline-block rounded-btn border px-3 py-1 text-xs uppercase tracking-wider ${statusStyles(
                Status
              )}`}
            >
              Order · {Status}
            </span>
          </div>

          {/* LINE ITEMS */}
          <div className="space-y-4">
            {OrderItems.map((item) => (
              <div key={item.ID} className="flex items-center gap-4">
                <img
                  src={item.Product?.Image}
                  alt={item.Product?.Title}
                  className="h-14 w-14 rounded-box object-cover bg-graphite"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-fog truncate">
                    {item.Product?.Title}
                  </p>
                  <p className="text-xs text-ash">
                    {item.Product?.Brand} · Qty {item.Quantity}
                  </p>
                </div>
                <p className="text-sm text-fog whitespace-nowrap">
                  {formatPrice(item.Price * item.Quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* BREAKDOWN */}
          <div className="mt-6 border-t border-graphite pt-4 space-y-2 text-sm max-w-xs ml-auto">
            <div className="flex justify-between text-ash">
              <span>Subtotal</span>
              <span className="text-fog">{formatPrice(Subtotal)}</span>
            </div>
            <div className="flex justify-between text-ash">
              <span>Shipping</span>
              <span className="text-fog">{formatPrice(Shipping)}</span>
            </div>
            <div className="flex justify-between text-ash">
              <span>Tax</span>
              <span className="text-fog">{formatPrice(Tax)}</span>
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t border-graphite">
              <span className="text-fog">Total</span>
              <span className="text-platinum">{formatPrice(TotalPrice)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default OrderCard;
