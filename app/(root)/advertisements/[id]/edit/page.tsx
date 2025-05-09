"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AdvertisementForm } from "@/components/advertisements/advertisement-form";
import { IAdvertisement } from "@/lib/models/advertisement.model";

export default function EditAdvertisementPage() {
  const params = useParams();
  const router = useRouter();
  const [advertisement, setAdvertisement] = useState<IAdvertisement | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdvertisement = async () => {
      try {
        const response = await fetch(`/api/advertisements/${params.id}`);
        const data = await response.json();

        if (data.success && data.advertisement) {
          setAdvertisement(data.advertisement);
        } else {
          console.error("Failed to fetch advertisement:", data.error);
        }
      } catch (error) {
        console.error("Error fetching advertisement:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvertisement();
  }, [params.id]);

  if (loading) {
    return (
      <div className="main-content space-y-4 p-4 md:p-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!advertisement) {
    return (
      <div className="main-content space-y-4 p-4 md:p-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Advertisement Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content space-y-4 p-4 md:p-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-diplomat-green">
          Edit Advertisement
        </h1>
      </div>

      <AdvertisementForm
        initialData={advertisement}
        mode="edit"
        onSuccess={() => router.push(`/advertisements/${params.id}`)}
      />
    </div>
  );
}
