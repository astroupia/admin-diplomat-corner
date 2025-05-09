"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ReportType,
  ReportStatus,
  EntityType,
} from "@/lib/models/report.model";
import { ReviewDetails } from "@/components/reports/review-details";

interface Report {
  _id: string;
  entityType: EntityType;
  entityId: string;
  reportType: ReportType;
  reportedBy: string;
  status: ReportStatus;
  description?: string;
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

const statusColors: Record<ReportStatus, string> = {
  pending: "bg-yellow-500",
  reviewed: "bg-blue-500",
  resolved: "bg-green-500",
  rejected: "bg-red-500",
};

const statusIcons: Record<ReportStatus, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  reviewed: <AlertCircle className="h-4 w-4" />,
  resolved: <CheckCircle2 className="h-4 w-4" />,
  rejected: <XCircle className="h-4 w-4" />,
};

export default function ReportsPage() {
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | "all">(
    "all"
  );
  const [selectedEntityType, setSelectedEntityType] = useState<
    EntityType | "all"
  >("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    data: reports,
    isLoading,
    refetch,
  } = useQuery<Report[]>({
    queryKey: ["reports", selectedStatus, selectedEntityType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      if (selectedEntityType !== "all")
        params.append("entityType", selectedEntityType);

      const response = await fetch(`/api/reports?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch reports");
      return response.json();
    },
  });

  const handleStatusChange = async (
    reportId: string,
    newStatus: ReportStatus
  ) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      toast.success("Status updated successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateNotes = async () => {
    if (!selectedReport) return;

    try {
      setIsUpdating(true);
      const response = await fetch(`/api/reports/${selectedReport._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes }),
      });

      if (!response.ok) throw new Error("Failed to update notes");

      toast.success("Notes updated successfully");
      refetch();
      setSelectedReport(null);
    } catch (error) {
      toast.error("Failed to update notes");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="main-content main-content-expanded space-y-4 container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex gap-4">
          <Select
            value={selectedStatus}
            onValueChange={(value) =>
              setSelectedStatus(value as ReportStatus | "all")
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={selectedEntityType}
            onValueChange={(value) =>
              setSelectedEntityType(value as EntityType | "all")
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="car">Car</SelectItem>
              <SelectItem value="house">House</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-4">
            {reports?.map((report: Report) => (
              <div
                key={report._id}
                className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`${statusColors[report.status]} text-white`}
                      >
                        <div className="flex items-center gap-1">
                          {statusIcons[report.status]}
                          {report.status}
                        </div>
                      </Badge>
                      <Badge variant="outline">{report.entityType}</Badge>
                      <Badge variant="outline">{report.reportType}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Reported on {format(new Date(report.createdAt), "PPp")}
                    </p>
                    {report.description && (
                      <p className="text-sm">{report.description}</p>
                    )}
                    {report.entityType === "review" && (
                      <ReviewDetails reviewId={report.entityId} />
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedReport(report);
                            setAdminNotes(report.adminNotes || "");
                          }}
                        >
                          Add Notes
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Admin Notes</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Textarea
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            placeholder="Enter admin notes..."
                            rows={4}
                          />
                          <Button
                            onClick={handleUpdateNotes}
                            disabled={isUpdating}
                            className="w-full"
                          >
                            {isUpdating ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Save Notes"
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Select
                      value={report.status}
                      onValueChange={(value) =>
                        handleStatusChange(report._id, value as ReportStatus)
                      }
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
