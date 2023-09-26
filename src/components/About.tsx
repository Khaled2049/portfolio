const About = () => {
  return (
    <section className="text-primary ">
      <div className="container mx-auto flex flex-col items-center px-4 py-16 text-center md:py-32 md:px-10 lg:px-32 xl:max-w-3xl ">
        <h1 className="text-4xl font-rubik leading-none">
          200: Cloudy with a Chance of No Downtime!
        </h1>
        <p className="mt-8 mb-12 font-roboto text-secondary text-lg">
          Hi there! I'm Khaled, your friendly neighborhood Cloud Whisperer. 🌥️ I
          tinker with AWS clouds, making sure they stay fluffy, reliable, and
          never rain on your parade. Let's keep your data dry and your services
          soaring high! ☁️🚀
        </p>

        <div className="flex flex-wrap justify-center">
          <button className="px-8 py-3 m-2 text-lg border rounded text-primary dark:border-gray-700">
            Say Hi back!
          </button>
        </div>
      </div>
    </section>
  );
};

export default About;
