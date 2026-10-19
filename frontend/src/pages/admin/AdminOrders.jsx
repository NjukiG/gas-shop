import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { formatPrice } from "../../utils/index";
import { listAllOrders, updateOrderStatus } from "../../utils/adminApi";

const STATUSES = ["pending", "processed", "shipped", "delivered", "cancelled"];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await listAllOrders();
    if (res.ok) setOrders(res.data.orders || []);
    else toast.error(res.data.error || "Failed to load orders");
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleStatusChange = async (orderId, status) => {
    const res = await updateOrderStatus(orderId, status);
    if (res.ok) {
      toast.success("Order status updated");
      setOrders((prev) =>
        prev.map((o) =>
          o.ID === orderId ? { ...o, Status: res.data.order.Status } : o
        )
      );
    } else {
      toast.error(res.data.error || "Failed to update status");
    }
  };

  if (loading) {
    return <p className="text-ash">Loading orders…</p>;
  }

  return (
    <div>
      <h2 className="brand-heading text-2xl mb-6">Orders</h2>

      {orders.length === 0 ? (
        <p className="text-ash">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.ID} className="brand-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display font-semibold text-fog">
                    Order #{o.ID}
                  </p>
                  <p className="text-xs text-ash">
                    {o.User?.FullName || "Unknown"} · {o.User?.Email || ""}
                  </p>
                  <p className="text-xs text-ash">
                    {new Date(o.CreatedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    · {(o.OrderItems || []).length} line items
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`rounded-btn border px-3 py-1 text-xs uppercase tracking-wider ${
                      o.PaymentStatus === "paid"
                        ? "bg-success/15 text-success border-success/30"
                        : "bg-warning/15 text-warning border-warning/30"
                    }`}
                  >
                    {o.PaymentStatus === "paid" ? "Paid" : o.PaymentStatus}
                  </span>
                  <span className="font-display font-semibold text-platinum">
                    {formatPrice(o.TotalPrice)}
                  </span>
                </div>
              </div>

              {/* Fulfillment status control */}
              <div className="mt-4 flex items-center gap-3">
                <label className="brand-eyebrow">Fulfillment</label>
                <select
                  className="rounded-btn bg-ink border border-graphite px-3 py-2 text-sm text-fog focus:border-platinum focus:outline-none"
                  value={(o.Status || "pending").toLowerCase()}
                  onChange={(e) => handleStatusChange(o.ID, e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
