import { Link } from "react-router-dom";

// ScentFinderTeaser is a placeholder for the upcoming AI scent-finder
// (to be powered by Amazon Bedrock). For now it links to the shop.
const ScentFinderTeaser = () => {
  return (
    <section id="find-your-scent" className="section-block border-t border-graphite">
      <div className="brand-card p-10 sm:p-14 text-center">
        <p className="brand-eyebrow mb-4">Coming soon</p>
        <h2 className="brand-heading text-3xl sm:text-5xl max-w-3xl mx-auto leading-tight">
          Not sure where to start?
          <span className="text-platinum"> Let us read your vibe.</span>
        </h2>
        <p className="mt-6 max-w-xl mx-auto text-ash leading-8">
          Tell us the mood you are after — fresh and sharp, warm and smoky,
          clean and understated — and our scent finder will point you to the
          fragrance that fits. Smarter discovery, powered by AI.
        </p>
        <div className="mt-10">
          <Link to="products" className="brand-btn">
            Browse while you wait
          </Link>
        </div>
      </div>
    </section>
  );
};
export default ScentFinderTeaser;
