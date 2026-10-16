import { Outlet, useNavigate } from "react-router-dom";
import { Navbar, Loading, Header } from "../components";
const HomeLayout = () => {
  const navigation = useNavigate();
  const isPageLoading = navigation.state === "loading";
  return (
    <>
      <Header />
      <Navbar />
      {isPageLoading ? (
        <Loading />
      ) : (
        <section className="align-element py-5">
          <Outlet />
        </section>
      )}
    </>
  );
};
export default HomeLayout;
