import React from "react";
import ProjectCard from "./ProjectCard";
const Projects = () => {
  return (
    <div className="container mx-auto">
      <h1 className="text-center uppercase m-4">Featured Projects</h1>
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
