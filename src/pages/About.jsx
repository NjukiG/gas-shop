const About = () => {
  return (
    <>
      <div className="flex flex-wrap gap-2 sm:gap-x-6 items-center justify-center">
        <h1 className="text-4xl font-bold leading-none tracking-tight sm:text-6xl ">
          We love
        </h1>
        <div className="stats bg-primary shadow">
          <div className="stat">
            <div className="stat-title text-primary-content text-4xl font-bold tracking-widest">
              NjukiG
            </div>
          </div>
        </div>
        <h1 className="text-4xl font-bold leading-none tracking-tight sm:text-6xl ">
          Gas & Electricals
        </h1>
      </div>
      <p className="mt-6 text-lg leading-8 max-w-2xl mx-auto">
        Here at NjukiG Gas and Electricals, we are a one stop store for cooking
        gas products and home electrical appliances. We focus mainly on brand
        new cooking gas cylinders, gas refills, gas cylinder appliances like
        burners and second-hand electrical appliances. We have a total of three
        stores spread out across Nairobi.
      </p>
    </>
  );
};
export default About;
