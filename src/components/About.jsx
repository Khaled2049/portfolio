import React from "react";

const About = () => {
  return (
    <section className="text-primary">
      <div className="container mx-auto flex flex-col items-center px-4 py-16 text-center md:py-32 md:px-10 lg:px-32 xl:max-w-3xl">
        <h1 className="text-7xl font-rubik leading-none">Hi I'm Khaled!</h1>
        <p className="px-8 mt-8 mb-12 font-roboto text-secondary text-lg">
          Welcome to my website.
        </p>

        <div className="flex flex-wrap justify-center">
          <button
            href="#contact"
            className="px-8 py-3 m-2 text-lg border rounded text-primary dark:border-gray-700"
          >
            Say Hi back!
          </button>
        </div>
      </div>
    </section>
  );
};

export default About;
