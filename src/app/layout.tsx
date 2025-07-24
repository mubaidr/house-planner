import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "2D House Planner",
  description: "A professional 2D house planning application for creating architectural designs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
