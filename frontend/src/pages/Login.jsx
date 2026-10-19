import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import PasswordInput from "../components/PasswordInput";

const Login = () => {
  const navigate = useNavigate();
  const { user, loginUser } = useAuth();
  const [form, setForm] = useState({ Email: "", Password: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) navigate("/");
  }, [navigate, user]);

  const handleChange = (e) => {
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const result = await loginUser(form);
    if (result && !result.ok) {
      setError(result.error);
    }
  };

  return (
    <section className="section-block flex justify-center">
      <div className="w-full max-w-md">
        {/* Brand */}
        <Link
          to="/"
          className="block text-center font-display text-2xl font-bold tracking-tightest text-fog mb-2"
        >
          SCENT<span className="text-platinum">CITY</span>
        </Link>
        <p className="text-center brand-eyebrow mb-8">Welcome back</p>

        <form onSubmit={handleLogin} className="brand-card p-8 space-y-5">
          {error && (
            <div className="rounded-btn border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="Email" className="brand-eyebrow block mb-2">
              Email
            </label>
            <input
              type="email"
              id="Email"
              name="Email"
              value={form.Email}
              onChange={handleChange}
              required
              className="w-full rounded-btn bg-onyx border border-graphite px-4 py-3 text-sm text-fog placeholder-ash focus:border-platinum focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="Password" className="brand-eyebrow block mb-2">
              Password
            </label>
            <PasswordInput
              value={form.Password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="brand-btn w-full">
            Log in
          </button>

          <p className="text-center text-sm text-ash">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-platinum hover:underline">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
};
export default Login;
