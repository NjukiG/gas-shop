import React, { useEffect, useRef } from "react";
import { useShop } from "../utils/ShopContext";

const CheckoutForm = ({ shippingDetails }) => {
  const checkoutForm = useRef(null);
  const { updateShippingDetails, makeNewOrder } = useShop();

  const handleCheckoutFormSubmit = (e) => {
    e.preventDefault();

    const Address = checkoutForm.current.Address.value;
    const City = checkoutForm.current.City.value;
    const State = checkoutForm.current.State.value;
    const PostalCode = checkoutForm.current.PostalCode.value;
    const Country = checkoutForm.current.Country.value;
    const PhoneNumber = checkoutForm.current.PhoneNumber.value;

    const shippingInfo = {
      Address,
      City,
      State,
      PostalCode,
      Country,
      PhoneNumber,
    };

    updateShippingDetails(shippingInfo);
    makeNewOrder();
  };

  return (
    <div className=" p-8 rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold mb-6 ">Shipping Information</h3>
      <form
        ref={checkoutForm}
        onSubmit={handleCheckoutFormSubmit}
        className="space-y-6"
      >
        <div>
          <label htmlFor="Address" className="block text-sm font-medium ">
            Address
          </label>
          <input
            type="text"
            id="Address"
            name="Address"
            required
            className="mt-2 w-full rounded-md text-sm text-gray-700 border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="City" className="block text-sm font-medium ">
            City
          </label>
          <input
            type="text"
            id="City"
            name="City"
            required
            className="mt-2 w-full rounded-md text-sm text-gray-700 border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="State" className="block text-sm font-medium ">
            State
          </label>
          <input
            type="text"
            id="State"
            name="State"
            required
            className="mt-2 w-full rounded-md text-sm text-gray-700 border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="PostalCode" className="block text-sm font-medium ">
            Postal Code
          </label>
          <input
            type="text"
            id="PostalCode"
            name="PostalCode"
            required
            className="mt-2 w-full rounded-md text-sm text-gray-700 border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="Country" className="block text-sm font-medium ">
            Country
          </label>
          <input
            type="text"
            id="Country"
            name="Country"
            required
            className="mt-2 w-full rounded-md text-sm text-gray-700 border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="PhoneNumber" className="block text-sm font-medium ">
            Phone Number
          </label>
          <input
            type="tel"
            id="PhoneNumber"
            name="PhoneNumber"
            required
            className="mt-2 w-full rounded-md text-sm text-gray-700 border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="text-right">
          <button
            type="submit"
            className="inline-block w-full rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Confirm & Place Order
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;
