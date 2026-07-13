import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { plexSans, plexMono } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "All-in",
  description: "Cacing Cacing, Naga Naga, Mantap!!!",
};

export default function RootLayout({
  children,

} : Readonly<{ children: React.ReactNode}>) {
  return (
    <html
      lang="id"
      className={`${plexSans.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
