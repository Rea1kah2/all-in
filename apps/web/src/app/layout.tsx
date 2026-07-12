import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "All-in",
  description: "Cacing Cacing, Naga Naga, Mantap!!!",
};

export default function RootLayout({
  children,
} : Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
