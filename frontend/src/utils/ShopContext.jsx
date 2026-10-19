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
  const [cartSummary, setCartSummary] = useState({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
  });
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
        setCartSummary({
          subtotal: data.subtotal || 0,
          shipping: data.shipping || 0,
          tax: data.tax || 0,
          total: data.totalPrice || 0,
        });
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
        // Refresh cart state so the navbar badge updates immediately.
        await fetchCartDetails();
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
        // Refresh cart items + totals from the backend.
        fetchCartDetails();
      } else {
        console.error("Failed to remove item");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Set the quantity of a product already in the cart, then refresh totals.
  const updateCartItemQuantity = async (productId, quantity) => {
    try {
      const response = await fetch(
        `http://localhost:3000/protected/cart/items/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity }),
        }
      );
      if (response.ok) {
        // Refresh cart items + totals so the summary stays in sync.
        await fetchCartDetails();
      } else {
        const data = await response.json();
        console.error("Failed to update quantity:", data.error);
        toast.error(data.error || "Failed to update quantity");
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

  // Save/update shipping details (backend upserts). Returns true on success so
  // callers (e.g. checkout) can decide whether to proceed. Does NOT navigate.
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
      if (response.ok) {
        setShippingDetails(data.shippingDetails || {});
        return true;
      }
      toast.error(data.error || "Please double check your details");
      return false;
    } catch (error) {
      console.error(error);
      toast.error("Please double check your details");
      return false;
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

  // Place an order from the current cart. On success, clears local cart state
  // (the backend empties the cart) so stale items don't reappear.
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
        }
      );

      const data = await response.json();
      if (response.ok) {
        // Backend cleared the cart; mirror that in local state.
        setCartItems([]);
        setCartTotals(0);
        setCartSummary({ subtotal: 0, shipping: 0, tax: 0, total: 0 });
        toast.success(data.message || "Order placed successfully");
        navigate("/orders");
      } else {
        toast.error(data.error || "Failed to place order");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to place order");
    }
  };

  // Fetch products and categories on initial render.
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Keep the cart (and the navbar badge) in sync with auth state: load the
  // user's cart when they log in / on reload, clear it when logged out.
  useEffect(() => {
    if (user) {
      fetchCartDetails();
    } else {
      setCartItems([]);
      setCartTotals(0);
      setCartSummary({ subtotal: 0, shipping: 0, tax: 0, total: 0 });
    }
  }, [user]);

  // Value to pass to the provider
  const value = {
    categories,
    products,
    product,
    shippingDetails,
    categoryProducts,
    cartItems,
    cartTotals,
    cartSummary,
    orders,
    fetchProductById,
    fetchProductsByCategory,
    fetchCartDetails,
    addItemToCart,
    removeItemFromCart,
    updateCartItemQuantity,
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
