import type React from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarProvider } from "@/components/admin/sidebar-provider";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Diplomat Corner",
  description: "Diplomat Corner - Your trusted marketplace",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <ToastProvider>
        <html lang="en">
          <body className={inter.className}>
            <SidebarProvider>
              <div className="flex min-h-screen">
                <AdminSidebar />
                {children}
              </div>
            </SidebarProvider>
          </body>
        </html>
      </ToastProvider>
      <html lang="en">
        <body className={inter.className}>
          <ToastProvider>
            <SidebarProvider>
              <div className="flex min-h-screen">
                <AdminSidebar />
                {children}
              </div>
            </SidebarProvider>
          </ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
