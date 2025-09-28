import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/loading.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TSun-Authenticator - Secure 2FA",
  description: "A secure, stunning, and modular 2FA authenticator WebApp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Favicon in Every Website use 3d Favicons */}
        <link rel="icon" href="/favicon-3d.ico" sizes="any" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}