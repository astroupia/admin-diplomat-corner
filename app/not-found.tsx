"use client";

import type React from "react";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Home, Search } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Animated number variants
  const numberVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.8,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-3xl mx-auto">
        <motion.div
          className="text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Animated 404 */}
          <motion.div
            className="flex items-center justify-center mb-8"
            variants={numberVariants}
          >
            <div className="relative">
              <div className="text-[10rem] md:text-[12rem] font-bold text-gray-100 leading-none select-none">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-[5rem] md:text-[6rem] font-bold bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text leading-none">
                  404
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.h1
            className="text-3xl md:text-4xl font-bold text-gray-800 mb-4"
            variants={itemVariants}
          >
            Page Not Found
          </motion.h1>

          <motion.p
            className="text-gray-600 mb-8 max-w-md mx-auto"
            variants={itemVariants}
          >
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved. Let&apos;s get you back on track.
          </motion.p>
          {/* Search */}
          <motion.div className="mb-8 max-w-md mx-auto" variants={itemVariants}>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search for something..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent shadow-sm"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-primary text-white rounded-full p-1"
              >
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </form>
          </motion.div>

          {/* Navigation options */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            variants={itemVariants}
          >
            <Link
              href="/"
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full text-gray-700 hover:text-primary hover:border-primary/50 transition-colors shadow-sm hover:shadow-md"
            >
              <Home className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>

            <Link
              href="/contact-us"
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md"
            >
              <span>Contact Support</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-[-1]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}
