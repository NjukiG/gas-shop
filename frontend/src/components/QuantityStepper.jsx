import { FaMinus, FaPlus } from "react-icons/fa6";

// QuantityStepper — a reusable +/- control.
// Props:
//   value      current quantity (number)
//   onChange   called with the new quantity
//   min        minimum allowed (default 1)
//   size       "sm" for compact (cart) or default (product page)
const QuantityStepper = ({ value, onChange, min = 1, size = "md" }) => {
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(value + 1);

  const btn =
    size === "sm"
      ? "h-7 w-7 text-xs"
      : "h-10 w-10 text-sm";
  const box = size === "sm" ? "h-7 min-w-[2rem] text-sm" : "h-10 min-w-[3rem]";

  return (
    <div className="inline-flex items-center rounded-btn border border-graphite overflow-hidden">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={decrement}
        disabled={value <= min}
        className={`${btn} flex items-center justify-center text-fog hover:bg-graphite disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}
      >
        <FaMinus />
      </button>
      <span
        className={`${box} flex items-center justify-center font-display font-semibold text-fog border-x border-graphite`}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={increment}
        className={`${btn} flex items-center justify-center text-fog hover:bg-graphite transition-colors`}
      >
        <FaPlus />
      </button>
    </div>
  );
};
export default QuantityStepper;
