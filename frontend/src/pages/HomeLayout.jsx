import { Outlet } from "react-router-dom";
import { Navbar, Header } from "../components";
import Footer from "../components/Footer";

const HomeLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Navbar />
      <main className="align-element flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
export default HomeLayout;
