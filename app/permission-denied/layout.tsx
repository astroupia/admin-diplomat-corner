import type React from "react";
import "../globals.css";
import { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Permission Denied - Diplomat Corner",
  description: "Access denied to the Diplomat Corner admin dashboard",
};

export default function PermissionDeniedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className={inter.className}>{children}</main>;
}
