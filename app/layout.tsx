
import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "My Next.js App",
  description: "Deployed on Netlify with Next.js and TailwindCSS",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
