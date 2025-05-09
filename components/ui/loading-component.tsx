"use client";

import { motion } from "framer-motion";
import { DashboardLoadingSkeleton } from "@/components/admin/dashboard-loading-skeleton";
import { SidebarLoadingSkeleton } from "@/components/admin/sidebar-loading-skelton";

export default function DashboardLoading() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="hidden md:block w-64 bg-white border-r border-gray-200 shadow-sm"
      >
        <SidebarLoadingSkeleton />
      </motion.div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex-1 overflow-auto"
      >
        <DashboardLoadingSkeleton />
      </motion.div>
    </div>
  );
}
