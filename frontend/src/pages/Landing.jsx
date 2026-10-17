import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  FeaturedProducts,
  Hero,
  AboutSection,
  ScentFinderTeaser,
} from "../components";

const Landing = () => {
  const { hash } = useLocation();

  // When arriving with a hash (e.g. /#about from another route), smooth-scroll
  // to the target section once the page has rendered.
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [hash]);

  return (
    <>
      <Hero />
      <FeaturedProducts />
      <AboutSection />
      <ScentFinderTeaser />
    </>
  );
};
export default Landing;
