// AboutSection renders the ScentCity brand story. It is used both as an
// anchored section on the landing page (#about) and standalone on /about.
const AboutSection = () => {
  return (
    <section id="about" className="section-block border-t border-graphite">
      <div className="flex flex-wrap gap-3 sm:gap-x-6 items-center justify-center">
        <h2 className="brand-heading text-4xl sm:text-6xl">We are</h2>
        <div className="bg-platinum rounded-box px-6 py-2">
          <span className="font-display text-4xl sm:text-6xl font-bold tracking-tightest text-ink">
            ScentCity
          </span>
        </div>
      </div>

      <p className="mt-8 text-lg leading-8 max-w-2xl mx-auto text-center text-ash">
        ScentCity is a modern fragrance house for men who treat scent as part of
        how they show up. We curate bold, characterful perfumes — from fresh
        everyday signatures to deep, after-dark statements — and tell you
        exactly what is inside, so you never buy blind. No clichés, no
        guesswork. Just a scent that feels like you.
      </p>

      <div className="mt-14 grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto">
        {[
          {
            title: "Curated, not crowded",
            body: "A tight edit of fragrances worth wearing — chosen for presence, not noise.",
          },
          {
            title: "Honest notes",
            body: "Top, heart and base notes on every scent, so you know what you are getting.",
          },
          {
            title: "Built for the modern man",
            body: "Everyday confidence to evening statement — a signature for every version of you.",
          },
        ].map((item) => (
          <div key={item.title} className="brand-card p-6">
            <h3 className="brand-heading text-lg mb-2">{item.title}</h3>
            <p className="text-sm leading-7 text-ash">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
export default AboutSection;
