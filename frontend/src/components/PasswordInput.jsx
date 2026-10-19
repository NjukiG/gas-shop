import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

// PasswordInput — a password field with a show/hide eye toggle.
const PasswordInput = ({ id = "Password", name = "Password", value, onChange, minLength }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required
        minLength={minLength}
        className="w-full rounded-btn bg-onyx border border-graphite px-4 py-3 pr-11 text-sm text-fog placeholder-ash focus:border-platinum focus:outline-none transition-colors"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-ash hover:text-platinum transition-colors"
      >
        {visible ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  );
};
export default PasswordInput;
