import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db-connect";
import Report from "@/lib/models/report.model";
import User from "@/lib/models/user.model";
import Notification from "@/lib/models/notification.model";
import Review from "@/lib/models/review.model";

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    // Verify user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the request body
    const body = await request.json();
    const { entityType, entityId, reportType, description } = body;

    // Validate required fields
    if (!entityType || !entityId || !reportType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate entityType is one of the allowed types
    const validEntityTypes = ["review", "user", "car", "house"];
    if (!validEntityTypes.includes(entityType)) {
      return NextResponse.json(
        { error: "Invalid entity type" },
        { status: 400 }
      );
    }

    // Validate reportType is one of the allowed types
    const validReportTypes = [
      "spam",
      "harassment",
      "inappropriate",
      "misinformation",
      "other",
    ];
    if (!validReportTypes.includes(reportType)) {
      return NextResponse.json(
        { error: "Invalid report type" },
        { status: 400 }
      );
    }

    // Check if the entity exists
    if (entityType === "review") {
      const review = await Review.findById(entityId);
      if (!review) {
        return NextResponse.json(
          { error: "Review not found" },
          { status: 404 }
        );
      }
    }

    // Prevent users from reporting their own content
    if (entityType === "review") {
      const review = await Review.findById(entityId);
      if (review && review.userId === userId) {
        return NextResponse.json(
          { error: "You cannot report your own content" },
          { status: 400 }
        );
      }
    }

    // Check if the user already reported this entity
    const existingReport = await Report.findOne({
      entityId,
      reportedBy: userId,
    });

    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this content" },
        { status: 400 }
      );
    }

    // Create the report
    const report = new Report({
      entityType,
      entityId,
      reportType,
      reportedBy: userId,
      status: "pending",
      description: description || "",
    });

    await report.save();

    // Create notification for the content owner
    if (entityType === "review") {
      const review = await Review.findById(entityId);
      if (review) {
        try {
          await Notification.create({
            userId: review.userId,
            title: "Content Reported",
            message: `Your review has been reported. Our team will review it soon.`,
            type: "alert",
            category: "system",
            isRead: false,
          });
        } catch (notificationError) {
          console.error("Error creating notification:", notificationError);
        }
      }
    }

    return NextResponse.json(
      { success: true, message: "Report submitted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating report:", error);

    // Check for duplicate key error (user already reported this entity)
    if (
      error instanceof Error &&
      error.name === "MongoServerError" &&
      (error as { code?: number }).code === 11000
    ) {
      return NextResponse.json(
        { error: "You have already reported this content" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    // Verify user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the user is an admin
    // This is a simplified check - in a real app, you might want to check a role field
    const user = await User.findOne({ clerkId: userId });
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const entityType = searchParams.get("entityType");
    // Build query
    const query: Record<string, string> = {};
    if (status) query.status = status;
    if (entityType) query.entityType = entityType;

    // Get reports
    const reports = await Report.find(query).sort({ createdAt: -1 });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
