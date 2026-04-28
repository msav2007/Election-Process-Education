import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Election Copilot AI",
  description: "A guided AI assistant for understanding election process timelines and steps."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
