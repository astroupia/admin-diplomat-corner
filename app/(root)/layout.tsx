import type React from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarProvider } from "@/components/admin/sidebar-provider";
import { ToastProvider } from "@/components/ui/toast";
import "../globals.css";
import { Metadata } from "next";
import { Inter } from "next/font/google";

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
    <ToastProvider>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <AdminSidebar />
          <div className="flex-1 bg-white">
            {children}
          </div>
        </div>
      </SidebarProvider>
    </ToastProvider>
  );
}
