interface ProjectCardProps {
  title: string;
  desc: string;
  img?: string;
  code: string;
}

export default function ProjectCard({
  title,
  desc,
  img,
  code,
}: ProjectCardProps) {
  return (
    <div className="flex justify-center p-5">
      <div className="rounded-lg shadow-lg bg-white h-[15rem] w-[15rem]">
        <a href="#!">
          <img className="rounded-t-lg" src={img} alt="" />
        </a>
        <div className="p-6">
          <h5 className="text-gray-900 text-xl font-medium mb-2">{title}</h5>
          <p className="text-gray-700 text-base mb-4">{desc}</p>
          <a
            href={code}
            className="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
          >
            Code
          </a>
        </div>
      </div>
    </div>
  );
}
