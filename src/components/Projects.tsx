import ProjectCard from './ProjectCard';
import { projects } from '../data/projects';

const Projects = () => {
  return (
    <div id="projects" className="container mx-auto">
      <h1 className="text-center text-primary text-4xl py-8 uppercase m-4">
        Featured Projects
      </h1>
      {projects.map((project) => {
        console.log(project.ArtX);
      })}
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
