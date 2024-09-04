import { useEffect, useRef } from "react";
import { Form, Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

const Register = () => {
  const { registerUser, user } = useAuth();
  const navigate = useNavigate();
  const registerForm = useRef(null);

  // Handle form submission
  const handleRegister = async (e) => {
    e.preventDefault();
    // Form details
    const FullName = registerForm.current.FullName.value;
    const Email = registerForm.current.Email.value;
    const Password = registerForm.current.Password.value;
    const Role = "Buyer";

    try {
      const userInfo = {
        FullName,
        Email,
        Password,
        Role,
      };
      await registerUser(userInfo);
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/cart");
    }
  }, [navigate, user]);

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
              className="mt-8 grid grid-cols-6 gap-6"
              ref={registerForm}
              onSubmit={handleRegister}
            >
              <div className="col-span-6">
                <label
                  htmlFor="FullName"
                  className="block text-sm font-medium "
                >
                  Full Name
                </label>

                <input
                  type="text"
                  id="FullName"
                  name="FullName"
                  placeholder="Enter your Full Name"
                  required
                  className="mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                />
              </div>

              <div className="col-span-6">
                <label htmlFor="Email" className="block text-sm font-medium ">
                  Email
                </label>

                <input
                  type="email"
                  id="Email"
                  name="email"
                  placeholder="Enter your Email"
                  required
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
                  placeholder="Enter your Password"
                  required
                  className="mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                />
              </div>

              {/* <div className="col-span-6">
                <label
                  htmlFor="Role"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Role
                </label>

                <input
                  type="text"
                  id="Role"
                  name="Role"
                  placeholder="Role is either Author or Admin"
                  required
                  className="mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                />
              </div> */}

              <div className="col-span-6 sm:flex sm:items-center sm:gap-4">
                <button
                  type="submit"
                  className="inline-block shrink-0 rounded-md border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white transition hover:bg-transparent hover:text-blue-600 focus:outline-none focus:ring active:text-blue-500 dark:hover:bg-blue-700 dark:hover:text-white"
                >
                  Register an account
                </button>

                <p className="mt-4 text-sm ">
                  Already have an account?
                  <a
                    href="/login"
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
export default Register;
