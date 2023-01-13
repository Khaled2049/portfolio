import React from "react";

const About = () => {
  return (
    <section className="dark:bg-gray-800 dark:text-gray-100">
      <div className="container mx-auto flex flex-col items-center px-4 py-16 text-center md:py-32 md:px-10 lg:px-32 xl:max-w-3xl">
        <h1 className="text-4xl font-bold leading-none sm:text-5xl">
          Hi I'm Khaled!
        </h1>
        <p className="px-8 mt-8 mb-12 text-lg">Welcome to my website.</p>
        <div className="flex flex-wrap justify-center">
          <button className="px-8 py-3 m-2 text-lg border rounded dark:text-gray-50 dark:border-gray-700">
            Hire Me
          </button>
        </div>
      </div>
    </section>
  );
};

export default About;
