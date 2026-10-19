import { Link } from "react-router-dom";

const Error = () => {
  return (
    <section className="section-block flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <p className="font-display text-8xl sm:text-9xl font-bold tracking-tightest text-platinum">
          404
        </p>
        <h1 className="brand-heading text-2xl sm:text-3xl mt-4">
          This page drifted away.
        </h1>
        <p className="mt-4 text-ash max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s
          get you back to the fragrances.
        </p>
        <Link to="/" className="brand-btn mt-8">
          Back to home
        </Link>
      </div>
    </section>
  );
};

export default Error;
