import { useShop } from "../utils/ShopContext";
import OrderCard from "./OrderCard";

const OrdersList = () => {
  const { orders } = useShop();

  return (
    <div className="mt-8">
      <p className="text-sm text-ash mb-6">
        {orders.length} {orders.length === 1 ? "order" : "orders"}
      </p>
      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard key={order.ID} order={order} />
        ))}
      </div>
    </div>
  );
};

export default OrdersList;
