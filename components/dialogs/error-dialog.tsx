"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, RefreshCw, Copy, Check } from "lucide-react";

interface ErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry?: () => void;
  title?: string;
  errorMessage?: string;
  errorDetails?: string;
}

export default function ErrorDialog({
  isOpen,
  onClose,
  onRetry,
  title = "Something went wrong",
  errorMessage = "We encountered an error while creating your product.",
  errorDetails,
}: ErrorDialogProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyErrorToClipboard = () => {
    if (!errorDetails) return;

    navigator.clipboard.writeText(errorDetails).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

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
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>

            <div className="p-6 pt-10">
              {/* Error icon */}
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
                  <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"></div>
                  <div className="relative flex items-center justify-center w-20 h-20 bg-red-100 rounded-full">
                    <AlertTriangle className="w-10 h-10 text-red-600" />
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
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {title}
                </h3>
                <p className="text-gray-600 mb-6">{errorMessage}</p>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
                  {onRetry && (
                    <button
                      onClick={onRetry}
                      className="inline-flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Try Again
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>

                {/* Error details section */}
                {errorDetails && (
                  <div className="mt-2">
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      {showDetails
                        ? "Hide technical details"
                        : "Show technical details"}
                    </button>

                    <AnimatePresence>
                      {showDetails && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-3"
                        >
                          <div className="relative bg-gray-50 rounded-lg p-3 text-left">
                            <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                              {errorDetails}
                            </pre>
                            <button
                              onClick={copyErrorToClipboard}
                              className="absolute top-2 right-2 p-1 rounded-md bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
                              aria-label="Copy error details"
                            >
                              {copied ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Red pulse effect */}
            <motion.div
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1, repeat: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-red-500 pointer-events-none"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
