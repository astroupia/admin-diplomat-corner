"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X, ArrowRight } from "lucide-react";
import Link from "next/link";

interface SuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productId: string;
  productType?: "car" | "house" | "item"; // Add more types as needed
}

export default function SuccessDialog({
  isOpen,
  onClose,
  productName,
  productId,
  productType = "item",
}: SuccessDialogProps) {
  const [progress, setProgress] = useState(100);

  // Auto-close timer with progress bar
  useEffect(() => {
    if (!isOpen) return;

    const duration = 5000; // 5 seconds
    const interval = 50; // Update every 50ms
    const steps = duration / interval;
    const decrement = 100 / steps;

    setProgress(100);

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    const progressTimer = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - decrement));
    }, interval);

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [isOpen, onClose]);

  // Get product type specific details
  const getProductDetails = () => {
    switch (productType) {
      case "car":
        return {
          title: "Vehicle Listed Successfully!",
          icon: "🚗",
          viewLink: `/car/${productId}`,
          viewText: "View Vehicle Listing",
          manageLink: "/manage-product/car",
        };
      case "house":
        return {
          title: "Property Listed Successfully!",
          icon: "🏠",
          viewLink: `/house/${productId}`,
          viewText: "View Property Listing",
          manageLink: "/manage-product/house",
        };
      default:
        return {
          title: "Product Created Successfully!",
          icon: "✨",
          viewLink: `/item/${productId}`,
          viewText: "View Product",
          manageLink: "/manage-product/item",
        };
    }
  };

  const details = getProductDetails();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: "100%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>

            <div className="p-6 pt-10">
              {/* Success icon */}
              <div className="mb-6 flex justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    damping: 10,
                    stiffness: 200,
                    delay: 0.2,
                  }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"></div>
                  <div className="relative flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                </motion.div>
              </div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                  {details.icon} {details.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  <span className="font-medium text-primary">
                    {productName}
                  </span>{" "}
                  has been successfully created and is now live on our platform.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href={details.viewLink}
                    className="inline-flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    {details.viewText}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href={details.manageLink}
                    className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Manage Products
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Confetti effect */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: Math.random() * 100 - 50 + "%",
                    y: -20,
                    scale: Math.random() * 0.5 + 0.5,
                    opacity: 1,
                  }}
                  animate={{
                    y: "120%",
                    opacity: 0,
                  }}
                  transition={{
                    duration: Math.random() * 1 + 1,
                    delay: Math.random() * 0.5,
                    ease: "easeOut",
                  }}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: [
                      "#FF6B6B",
                      "#4ECDC4",
                      "#FFD166",
                      "#118AB2",
                      "#073B4C",
                    ][Math.floor(Math.random() * 5)],
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
