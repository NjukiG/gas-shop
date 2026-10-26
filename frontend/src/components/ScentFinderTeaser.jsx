import { useState } from "react";
import { API_URL } from "../utils/apiConfig";

// AI scent finder: the customer describes what they want and Amazon Bedrock
// recommends fragrances from our actual catalog.
const ScentFinderTeaser = () => {
  const [preferences, setPreferences] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const examples = [
    "Fresh and citrusy for the office",
    "Warm, smoky and bold for date night",
    "Clean and understated, everyday wear",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!preferences.trim()) return;

    setLoading(true);
    setError("");
    setRecommendation("");

    try {
      const res = await fetch(`${API_URL}/public/scent-finder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: preferences.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setRecommendation(data.recommendation);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("The scent finder is unavailable right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="find-your-scent"
      className="section-block border-t border-graphite"
    >
      <div className="brand-card p-8 sm:p-12">
        <div className="text-center">
          <p className="brand-eyebrow mb-4">AI scent finder</p>
          <h2 className="brand-heading text-3xl sm:text-5xl max-w-3xl mx-auto leading-tight">
            Not sure where to start?
            <span className="text-platinum"> Describe your vibe.</span>
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-ash leading-8">
            Tell us the mood you're after and our AI will match you with
            fragrances from our collection.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 max-w-2xl mx-auto">
          <textarea
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="e.g. something warm and woody for evenings out…"
            className="w-full rounded-btn bg-ink border border-graphite px-4 py-3 text-sm text-fog placeholder-ash focus:border-platinum focus:outline-none transition-colors resize-none"
          />

          {/* Example chips */}
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            {examples.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setPreferences(ex)}
                className="rounded-btn border border-graphite px-3 py-1 text-xs text-ash hover:border-platinum hover:text-platinum transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button
              type="submit"
              disabled={loading || !preferences.trim()}
              className="brand-btn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Finding your scent…" : "Find my scent"}
            </button>
          </div>
        </form>

        {/* Results */}
        {error && (
          <div className="mt-6 max-w-2xl mx-auto rounded-btn border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        {recommendation && (
          <div className="mt-8 max-w-2xl mx-auto brand-card p-6 border-platinum/40">
            <p className="brand-eyebrow mb-3">Our recommendation</p>
            <div className="text-sm leading-7 text-fog whitespace-pre-line">
              {recommendation}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
export default ScentFinderTeaser;
