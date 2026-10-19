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

  // Register a new account. Returns true on success so the caller can redirect.
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
      if (response.ok) {
        toast.success(data.message || "Account created successfully");
        return { ok: true };
      }
      const message = data.error || "Could not create account";
      toast.error(message);
      return { ok: false, error: message };
    } catch (error) {
      console.error("Register user error:", error);
      const message = "Something went wrong. Please try again.";
      toast.error(message);
      return { ok: false, error: message };
    }
  };

  // Log in. Returns true on success so the caller can redirect.
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
      if (!response.ok) {
        const message = data.error || "Please double check your credentials";
        toast.error(message);
        return { ok: false, error: message };
      }

      localStorage.setItem("token", data.token);
      await checkUserStatus();
      toast.success("Logged in successfully");
      navigate("/");
      return { ok: true };
    } catch (error) {
      console.error("Login user error:", error);
      const message = "Please double check your credentials";
      toast.error(message);
      return { ok: false, error: message };
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
