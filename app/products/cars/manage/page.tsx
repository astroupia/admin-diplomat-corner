"use client";

import ManageCar from "@/components/manage-car";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AddCarPage() {
  const router = useRouter();

  return (
    <main className="flex-1 main-content p-4 md:p-8">
      <MaxWidthWrapper>
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-diplomat-green">
            Add New Car
          </h1>
        </div>
        <ManageCar />
      </MaxWidthWrapper>
    </main>
  );
}
