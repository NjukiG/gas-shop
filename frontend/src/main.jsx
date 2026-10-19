import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./utils/AuthContext.jsx";
import { ToastContainer } from "react-toastify";
import { ShopProvider } from "./utils/ShopContext.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <ShopProvider>
        <StrictMode>
          <App />
          <ToastContainer
            position="top-right"
            autoClose={2500}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            theme="dark"
          />
        </StrictMode>
      </ShopProvider>
    </AuthProvider>
  </BrowserRouter>
);
