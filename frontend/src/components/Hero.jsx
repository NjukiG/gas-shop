import { Link } from "react-router-dom";

const hero1 =
  "https://images.unsplash.com/photo-1596465664095-f1f622965562?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const hero2 =
  "https://www.businessdailyafrica.com/resource/image/4395466/portrait_ratio1x1/1600/1600/4970b49be7fc1b49f75fa4da196cfd70/eq/gas.jpg";
const hero3 =
  "https://images.unsplash.com/photo-1661045683387-a58b92c4ac55?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const hero4 =
  "https://images.unsplash.com/photo-1664396113489-e50bddd4a777?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const carouselImages = [hero1, hero2, hero3, hero4];
const Hero = () => {
  return (
    <div className=" grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
      <div>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight  sm:text-6xl ">
          We’re changing the way we shop for cooking gas and home appliances.
        </h1>

        <p className="mt-8 max-w-xl text-lg leading-8">
          NjukiG Gas and electrical is your one stop store for your gas refills,
          brand new gas cylinders, home electrical appliances and other gas
          related items.
        </p>
        <div className="mt-10 ">
          <Link to="products" className="btn btn-primary ">
            Our Products
          </Link>
        </div>
      </div>
      <div className="hidden  h-[28rem] lg:carousel carousel-center   p-4 space-x-4 bg-neutral rounded-box">
        {carouselImages.map((image, index) => {
          return (
            <div key={image} className="carousel-item">
              <img
                src={image}
                className="rounded-box h-full w-80  object-cover"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default Hero;
