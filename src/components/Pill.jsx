import React from "react";

const Pill = ({ text }) => {
  return (
    <button className="rounded-md bg-red-500 px-4 py-2 text-white">
      {text}
    </button>
  );
};

export default Pill;
