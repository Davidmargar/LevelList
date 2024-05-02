import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavigationBar from './navigation-bar/navigation-bar';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "levellist",
  description: "Proyecto fin FP Grado Superior DAW Distancia - David Martínez García",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-800">
        <NavigationBar />
        <div className={inter.className}>{children}</div>
      </body>
    </html>
  );
}
