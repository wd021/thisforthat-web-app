import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TFT",
  description: "A space to swap NFTs for NFTs",
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
