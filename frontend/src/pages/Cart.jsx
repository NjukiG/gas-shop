import React, { useEffect, useState } from "react";
import { useAuth } from "../utils/AuthContext";
import { Link, useParams } from "react-router-dom";
import { useShop } from "../utils/ShopContext";
import { CartItemsList, CartTotals, SectionTitle } from "../components";

const Cart = () => {
  const { user } = useAuth();
  const { cartItems, fetchCartDetails } = useShop();
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  useEffect(() => {
    fetchCartDetails(user.ID);
  }, [token]);

  return (
    <>
      <SectionTitle text="Shopping Cart" />
      {cartItems.length === 0 ? (
        <>
          <SectionTitle text="Your Shopping Cart is Empty" />
          <Link to="/products">Continue Shopping?</Link>
        </>
      ) : (
        <div className="mt-8 grid gap-8  lg:grid-cols-12">
          <div className="lg:col-span-8">
            <CartItemsList />
          </div>
          <div className="lg:col-span-4 lg:pl-4">
            <CartTotals />
            {user ? (
              <Link to="/checkout" className="btn btn-primary btn-block mt-8">
                Proceed to checkout
              </Link>
            ) : (
              <Link to="/login" className="btn btn-primary btn-block mt-8">
                please login
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Cart;
