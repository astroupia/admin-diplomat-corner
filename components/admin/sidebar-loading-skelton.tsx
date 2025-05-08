"use client";

import { motion } from "framer-motion";

export function SidebarLoadingSkeleton() {
  // Animation variants for staggered children
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="h-full py-6 px-4 space-y-6"
    >
      {/* Logo */}
      <motion.div variants={item} className="flex items-center space-x-2 px-2">
        <div className="h-8 w-8 rounded-md bg-primary/20 animate-pulse"></div>
        <div className="h-6 w-32 bg-gray-200 rounded-md animate-pulse"></div>
      </motion.div>

      {/* Divider */}
      <motion.div
        variants={item}
        className="h-px w-full bg-gray-200"
      ></motion.div>

      {/* Navigation Items */}
      <motion.div variants={container} className="space-y-1">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <motion.div
            key={i}
            variants={item}
            className={`flex items-center space-x-3 px-3 py-2 rounded-md ${
              i === 1 ? "bg-primary/10" : "hover:bg-gray-100"
            }`}
          >
            <div className="h-5 w-5 rounded-md bg-gray-300 animate-pulse"></div>
            <div
              className={`h-4 ${
                i === 1 ? "w-28" : "w-24"
              } bg-gray-200 rounded-md animate-pulse`}
            ></div>
          </motion.div>
        ))}
      </motion.div>

      {/* Divider */}
      <motion.div
        variants={item}
        className="h-px w-full bg-gray-200"
      ></motion.div>

      {/* Recent Activity */}
      <motion.div variants={item} className="px-3 space-y-3">
        <div className="h-5 w-32 bg-gray-200 rounded-md animate-pulse"></div>

        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 w-full bg-gray-200 rounded-md animate-pulse"></div>
              <div className="h-3 w-16 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* User Profile */}
      <motion.div
        variants={item}
        className="mt-auto flex items-center space-x-3 px-3 py-2 rounded-md bg-gray-50"
      >
        <div className="h-8 w-8 rounded-full bg-gray-300 animate-pulse"></div>
        <div className="space-y-1">
          <div className="h-4 w-24 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-3 w-16 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
      </motion.div>
    </motion.div>
  );
}
