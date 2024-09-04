import React, { useEffect } from "react";
import { useShop } from "../utils/ShopContext";
import { formatPrice } from "../utils/index";

const OrdersList = () => {
  const { orders, fetchShippingDetails, shippingDetails } = useShop();

  useEffect(() => {
    fetchShippingDetails();
  }, []);

  return (
    <div className="mt-8">
      <h4 className="text-lg font-semibold  mb-6">
        Total Orders: {orders.length}
      </h4>
      <div className="overflow-x-auto shadow rounded-lg">
        <table className="min-w-full  rounded-lg">
          <thead>
            <tr className="w-full bg-gray-200 text-gray-700 text-left text-sm leading-normal">
              <th className="py-3 px-6">Ordered Items</th>
              <th className="py-3 px-6">Address</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6">Cost</th>
              <th className="py-3 px-6 hidden sm:table-cell">Date Ordered</th>
            </tr>
          </thead>
          <tbody className=" text-sm font-light">
            {orders.map((order) => {
              const id = order.ID;
              const { OrderItems, Address, Status, TotalPrice, CreatedAt } = order;
              const { City } = shippingDetails;
              const formattedPrice = formatPrice(TotalPrice * 100);

              return (
                <tr key={id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-6">{OrderItems.length}</td>
                  <td className="py-3 px-6">{City}</td>
                  <td className="py-3 px-6">
                    <span
                      className={`${
                        Status === "Delivered"
                          ? "text-green-600"
                          : Status === "Pending"
                          ? "text-yellow-600"
                          : "text-red-600"
                      } font-medium`}
                    >
                      {Status}
                    </span>
                  </td>
                  <td className="py-3 px-6">{formattedPrice}</td>
                  <td className="py-3 px-6 hidden sm:table-cell">
                    {new Date(CreatedAt).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersList;
