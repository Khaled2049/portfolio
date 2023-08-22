import Pill from "./Pill";

const skills = ["React", "TS", "Python", "Golang", "AWS", "Git"];

const Skills = () => {
  return (
    <div className="container h-[32rem] md:h-[42rem] mx-auto flex justify-center text-center p-5 place-items-center">
      <div className="grid md:grid-cols-2 gap-4 p-5 my-4">
        <div className="flex flex-col justify-center items-center relative overflow-hidden max-w-xs">
          <span className="inline-block text-2xl md:text-4xl uppercase max-w-xs hover:scale-110 transition duration-300 ease-in-out ">
            Skills
          </span>
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
