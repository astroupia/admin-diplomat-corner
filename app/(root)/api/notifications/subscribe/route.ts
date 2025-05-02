import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db-connect";
import Notification from "@/lib/models/notification.model";

export async function POST(request: Request) {
  try {
    const { userId, subscription } = await request.json();

    if (!userId || !subscription) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Store the subscription in the database
    await Notification.updateOne(
      { userId },
      { $set: { pushSubscription: subscription } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error subscribing to push notifications:", error);
    return NextResponse.json(
      { error: "Failed to subscribe to push notifications" },
      { status: 500 }
    );
  }
}
