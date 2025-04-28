import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db-connect";
import Notification from "@/lib/models/notification.model";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const lastCheck = searchParams.get("lastCheck");

    if (!userId || !lastCheck) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get the user's push subscription
    const userNotification = await Notification.findOne({ userId });
    const pushSubscription = userNotification?.pushSubscription;

    // Count new notifications
    const count = await Notification.countDocuments({
      userId,
      createdAt: { $gt: new Date(lastCheck) },
    });

    // If there are new notifications and user has push subscription
    if (count > 0 && pushSubscription) {
      try {
        const response = await fetch(pushSubscription.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `vapid ${process.env.VAPID_PUBLIC_KEY}`,
          },
          body: JSON.stringify({
            title: "New Notification",
            body: `You have ${count} new notification${count > 1 ? "s" : ""}`,
            icon: "/icon.png",
            badge: "/badge.png",
            data: {
              url: "/notifications",
            },
          }),
        });

        if (!response.ok) {
          console.error(
            "Failed to send push notification:",
            response.statusText
          );
        }
      } catch (error) {
        console.error("Error sending push notification:", error);
      }
    }

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error checking new notifications:", error);
    return NextResponse.json(
      { error: "Failed to check new notifications" },
      { status: 500 }
    );
  }
}
