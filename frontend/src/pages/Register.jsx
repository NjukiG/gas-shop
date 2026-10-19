import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import PasswordInput from "../components/PasswordInput";

const Register = () => {
  const { registerUser, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ FullName: "", Email: "", Password: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) navigate("/");
  }, [navigate, user]);

  const handleChange = (e) => {
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Quick client-side check for instant feedback (backend also enforces it).
    if (form.Password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    const result = await registerUser(form);
    if (result.ok) {
      // Registration does not log the user in; send them to sign in.
      navigate("/login");
    } else {
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
        <p className="text-center brand-eyebrow mb-8">Create your account</p>

        <form onSubmit={handleRegister} className="brand-card p-8 space-y-5">
          {error && (
            <div className="rounded-btn border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="FullName" className="brand-eyebrow block mb-2">
              Full name
            </label>
            <input
              type="text"
              id="FullName"
              name="FullName"
              value={form.FullName}
              onChange={handleChange}
              required
              className="w-full rounded-btn bg-onyx border border-graphite px-4 py-3 text-sm text-fog placeholder-ash focus:border-platinum focus:outline-none transition-colors"
            />
          </div>

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
              minLength={8}
            />
            <p className="mt-2 text-xs text-ash">At least 8 characters.</p>
          </div>

          <button type="submit" className="brand-btn w-full">
            Create account
          </button>

          <p className="text-center text-sm text-ash">
            Already have an account?{" "}
            <Link to="/login" className="text-platinum hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
};
export default Register;
