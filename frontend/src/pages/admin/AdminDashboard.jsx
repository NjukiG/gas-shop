import { useEffect, useState } from "react";
import { useShop } from "../../utils/ShopContext";
import { listAllOrders } from "../../utils/adminApi";
import { formatPrice } from "../../utils/index";

const StatCard = ({ label, value }) => (
  <div className="brand-card p-6">
    <p className="brand-eyebrow mb-2">{label}</p>
    <p className="font-display text-3xl font-bold text-fog">{value}</p>
  </div>
);

const AdminDashboard = () => {
  const { products, categories } = useShop();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    listAllOrders().then((res) => {
      if (res.ok) setOrders(res.data.orders || []);
    });
  }, []);

  const revenue = orders
    .filter((o) => o.PaymentStatus === "paid")
    .reduce((sum, o) => sum + (o.TotalPrice || 0), 0);

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Products" value={products?.length ?? 0} />
        <StatCard label="Categories" value={categories?.length ?? 0} />
        <StatCard label="Orders" value={orders.length} />
        <StatCard label="Revenue (paid)" value={formatPrice(revenue)} />
      </div>

      <p className="mt-8 text-sm text-ash">
        Use the menu to manage products, categories and orders.
      </p>
    </div>
  );
};

export default AdminDashboard;
