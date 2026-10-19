import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useShop } from "../utils/ShopContext";
import OrdersList from "../components/OrdersList";

const Orders = () => {
  const { orders, fetchOrders } = useShop();

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <section className="section-block">
      <div className="border-b border-graphite pb-5">
        <p className="brand-eyebrow mb-1">Your account</p>
        <h1 className="brand-heading text-3xl">Order history</h1>
      </div>

      {orders.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-lg text-ash">You haven&apos;t placed any orders yet.</p>
          <Link to="/products" className="brand-btn mt-6">
            Start shopping
          </Link>
        </div>
      ) : (
        <OrdersList />
      )}
    </section>
  );
};

export default Orders;
