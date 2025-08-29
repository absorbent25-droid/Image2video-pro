import { ReactNode } from "react";

export default function Card({ children }: { children: ReactNode }) {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-md w-full max-w-md">
      {children}
    </div>
  );
}
