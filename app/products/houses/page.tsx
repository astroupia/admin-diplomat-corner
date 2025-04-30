"use client";

import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import { HouseDashboard } from "@/components/admin/house-dashboard";
import Link from "next/link";

export default function HousesPage() {
  return (
    <div className="main-content p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Houses</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/products/houses/manage">
              <Plus className="mr-2 h-4 w-4" />
              Add House
            </Link>
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Bulk Upload
          </Button>
        </div>
      </div>

      <HouseDashboard />
    </div>
  );
}
