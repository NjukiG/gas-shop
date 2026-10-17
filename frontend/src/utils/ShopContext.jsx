import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Create the ShopContext
const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for products, categories, cart, etc.
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState({});
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotals, setCartTotals] = useState(0);
  const [shippingDetails, setShippingDetails] = useState({});
  const [orders, setOrders] = useState([]);
  // console.log(user);

  // const cartId = user.ID;

  const token = localStorage.getItem("token");

  // Function to fetch products
  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:3000/public/products");
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  // Fetch product by ID
  const fetchProductById = async (productId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/public/products/${productId}`
      );
      const data = await response.json();
      setProduct(data.product || {});
    } catch (error) {
      console.error(`Failed to fetch product with ID ${productId}:`, error);
    }
  };
  // Function to fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:3000/public/categories");
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  // Fetch products by category ID
  const fetchProductsByCategory = async (categoryId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/public/categories/${categoryId}/products`
      );
      const data = await response.json();
      setCategoryProducts(data.products || []);
    } catch (error) {
      console.error(
        `Failed to fetch products for category with ID ${categoryId}:`,
        error
      );
    }
  };

  // Fetch the authenticated user's cart (cart is derived from the auth token
  // on the server, so no id is needed in the URL).
  const fetchCartDetails = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/protected/cart/review`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (data && Array.isArray(data.cartItems)) {
        setCartItems(data.cartItems);
        setCartTotals(data.totalPrice);
      } else {
        console.error("Expected an array but got:", data);
      }
    } catch (error) {
      console.error("Failed to fetch cart details:", error);
    }
  };

  // Add an item to the authenticated user's cart.
  const addItemToCart = async (productId, quantity) => {
    try {
      const response = await fetch(
        `http://localhost:3000/protected/cart/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId, quantity }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success("Item added to cart");
        navigate("/products");
      } else {
        console.error("Failed to add item:", data.error);
        toast.error(data.error || "Failed to add item to cart");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Remove an item from the authenticated user's cart.
  const removeItemFromCart = async (productId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/protected/cart/items/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const updatedCart = cartItems.filter(
          (item) => item.ProductID !== productId
        );
        setCartItems(updatedCart);
        toast.error("Item removed from your cart");
        navigate("/products");
      } else {
        console.error("Failed to remove item");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Function to clear the cart
  // const clearCart = async () => {
  //   try {
  //     const response = await fetch(
  //       `http://localhost:3000/protected/cart/${user.ID}/clear`,
  //       {
  //         method: "DELETE",
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     if (response.ok) {
  //       // Clear cart in context
  //       setCartItems([]);
  //       console.log("Cart cleared ", cartItems);
  //     } else {
  //       console.error("Failed to clear cart");
  //     }
  //   } catch (error) {
  //     console.error("Error:", error);
  //   }
  // };

  // Fetch Shipping details
  const fetchShippingDetails = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/protected/shipping-details",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setShippingDetails(data.shippingDetails || {});
    } catch (error) {
      console.error("Failed to fetch shipping details:", error);
    }
  };

  // Update Shipping details
  const updateShippingDetails = async (details) => {
    try {
      const response = await fetch(
        "http://localhost:3000/protected/shipping-details",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(details),
        }
      );

      const data = await response.json();
      setShippingDetails(data.shippingDetails || {});
      toast.success("Shipping details updated");
      navigate("/checkout");
    } catch (error) {
      console.error(error);
      toast.error("Please double check your details");
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/protected/orders`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  // Make and order
  const makeNewOrder = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/protected/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(),
        }
      );

      const data = await response.json();
      toast.success(data.message || "Order placed successfully");
      navigate("/orders");
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch products and categories on initial render
  useEffect(() => {
    // if (!token) throw new Error("No token found");
    fetchProducts();
    fetchCategories();
    // fetchShippingDetails();
  }, []);

  // Value to pass to the provider
  const value = {
    categories,
    products,
    product,
    shippingDetails,
    categoryProducts,
    cartItems,
    cartTotals,
    orders,
    fetchProductById,
    fetchProductsByCategory,
    fetchCartDetails,
    addItemToCart,
    removeItemFromCart,
    // clearCart,
    fetchShippingDetails,
    updateShippingDetails,
    fetchOrders,
    makeNewOrder,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

// Custom hook for using the ShopContext
export const useShop = () => {
  return useContext(ShopContext);
};
