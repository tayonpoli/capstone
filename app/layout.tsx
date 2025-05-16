import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Maumanage",
  description: "Capstone project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={GeistSans.className}
      >
        {children}
        <Toaster />
        <Toaster richColors />
      </body>
    </html>
  );
}
