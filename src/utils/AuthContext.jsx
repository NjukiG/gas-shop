import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  //   const url = "http://localhost:3000";

  const navigate = useNavigate();

  useEffect(() => {
    checkUserStatus();
  }, []);

  const registerUser = async (userData) => {
    try {
      const response = await fetch("http://localhost:3000/public/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log(data.Message);
      toast.success(data.Message);
    } catch (error) {
      console.error("Register user error:", error);
    }
  };

  const loginUser = async (credentials) => {
    try {
      const response = await fetch("http://localhost:3000/public/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      localStorage.setItem("token", data.token);
      await checkUserStatus();
      console.log(data);
      toast.success("Logged in successfully");
      navigate("/cart");
    } catch (error) {
      console.error(
        "Login user error:",
        error || "Please double check your credentials"
      );
      toast.error("Please double check your credentials");
    }
  };

  const logoutUser = async () => {
    localStorage.removeItem("token");
    setUser(null);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const checkUserStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await fetch("http://localhost:3000/protected/validate", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Ensure the token is included
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch");
      }

      const data = await response.json();
      setUser(data.user);
      console.log(data.user); // Handle the validated user data
    } catch (error) {
      console.error("Check user status error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ registerUser, loginUser, logoutUser, checkUserStatus, user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
