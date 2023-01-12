import React from "react";

const Experience = () => {
  return (
    <div className="container mx-auto">
      <h1 className="text-center uppercase">Professional Work Experience</h1>
      <div className="flex items-center justify-center py-10">
        <div className="max-w-screen-sm lg:max-w-screen-md xl:max-w-screen-lg px-20 ">
          <ol className="relative border-l-4 border-indigo-600 leading-loose">
            <li className="mb-10 ml-6 md:w-[400px]">
              <div className="absolute w-4 h-4 bg-white border-4 border-indigo-600 rounded-full -left-[0.6rem]"></div>
              <p className="absolute -left-[3.5rem] p-0 m-0 font-bold">2023</p>
              <p className="font-bold text-lg mb-1">Web Developer</p>
              <p className="font-bold text-sm mb-2">(Freelancer)</p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis
                non pretium erat. Praesent convallis libero ornare, hendrerit
                diam a, gravida felis.
              </p>
            </li>
            <li className="mb-10 ml-6 md:w-[400px]">
              <div className="absolute w-4 h-4 bg-white border-4 border-indigo-600 rounded-full -left-[0.6rem]"></div>
              <p className="absolute -left-[3.5rem] p-0 m-0 font-bold">2022</p>
              <p className="font-bold text-lg mb-1">
                App development, BusTracker
              </p>
              <p className="font-bold text-sm mb-2">(Personal Project)</p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis
                non pretium erat. Praesent convallis libero ornare, hendrerit
                diam a, gravida felis.
              </p>
            </li>
            <li className="mb-10 ml-6 md:w-[400px]">
              <div className="absolute w-4 h-4 bg-white border-4 border-indigo-600 rounded-full -left-[0.6rem]"></div>
              <p className="absolute -left-[3.75rem] p-0 m-0 font-bold">
                2021 -
              </p>
              <p className="font-bold text-lg mb-1">
                Full Stack Developer, Unknown Company
              </p>
              <p className="font-bold text-sm mb-2">(Contract)</p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis
                non pretium erat. Praesent convallis libero ornare, hendrerit
                diam a, gravida felis.
              </p>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Experience;
