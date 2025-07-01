import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import GtmHead from "@/components/scripts/gtm";

export const metadata: Metadata = {
  title: "literally the moon",
  description: "the official website of literally the moon",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <GtmHead />
      </head>
      <body className={`bg-black ${GeistMono.className}`}>{children}</body>
    </html>
  );
}
