import type { Metadata } from "next";
import "./globals.css";
import { PinBarProvider } from "@/providers/pinbar";

export const metadata: Metadata = {
  title: "TFT - Swap NFTS for NFTs",
  description:
    "TFT is for NFT lovers who'd rather swap than shop. Dive in, trade up, and grow your collection the fun way!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PinBarProvider>{children}</PinBarProvider>
      </body>
    </html>
  );
}
