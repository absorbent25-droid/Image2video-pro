import React from "react";

type CardProps = {
  children: React.ReactNode;
};

export function Card({ children }: CardProps) {
  return (
    <div className="p-4 bg-white shadow-md rounded-xl border">
      {children}
    </div>
  );
}
