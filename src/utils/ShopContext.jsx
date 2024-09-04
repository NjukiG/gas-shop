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
      setProducts(data.Products);
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
      setProduct(data.Product);
      console.log(data.Product);
    } catch (error) {
      console.error(`Failed to fetch product with ID ${productId}:`, error);
    }
  };
  // Function to fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:3000/public/categories");
      const data = await response.json();
      setCategories(data.Categories);
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
      setCategoryProducts(data);
    } catch (error) {
      console.error(
        `Failed to fetch products for category with ID ${categoryId}:`,
        error
      );
    }
  };

  // Fetch cart by ID
  const fetchCartDetails = async (cartId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/protected/cart/${cartId}/review`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (data && Array.isArray(data.CartItems)) {
        setCartItems(data.CartItems); // Correctly set the cart items
        setCartTotals(data.TotalPrice); // Assuming you have a state for total price
        console.log(data.CartItems);
      } else {
        console.error("Expected an array but got:", data);
      }
    } catch (error) {
      console.error(`Failed to fetch product with ID ${cartId}:`, error);
    }
  };

  // function to add items to cart
  const addItemToCart = async (productId, quantity) => {
    try {
      const response = await fetch(
        `http://localhost:3000/protected/cart/${user.ID}/items`,
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
        // Update cart in context
        setCartItems(data["CartItem"]);
        console.log(data);
        toast.success("Item added to cart");
        navigate("/products");
      } else {
        console.error("Failed to add item:", data.Error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Function to remove an item from the cart
  const removeItemFromCart = async (productId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/protected/cart/${user.ID}/items/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        // Update cart in context
        const updatedCart = cartItems.filter(
          (item) => item.productId !== productId
        );
        setCartItems(updatedCart);
        console.log("Removed item", updatedCart);
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
      console.log(data.ShippingDetails);
      setShippingDetails(data.ShippingDetails);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
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
      console.log(data);
      setShippingDetails(data);
      toast.success("Shiiping details updated");
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
        `http://localhost:3000/protected/cart/${user.ID}/orders`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setOrders(data.Orders);
      console.log(data.Orders);
    } catch (error) {
      console.error(`Failed to fetch product with ID ${cartId}:`, error);
    }
  };

  // Update Shipping details
  const makeNewOrder = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/protected/cart/${user.ID}/orders`,
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
      console.log(data.Order);
      // setOrders(data.Order);
      toast.success(data.Message);
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
