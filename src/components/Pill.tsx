const Pill = ({ text }) => {
  return (
    <div className="transform rounded-full bg-blue-400 m-3 p-3 hover:bg-blue-600 transition duration-500 hover:scale-125">
      {text}
    </div>
  );
};

export default Pill;
