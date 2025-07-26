import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PAM - Parenting Assistance Mobile",
  description: "Supporting Australian parents with children aged 0-3 years",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#7D0820",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
