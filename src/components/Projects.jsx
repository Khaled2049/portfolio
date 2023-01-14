import React from "react";
import ProjectCard from "./ProjectCard";
const Projects = () => {
  return (
    <div className="container text-center mx-auto">
      <div className=" rounded-2xl inline-block text-2xl md:text-4xl mt-4 uppercase m-4 p-3">
        <span className="inline-block text-2xl md:text-4xl uppercase  hover:scale-110 transition duration-300 ease-in-out">
          Featured Projects
        </span>
      </div>
      <div className="grid grid-rows-3 md:grid-rows-1 grid-flow-col gap-2">
        <ProjectCard
          img="https://mdbootstrap.com/img/new/standard/nature/184.jpg"
          title="ArtC"
          desc="Short Description"
        />
        <ProjectCard
          img="https://mdbootstrap.com/img/new/standard/nature/184.jpg"
          title="ArtC"
          desc="Short Description"
        />
        <ProjectCard
          img="https://mdbootstrap.com/img/new/standard/nature/184.jpg"
          title="ArtC"
          desc="Short Description"
        />
      </div>
    </div>
  );
};

export default Projects;
