import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarProvider } from "@/components/admin/sidebar-provider";
import type { ReactNode } from "react";

export default function MessagesLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 main-content">{children}</main>
      </div>
    </SidebarProvider>
  );
}
