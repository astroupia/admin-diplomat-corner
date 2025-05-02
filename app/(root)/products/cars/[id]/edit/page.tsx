"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import ManageCar from "@/components/manage-car";
import { ICar } from "@/lib/models/car.model";

interface ICarExtended extends ICar {
  servicePrice?: number;
}

export default function EditCarPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [car, setCar] = useState<ICarExtended | null>(null);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/cars/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch car");
        }
        const result = await response.json();

        // The API might return either the car object directly or as part of a response object
        const carData = result.car || result;

        if (!carData || !carData._id) {
          throw new Error("Invalid car data received");
        }

        setCar(carData);
      } catch (error) {
        console.error("Error fetching car:", error);
        showToast("Failed to load car", "error");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCar();
    }
  }, [params.id, showToast]);

  if (loading) {
    return (
      <div className="main-content p-4 md:p-8">
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
            <h1 className="text-2xl font-bold text-diplomat-green">Edit Car</h1>
          </div>
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2">Loading car data...</p>
          </div>
        </MaxWidthWrapper>
      </div>
    );
  }

  return (
    <main className="main-content p-4 md:p-8">
      <MaxWidthWrapper>
        {car ? (
          <>
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
                Edit Car: {car.name}
              </h1>
            </div>
            <ManageCar initialData={car} isEditMode={true} />
          </>
        ) : (
          <div className="p-4 md:p-8">
            <div className="flex items-center mb-6">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-2xl font-bold ml-4">Car Not Found</h1>
            </div>
            <p>The car you&apos;re trying to edit could not be found.</p>
          </div>
        )}
      </MaxWidthWrapper>
    </main>
  );
}
