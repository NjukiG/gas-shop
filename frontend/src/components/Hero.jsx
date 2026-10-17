import { Link } from "react-router-dom";

const hero1 =
  "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1740&auto=format&fit=crop";
const hero2 =
  "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1740&auto=format&fit=crop";
const hero3 =
  "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?q=80&w=1740&auto=format&fit=crop";

const carouselImages = [hero1, hero2, hero3];

const Hero = () => {
  return (
    <section
      id="home"
      className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center pt-8 pb-16 lg:pt-10 lg:pb-20 scroll-mt-28"
    >
      <div>
        <p className="brand-eyebrow mb-5">ScentCity — Modern Fragrance</p>
        <h1 className="brand-heading text-4xl sm:text-6xl leading-[1.05]">
          Smell like you
          <span className="text-platinum"> mean it.</span>
        </h1>

        <p className="mt-6 max-w-xl text-base leading-8 text-ash">
          Bold, modern fragrances for the man who shows up. Curated niche
          scents, honest notes, and no guesswork — find a signature that moves
          with you.
        </p>

        <div className="mt-10 flex items-center gap-4">
          <Link to="products" className="brand-btn">
            Shop the collection
          </Link>
          <Link to="about" className="brand-btn-outline">
            Our story
          </Link>
        </div>
      </div>

      <div className="hidden lg:carousel carousel-center h-[30rem] p-4 space-x-4 bg-onyx border border-graphite rounded-box">
        {carouselImages.map((image) => (
          <div key={image} className="carousel-item">
            <img
              src={image}
              alt="ScentCity fragrance"
              className="rounded-box h-full w-80 object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
};
export default Hero;
