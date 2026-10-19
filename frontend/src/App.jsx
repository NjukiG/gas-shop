import {
  HomeLayout,
  Landing,
  Error,
  Products,
  SingleProduct,
  Cart,
  About,
  Register,
  Login,
  Checkout,
  Orders,
} from "./pages";
import { Route, Routes } from "react-router-dom";
import PrivateRoutes from "./utils/PrivateRoutes";
import AdminRoute from "./utils/AdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";

const App = () => {
  return (
    <Routes>
      {/* All pages render inside HomeLayout via its <Outlet /> */}
      <Route path="/" element={<HomeLayout />}>
        <Route index element={<Landing />} />
        <Route path="about" element={<About />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:ID" element={<SingleProduct />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Private routes */}
        <Route element={<PrivateRoutes />}>
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders" element={<Orders />} />
        </Route>

        {/* Admin routes (admin-only) */}
        <Route element={<AdminRoute />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
          </Route>
        </Route>

        <Route path="*" element={<Error />} />
      </Route>
    </Routes>
  );
};
export default App;
