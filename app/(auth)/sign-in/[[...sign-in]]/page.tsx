"use client";

import { SignIn } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  FolderCode,
  Lock,
  Mail,
  User,
} from "lucide-react";

export default function SignInPage() {
  const [mounted, setMounted] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Features list
  const features = [
    {
      icon: <User className="h-5 w-5 text-primary" />,
      title: "Personal Profile",
      description: "Create your personalized profile to track your activity",
    },
    {
      icon: <Lock className="h-5 w-5 text-primary" />,
      title: "Secure Access",
      description: "Your data is protected with enterprise-grade security",
    },
    {
      icon: <Mail className="h-5 w-5 text-primary" />,
      title: "Email Notifications",
      description: "Stay updated with the latest listings and offers",
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
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

  return (
    <div className="min-h-screen bg-gray-50 pt-5 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Left Column - Decorative and Informational */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:w-5/12 relative bg-gradient-to-br from-primary/90 to-primary p-8 lg:p-12 text-white"
              onAnimationComplete={() => setAnimationComplete(true)}
            >
              <div className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                  <p className="text-white/80 mb-8">
                    Sign in to access your account and continue your journey
                    with us.
                  </p>
                </motion.div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate={mounted ? "visible" : "hidden"}
                  className="space-y-6"
                >
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="flex items-start space-x-3"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">{feature.title}</h3>
                        <p className="text-sm text-white/70">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="mt-12"
                >
                  <p className="text-white/80 mb-3">
                    Don&apos;t have an account?
                  </p>
                  <Link
                    href="/sign-up"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg transition-colors duration-300"
                  >
                    Create Account <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            </motion.div>

            {/* Right Column - Clerk SignIn Component */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:w-7/12 p-6 lg:p-12 flex items-center justify-center"
            >
              <div className="w-full max-w-md">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="bg-white rounded-xl"
                >
                  <SignIn
                    appearance={{
                      elements: {
                        rootBox: "mx-auto w-full",
                        card: "shadow-none",
                        header: "text-center",
                        footer: "text-center",
                      },
                    }}
                  />
                </motion.div>

                {/* Trust indicators */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: animationComplete ? 1 : 0 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                  className="flex flex-col items-center justify-center mt-8 pt-6 border-t border-gray-100"
                >
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Secure authentication powered by Clerk</span>
                  </div>
                  <div className="m-auto flex items-center gap-x-6">
                    <div className="pt-5 flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
                      <FolderCode className="h-4 w-4 text-green-500" />
                      <span>Developed By Sydek</span>
                    </div>
                    <div className="flex justify-center space-x-6">
                      <Image
                        src="/sydek-logo.png"
                        alt="sydek logo"
                        width={30}
                        height={30}
                        className="rounded-lg opacity-50 hover:opacity-80 transition-opacity"
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
