import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Live Class - Ant Media Server",
  description: "Google Meet-style live streaming with Ant Media Server",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

