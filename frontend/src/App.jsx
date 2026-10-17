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

        <Route path="*" element={<Error />} />
      </Route>
    </Routes>
  );
};
export default App;
