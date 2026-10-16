import React, { useEffect } from "react";
import { useShop } from "../utils/ShopContext";
import SectionTitle from "../components/SectionTitle";
import OrdersList from "../components/OrdersList";

const Orders = () => {
  const { orders, fetchOrders } = useShop();

  useEffect(() => {
    fetchOrders();
  }, []);

  if (orders.length === 0) {
    return <SectionTitle text="No Orders Yet" />;
  }

  return (
    <div className="container mx-auto my-8 px-4">
      <SectionTitle text="Your Orders" />
      <OrdersList />
    </div>
  );
};

export default Orders;
