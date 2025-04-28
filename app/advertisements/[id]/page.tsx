import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Define the Advertisement type
interface Advertisement {
  id: string;
  name: string;
  company: string;
  product: string;
  status: "active" | "inactive";
  priority: "high" | "medium" | "low";
  startDate: string;
  endDate: string;
  type: string;
  description: string;
  tags: string[];
  image: string;
  impressions: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

// Helper function to fetch advertisement data
async function getAdvertisement(id: string): Promise<Advertisement> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/advertisements/${id}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch advertisement");
  }
  return res.json();
}

export default async function AdvertisementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Resolve params if it's a Promise
  const resolvedParams = params instanceof Promise ? await params : params;

  let ad: Advertisement;
  try {
    ad = await getAdvertisement(resolvedParams.id);
  } catch (error) {
    return (
      <div className="main-content p-4 md:p-8">
        <h1 className="text-2xl text-red-500">
          Error loading advertisement:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </h1>
        <Link href="/admin/advertisements">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Advertisements
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="main-content space-y-4 p-4 md:p-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/admin/advertisements">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-diplomat-green">
            {ad.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={ad.status === "active" ? "bg-green-500" : "bg-gray-500"}
          >
            {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
          </Badge>
          <Button variant="outline" size="icon">
            {ad.status === "active" ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Details Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Advertisement Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <DetailRow label="ID" value={ad.id} />
            <DetailRow label="Company" value={ad.company} />
            <DetailRow label="Product" value={ad.product} />
            <DetailRow label="Type" value={ad.type} />
            <DetailRow label="Priority" value={ad.priority} />
            <DetailRow
              label="Start Date"
              value={new Date(ad.startDate).toLocaleDateString()}
            />
            <DetailRow
              label="End Date"
              value={new Date(ad.endDate).toLocaleDateString()}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <DetailRow
              label="Impressions"
              value={ad.impressions.toLocaleString()}
            />
            <DetailRow label="Clicks" value={ad.clicks.toLocaleString()} />
            <DetailRow
              label="Click Rate"
              value={`${((ad.clicks / ad.impressions) * 100).toFixed(2)}%`}
            />
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-[3/1] rounded-lg overflow-hidden">
              <Image
                src={ad.image || "/placeholder.svg"}
                alt="Advertisement preview"
                fill
                className="object-cover"
              />
            </div>
          </CardContent>
        </Card>

        {/* Description Section */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{ad.description}</p>
          </CardContent>
        </Card>

        {/* Tags Section */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {ad.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button variant="outline">Delete</Button>
        <Button variant="default">Edit Advertisement</Button>
      </div>
    </div>
  );
}

// Reusable component for each detail row
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="font-semibold">{label}:</span>
      <span className="capitalize">{value}</span>
    </div>
  );
}
