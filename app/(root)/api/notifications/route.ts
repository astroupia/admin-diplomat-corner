import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db-connect";
import Notification from "@/lib/models/notification.model";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { userId, title, message, type, category, link, productType } = body;

    if (!userId || !title || !message || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate notification type
    const validTypes = [
      "message",
      "alert",
      "update",
      "system",
      "security",
      "request",
      "approval",
      "info",
      "success",
      "warning",
      "error",
    ];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid notification type" },
        { status: 400 }
      );
    }

    // Validate category if provided
    if (category) {
      const validCategories = ["car", "house", "account", "system"];
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          { error: "Invalid notification category" },
          { status: 400 }
        );
      }
    }

    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      category,
      link,
      productType,
      isRead: false,
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { notificationId, action, notificationIds } = await req.json();

    // Handle marking all notifications as read
    if (action === "markAllRead" && Array.isArray(notificationIds)) {
      // Check if the user owns all these notifications
      const updates = await Notification.updateMany(
        {
          _id: { $in: notificationIds },
          userId: userId,
        },
        { $set: { isRead: true } }
      );

      return NextResponse.json({
        message: "Notifications marked as read",
        updated: updates.modifiedCount,
      });
    }

    // Handle single notification mark as read (existing logic)
    if (!notificationId) {
      return NextResponse.json(
        { message: "Notification ID is required" },
        { status: 400 }
      );
    }

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return NextResponse.json(
        { message: "Notification not found" },
        { status: 404 }
      );
    }

    // Check if the user owns the notification
    if (notification.userId !== userId) {
      return NextResponse.json(
        { message: "Unauthorized to update this notification" },
        { status: 403 }
      );
    }

    // Mark notification as read
    notification.isRead = true;
    await notification.save();

    return NextResponse.json(
      { message: "Notification marked as read" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get("id");

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
