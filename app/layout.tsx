import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeepThink Chat",
  description: "An agentic chat interface with deep thinking and realtime web search"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
