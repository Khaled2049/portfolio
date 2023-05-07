import ProjectCard from './ProjectCard';
import { projects } from '../data/projects';

const Projects = () => {
  return (
    <div id="projects" className="container mx-auto">
      <h1 className="text-center text-primary text-4xl py-8 uppercase m-4">
        Featured Projects
      </h1>
      <div className="grid grid-rows-3 md:grid-rows-1 grid-flow-col gap-2">
        {projects.map((project: any) => {
          return (
            <ProjectCard
              // img="https://mdbootstrap.com/img/new/standard/nature/184.jpg"
              title={project.title}
              desc={project.description}
              code={project.code}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Projects;
