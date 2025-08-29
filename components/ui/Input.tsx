import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input(props: InputProps) {
  return (
    <input
      {...props}
      className="px-3 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  );
}
