import { NavLink, Outlet } from "react-router-dom";

const adminLinks = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/orders", label: "Orders" },
];

const AdminLayout = () => {
  return (
    <section className="section-block">
      <div className="border-b border-graphite pb-5">
        <p className="brand-eyebrow mb-1">Admin</p>
        <h1 className="brand-heading text-3xl">Dashboard</h1>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        {/* SIDEBAR */}
        <aside className="lg:col-span-3">
          <nav className="flex lg:flex-col gap-2 flex-wrap">
            {adminLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `rounded-btn px-4 py-2 font-display text-sm uppercase tracking-wider transition-colors ${
                    isActive
                      ? "bg-platinum text-ink"
                      : "text-ash hover:text-fog hover:bg-graphite/50"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* CONTENT */}
        <div className="lg:col-span-9">
          <Outlet />
        </div>
      </div>
    </section>
  );
};

export default AdminLayout;
