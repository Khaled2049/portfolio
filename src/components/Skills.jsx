import React from "react";
import Pill from "./Pill";

const skills = ["React", "TS", "Python", "Golang", "AWS", "Git"];

const Skills = () => {
  return (
    <div className="container mx-auto text-center p-5">
      <div className="grid md:grid-cols-2 gap-4 p-5 my-4">
        <div className="border-solid border-2 flex flex-col justify-center items-center">
          <span className="inline-block text-xl">Skills</span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {skills.map((skill) => {
            return <Pill key={skill} text={skill} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default Skills;
