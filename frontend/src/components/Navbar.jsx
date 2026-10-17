import { BsCart3 } from "react-icons/bs";
import { FaBarsStaggered } from "react-icons/fa6";
import { NavLink } from "react-router-dom";
import { useShop } from "../utils/ShopContext";
import NavLinks from "./NavLinks";

const Navbar = () => {
  const { cartItems } = useShop();

  return (
    <nav className="bg-ink border-b border-graphite">
      <div className="navbar align-element">
        <div className="navbar-start">
          {/* Brand */}
          <NavLink
            to="/"
            className="font-display text-xl font-bold tracking-tightest text-fog hover:text-platinum transition-colors"
          >
            SCENT<span className="text-platinum">CITY</span>
          </NavLink>
          {/* DROPDOWN (mobile) */}
          <div className="dropdown ml-2">
            <label tabIndex={0} className="btn btn-ghost lg:hidden text-fog">
              <FaBarsStaggered className="h-5 w-5" />
            </label>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-onyx border border-graphite rounded-box w-52"
            >
              <NavLinks />
            </ul>
          </div>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal gap-2">
            <NavLinks />
          </ul>
        </div>
        <div className="navbar-end">
          {/* CART */}
          <NavLink
            to="cart"
            className="btn btn-ghost btn-circle btn-md text-fog hover:text-platinum"
          >
            <div className="indicator">
              <BsCart3 className="h-6 w-6" />
              <span className="badge badge-sm bg-platinum text-ink border-0 indicator-item">
                {cartItems.length}
              </span>
            </div>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
