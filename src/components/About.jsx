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
          <button
            type="button"
            className="inline-block px-6 py-2.5 border-2 border-black font-xl text-xs leading-tight uppercase rounded hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out"
            data-mdb-ripple="true"
            data-mdb-ripple-color="light"
          >
            Contact
          </button>
        </div>
      </div>
    </section>
  );
};

export default About;
