import axios from "axios";

const productionUrl = "http://localhost:3000";

export const customFetch = axios.create({
  baseURL: productionUrl,
});

export const formatPrice = (price) => {
  const shillingsAmount = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format((price / 100).toFixed(2));
  return shillingsAmount;
};

export const generateAmountOptions = (number) => {
  return Array.from({ length: number }, (_, index) => {
    const amount = index + 1;

    return (
      <option key={amount} value={amount}>
        {amount}
      </option>
    );
  });
};

////////////////////
