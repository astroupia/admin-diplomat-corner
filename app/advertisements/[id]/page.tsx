"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
  Edit,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import AdvertisementAnalytics from "@/components/advertisements/advertisement-analytics";
import { trackClick } from "@/lib/utils/advertisement-tracker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Advertisement {
  _id: string;
  title: string;
  description: string;
  targetAudience?: string;
  advertisementType: string;
  startTime?: string;
  endTime?: string;
  status: "Active" | "Inactive" | "Scheduled" | "Expired" | "Draft";
  priority: "High" | "Medium" | "Low";
  performanceMetrics?: string;
  hashtags?: string[];
  timestamp: string;
  link: string;
  imageUrl?: string;
  clickCount: number;
  viewCount: number;
}

export default function AdvertisementDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [advertisement, setAdvertisement] = useState<Advertisement | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  useEffect(() => {
    const fetchAdvertisement = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/advertisements/${params.id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch advertisement");
        }

        const data = await response.json();

        if (!data.success || !data.advertisement) {
          throw new Error(data.error || "Advertisement not found");
        }

        setAdvertisement(data.advertisement);
      } catch (err) {
        console.error("Error fetching advertisement:", err);
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchAdvertisement();
    }
  }, [params.id]);

  const handleStatusToggle = async () => {
    if (!advertisement) return;

    try {
      setStatusUpdateLoading(true);

      const newStatus =
        advertisement.status === "Active" ? "Inactive" : "Active";

      const response = await fetch(`/api/advertisements/${advertisement._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update advertisement status");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to update status");
      }

      // Update local state with new advertisement data
      setAdvertisement(result.advertisement);
    } catch (err) {
      console.error("Error updating status:", err);
      // Show error message to user
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!advertisement) return;

    try {
      setDeleteLoading(true);

      const response = await fetch(`/api/advertisements/${advertisement._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete advertisement");
      }

      // Redirect to advertisements list
      router.push("/advertisements");
    } catch (err) {
      console.error("Error deleting advertisement:", err);
      // Show error message to user
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleLinkClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!advertisement) return;

    // Track click
    await trackClick(advertisement._id);

    // Open link in new tab
    window.open(advertisement.link, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="main-content flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2">Loading advertisement data...</p>
        </div>
      </div>
    );
  }

  if (error || !advertisement) {
    return (
      <div className="main-content p-4 md:p-8">
        <h1 className="text-2xl text-red-500">
          Error loading advertisement: {error || "Advertisement not found"}
        </h1>
        <Link href="/advertisements">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Advertisements
          </Button>
        </Link>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="main-content space-y-6 p-4 md:p-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/advertisements">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-diplomat-green">
            {advertisement.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={
              advertisement.status === "Active" ? "bg-green-500" : "bg-gray-500"
            }
          >
            {advertisement.status}
          </Badge>
          <Button
            variant="outline"
            size="icon"
            onClick={handleStatusToggle}
            disabled={statusUpdateLoading}
          >
            {statusUpdateLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : advertisement.status === "Active" ? (
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
            <DetailRow label="ID" value={advertisement._id} />
            <DetailRow label="Type" value={advertisement.advertisementType} />
            <DetailRow label="Priority" value={advertisement.priority} />
            <DetailRow
              label="Start Date"
              value={formatDate(advertisement.startTime)}
            />
            <DetailRow
              label="End Date"
              value={formatDate(advertisement.endTime)}
            />
            <DetailRow
              label="Target Audience"
              value={advertisement.targetAudience || "Not specified"}
            />
            <DetailRow
              label="Created"
              value={formatDate(advertisement.timestamp)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <DetailRow
              label="Views"
              value={advertisement.viewCount.toLocaleString()}
            />
            <DetailRow
              label="Clicks"
              value={advertisement.clickCount.toLocaleString()}
            />
            <DetailRow
              label="Click Rate"
              value={`${
                advertisement.viewCount > 0
                  ? (
                      (advertisement.clickCount / advertisement.viewCount) *
                      100
                    ).toFixed(2)
                  : "0.00"
              }%`}
            />
            <DetailRow
              label="Performance Goals"
              value={advertisement.performanceMetrics || "Not specified"}
            />
            <div className="mt-4 border-t pt-4">
              <h3 className="font-semibold mb-2">Destination URL</h3>
              <div className="flex items-center">
                <a
                  href={advertisement.link}
                  onClick={handleLinkClick}
                  className="text-blue-600 hover:underline text-sm truncate max-w-[300px] flex items-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {advertisement.link}
                  <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Section - Show only if image exists */}
        {advertisement.imageUrl && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-[16/9] sm:aspect-[3/1] rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={advertisement.imageUrl}
                  alt="Advertisement preview"
                  fill
                  className="object-contain"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Description Section */}
        <Card className={!advertisement.imageUrl ? "md:col-span-2" : ""}>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{advertisement.description}</p>
          </CardContent>
        </Card>

        {/* Tags Section */}
        {advertisement.hashtags && advertisement.hashtags.length > 0 && (
          <Card className={!advertisement.imageUrl ? "md:col-span-2" : ""}>
            <CardHeader>
              <CardTitle>Hashtags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {advertisement.hashtags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analytics Section */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <AdvertisementAnalytics
              advertisementId={advertisement._id}
              title={advertisement.title}
            />
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
        <Link href={`/advertisements/${advertisement._id}/edit`}>
          <Button variant="default">
            <Edit className="h-4 w-4 mr-2" />
            Edit Advertisement
          </Button>
        </Link>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              advertisement and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
