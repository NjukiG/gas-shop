import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

// Links come in two kinds:
//  - hash links (home sections) that smooth-scroll to a section on "/"
//  - route links (real pages) that navigate normally
const links = [
  { id: 1, to: "/#home", text: "home", hash: "#home" },
  { id: 2, to: "/#about", text: "about", hash: "#about" },
  { id: 3, to: "/products", text: "shop" },
  { id: 4, to: "/cart", text: "cart" },
  { id: 5, to: "/orders", text: "orders" },
];

const linkClass = (active) =>
  `font-display text-sm uppercase tracking-wider transition-colors ${
    active ? "text-platinum" : "text-ash hover:text-fog"
  }`;

const NavLinks = () => {
  const { pathname, hash } = useLocation();
  const { user } = useAuth();

  // Admins get an extra link to the admin area.
  const allLinks =
    user && user.Role === "Admin"
      ? [...links, { id: 6, to: "/admin", text: "admin" }]
      : links;

  const handleHashClick = (targetHash) => (e) => {
    // If already on the home page, scroll directly without a full navigation.
    if (pathname === "/") {
      const el = document.querySelector(targetHash);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth" });
        window.history.replaceState(null, "", `/${targetHash}`);
      }
    }
    // Otherwise let the Link navigate to "/<hash>"; Landing handles the scroll.
  };

  return (
    <>
      {allLinks.map((link) => {
        const { id, to, text, hash: linkHash } = link;

        if (linkHash) {
          const active = pathname === "/" && hash === linkHash;
          return (
            <li key={id}>
              <Link
                to={to}
                onClick={handleHashClick(linkHash)}
                className={linkClass(active)}
              >
                {text}
              </Link>
            </li>
          );
        }

        return (
          <li key={id}>
            <NavLink to={to} className={({ isActive }) => linkClass(isActive)}>
              {text}
            </NavLink>
          </li>
        );
      })}
    </>
  );
};
export default NavLinks;
