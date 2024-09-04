import { Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

const Header = () => {
  const { user, logoutUser } = useAuth();

  const handleLogout = (e) => {
    e.preventDefault();
    logoutUser();
  };

  return (
    <header className=" bg-neutral py-2 text-neutral-content ">
      <div className="align-element flex justify-center sm:justify-end ">
        {/* USER */}
        {/* LINKS */}
        <div className="flex gap-x-6 justify-center items-center">
          {user ? (
            <div className="flex gap-x-2 sm:gap-x-8 items-center">
              <p className="text-xs sm:text-sm">Hello, {user.FullName}</p>
              <button
                className="btn btn-xs btn-outline btn-primary "
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="link link-hover text-xs sm:text-sm">
                Sign in
              </Link>
              <Link
                to="/register"
                className="link link-hover text-xs sm:text-sm"
              >
                Create an Account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
export default Header;
