import { ProjectCard, ProjectCarousel } from "../components";
import projects from "../data/projects.ts";

const Projects = () => {
  return (
    <div id="projects" className="container mx-auto my-4 py-3">
      <h1 className="text-center text-primary text-4xl py-8 uppercase m-4">
        Featured Projects
      </h1>

      <div className="grid md:grid-cols-2 sm:grid-cols-1 gap-4 text-center">
        <div className="...">
          <ProjectCarousel />
        </div>
        <div className="grid md:grid-cols-2 sm:grid-cols-1 gap-5">
          {projects.map((project: any) => {
            return (
              <div key={project.title}>
                <ProjectCard
                  // img="https://mdbootstrap.com/img/new/standard/nature/184.jpg"
                  title={project.title}
                  desc={project.description}
                  code={project.code}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Projects;
