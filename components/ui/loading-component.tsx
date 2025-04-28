import MaxWidthWrapper from "@/components/max-width-wrapper";
import { Car, Home } from "lucide-react";

export default function LoadingComponent() {
  return (
    <section className="flex flex-col min-h-screen bg-gray-50 animate-pulse">
      <MaxWidthWrapper>
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>

          {/* Main Content */}
          <main className="flex-1 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            {/* Navigation Buttons Skeleton */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-300 rounded-lg h-10 w-full sm:w-40">
                <Car className="w-5 h-5 text-gray-400" />
                <div className="h-4 bg-gray-400 rounded w-20"></div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-300 rounded-lg h-10 w-full sm:w-40">
                <Home className="w-5 h-5 text-gray-400" />
                <div className="h-4 bg-gray-400 rounded w-20"></div>
              </div>
            </div>

            {/* Form Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column Skeleton */}
              <div className="lg:col-span-8 space-y-6">
                {/* Basic Information Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="h-4 bg-gray-300 rounded w-1/4 mb-1"></div>
                    <div className="h-10 bg-gray-300 rounded-lg w-full"></div>
                  </div>
                  <div className="flex flex-wrap gap-2 items-end">
                    <div className="h-10 bg-gray-300 rounded-lg w-24"></div>
                    <div className="h-10 bg-gray-300 rounded-lg w-28"></div>
                    <div className="h-10 bg-gray-300 rounded-lg w-32"></div>
                  </div>
                </div>

                {/* Details Skeleton */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i}>
                      <div className="h-4 bg-gray-300 rounded w-1/2 mb-1"></div>
                      <div className="h-10 bg-gray-300 rounded-lg w-full"></div>
                    </div>
                  ))}
                </div>

                {/* Options Skeleton */}
                <div>
                  <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="h-10 bg-gray-300 rounded-full w-full"
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Description Skeleton */}
                <div>
                  <div className="h-4 bg-gray-300 rounded w-1/4 mb-1"></div>
                  <div className="h-24 bg-gray-300 rounded-lg w-full"></div>
                </div>
              </div>

              {/* Right Column Skeleton */}
              <div className="lg:col-span-4 space-y-6">
                {/* File Uploads Skeleton */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-1/3 mb-1"></div>
                    <div className="h-40 bg-gray-300 rounded-lg w-full"></div>
                    <div className="h-10 bg-gray-300 rounded-lg w-36"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-1/2 mb-1"></div>
                    <div className="h-40 bg-gray-300 rounded-lg w-full"></div>
                    <div className="h-10 bg-gray-300 rounded-lg w-40"></div>
                  </div>
                </div>

                {/* Additional Details Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i}>
                      <div className="h-4 bg-gray-300 rounded w-1/2 mb-1"></div>
                      <div className="h-10 bg-gray-300 rounded-lg w-full"></div>
                    </div>
                  ))}
                </div>

                {/* Price Skeleton */}
                <div>
                  <div className="h-4 bg-gray-300 rounded w-1/4 mb-1"></div>
                  <div className="h-10 bg-gray-300 rounded-lg w-full"></div>
                </div>

                {/* Service Price Skeleton */}
                <div>
                  <div className="h-4 bg-gray-300 rounded w-1/3 mb-1"></div>
                  <div className="h-10 bg-gray-300 rounded-lg w-full"></div>
                </div>

                {/* Options Skeleton */}
                <div>
                  <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                  <div className="flex gap-2">
                    {[...Array(2)].map((_, i) => (
                      <div
                        key={i}
                        className="h-10 bg-gray-300 rounded-full w-20"
                      ></div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                  <div className="flex flex-wrap gap-2">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="h-10 bg-gray-300 rounded-full w-24"
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Submit Button Skeleton */}
                <div className="h-12 bg-gray-400 rounded-lg w-full"></div>
              </div>
            </div>
          </main>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
