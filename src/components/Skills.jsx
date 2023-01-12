import React from "react";
import Pill from "./Pill";
const Skills = () => {
  return (
    <div className="container mx-auto text-center p-5">
      <h1>Skills</h1>
      <div className="flex flex-wrap">
        <Pill text="React" />
        <Pill text="Typescript" />
      </div>
    </div>
  );
};

export default Skills;
