import { useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

const Login = () => {
  const loginForm = useRef(null);

  const navigate = useNavigate();
  const { user, loginUser } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [navigate, user]);

  const handleLogin = (e) => {
    e.preventDefault();
    const Email = loginForm.current.Email.value;
    const Password = loginForm.current.Password.value;
    const userInfo = { Email, Password };
    loginUser(userInfo);
  };
  return (
    <section className="">
      <div className=" lg:min-h-screen lg:grid-cols-12">
        <main className="flex items-center justify-center px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6">
          <div className="max-w-xl lg:max-w-3xl">
            <div className="flex justify-center mx-auto">
              <NavLink
                to="/"
                className="lg:flex btn btn-primary text-3xl items-center "
              >
                G
              </NavLink>
            </div>

            <form
              action="#"
              method="POST"
              ref={loginForm}
              onSubmit={handleLogin}
              className="mt-8 grid grid-cols-6 gap-6"
            >
              <div className="col-span-6">
                <label htmlFor="Email" className="block text-sm font-medium">
                  Email
                </label>

                <input
                  type="email"
                  id="Email"
                  name="email"
                  className="mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                />
              </div>

              <div className="col-span-6">
                <label
                  htmlFor="Password"
                  className="block text-sm font-medium "
                >
                  Password
                </label>

                <input
                  type="password"
                  id="Password"
                  name="password"
                  className="mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                />
              </div>

              <div className="col-span-6 sm:flex sm:items-center sm:gap-4">
                <button
                  type="submit"
                  className="inline-block shrink-0 rounded-md border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white transition hover:bg-transparent hover:text-blue-600 focus:outline-none focus:ring active:text-blue-500 dark:hover:bg-blue-700 dark:hover:text-white"
                >
                  Login
                </button>

                <p className="mt-4 text-sm ">
                  Dont have an account?
                  <a
                    href="/register"
                    className="text-gray-500 underline dark:text-gray-500"
                  >
                    Log in
                  </a>
                  .
                </p>
              </div>
            </form>
          </div>
        </main>
      </div>
    </section>
  );
};
export default Login;
