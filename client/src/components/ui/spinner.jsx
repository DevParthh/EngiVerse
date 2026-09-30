// src/components/ui/spinner.jsx
import React from "react";

const Spinner = ({ size = "40px", color = "blue" }) => {
  return (
    <div className="flex justify-center items-center">
      <div
        className="animate-spin rounded-full border-t-2 border-b-2"
        style={{
          width: size,
          height: size,
          borderColor: color,
        }}
      ></div>
    </div>
  );
};

export default Spinner;
