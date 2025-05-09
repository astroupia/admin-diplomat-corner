"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

export function DashboardLoadingSkeleton() {
  // Animation variants for staggered children
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4 p-4 md:p-8"
    >
      {/* Header Skeleton */}
      <motion.div variants={item} className="space-y-2">
        <div className="h-8 w-64 bg-gray-200 rounded-md animate-pulse"></div>
        <div className="h-4 w-96 bg-gray-200 rounded-md animate-pulse"></div>
      </motion.div>

      {/* Tabs Skeleton */}
      <motion.div variants={item} className="border-b border-gray-200">
        <div className="flex space-x-2">
          <div className="h-10 w-24 bg-gray-200 rounded-t-md animate-pulse relative">
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
          </div>
          <div className="h-10 w-24 bg-gray-100 rounded-t-md"></div>
          <div className="h-10 w-32 bg-gray-100 rounded-t-md"></div>
          <div className="h-10 w-24 bg-gray-100 rounded-t-md"></div>
        </div>
      </motion.div>

      {/* Stats Cards Skeleton */}
      <motion.div
        variants={item}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-5 w-24 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
            </div>
            <div className="h-8 w-16 bg-gray-300 rounded-md animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-200 rounded-md animate-pulse"></div>
          </Card>
        ))}
      </motion.div>

      {/* Main Content Skeleton */}
      <motion.div
        variants={item}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-7"
      >
        {/* Recent Listings */}
        <Card className="col-span-4 p-6">
          <div className="space-y-2 mb-4">
            <div className="h-6 w-40 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-md bg-gray-200 animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded-md animate-pulse"></div>
                </div>
                <div className="h-8 w-16 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Ads */}
        <Card className="col-span-3 p-6">
          <div className="space-y-2 mb-4">
            <div className="h-6 w-48 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-4 w-56 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-md bg-gray-200 animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded-md animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Loading Indicator */}
      <motion.div
        className="fixed bottom-4 right-4 flex items-center space-x-2 bg-white p-2 rounded-md shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="h-4 w-4 rounded-full bg-primary animate-ping"></div>
        <div className="text-sm text-gray-600">Loading dashboard data...</div>
      </motion.div>
    </motion.div>
  );
}
