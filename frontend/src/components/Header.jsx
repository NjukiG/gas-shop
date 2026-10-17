import { Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

const Header = () => {
  const { user, logoutUser } = useAuth();

  const handleLogout = (e) => {
    e.preventDefault();
    logoutUser();
  };

  return (
    <header className="bg-onyx border-b border-graphite py-2 text-fog">
      <div className="align-element flex justify-center sm:justify-end">
        <div className="flex gap-x-6 justify-center items-center">
          {user ? (
            <div className="flex gap-x-4 sm:gap-x-6 items-center">
              <p className="text-xs sm:text-sm text-ash">
                Welcome back, <span className="text-fog">{user.FullName}</span>
              </p>
              <button
                className="brand-eyebrow hover:text-platinum transition-colors"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="brand-eyebrow hover:text-platinum transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="brand-eyebrow hover:text-platinum transition-colors"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
export default Header;
