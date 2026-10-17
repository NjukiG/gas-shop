import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../utils/index";
import { useShop } from "../utils/ShopContext";

const ProductsGrid = () => {
  const { products, addToCart } = useShop();

  return (
    <div className="pt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {(products || []).map((product) => {
        const { Title, Price, Image, featured, Brand, ID } = product;
        const dollarsAmount = formatPrice(Price);
        if (featured === true) {
          return (
            <Link to={`/products/${ID}`} key={ID} className="group relative">
              <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
                <img
                  alt={Image}
                  src={Image}
                  className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                />
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm ">
                    <span aria-hidden="true" className="absolute inset-0" />
                    {Title}
                  </h3>
                  <p className="mt-1 text-sm">{Brand}</p>
                </div>
                <p className="text-sm font-medium">{dollarsAmount}</p>
              </div>
            </Link>
          );
        }
      })}
    </div>
  );
};
export default ProductsGrid;
