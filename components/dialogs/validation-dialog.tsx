"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Info, X, ArrowLeft, CheckCircle } from "lucide-react";

interface ValidationField {
  name: string;
  label: string;
  valid: boolean;
}

interface ValidationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  missingFields: ValidationField[];
  onGoBack: () => void;
}

export default function ValidationDialog({
  isOpen,
  onClose,
  missingFields,
  onGoBack,
}: ValidationDialogProps) {
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
              {/* Info icon */}
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
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"></div>
                  <div className="relative flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full">
                    <Info className="w-10 h-10 text-blue-600" />
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
                  Please Complete Required Fields
                </h3>
                <p className="text-gray-600 mb-6">
                  The following information is required to create your product
                  listing:
                </p>

                {/* Missing fields list */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <ul className="space-y-3 text-left">
                    {missingFields.map((field, index) => (
                      <motion.li
                        key={field.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <div
                          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                            field.valid ? "bg-green-100" : "bg-amber-100"
                          }`}
                        >
                          {field.valid ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <span className="text-amber-600 text-xs font-bold">
                              !
                            </span>
                          )}
                        </div>
                        <span className="text-gray-700">{field.label}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Action button */}
                <button
                  onClick={onGoBack}
                  className="inline-flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors w-full"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Return to Form
                </button>
              </motion.div>
            </div>

            {/* Highlight pulse effect */}
            <motion.div
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1, repeat: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-blue-500 pointer-events-none"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
