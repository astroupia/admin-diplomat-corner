import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db-connect";
import Request from "@/lib/models/request.model";

export async function GET(request: Request) {
  await connectToDatabase();

  try {
    // Get the admin's user ID from the query parameters
    const { searchParams } = new URL(request.url);
    const adminUserId = searchParams.get("adminUserId");

    if (!adminUserId) {
      return NextResponse.json(
        { error: "Missing adminUserId parameter" },
        { status: 400 }
      );
    }

    // Fetch all requests from the database
    const requests = await Request.find({});

    return NextResponse.json(requests, { status: 200 });
  } catch (error: any) {
    console.error("Failed to fetch requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  await connectToDatabase();

  try {
    const { fromUserId, toUserId, productId, itemType, message } =
      await request.json();

    if (!fromUserId || !toUserId || !productId || !itemType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newRequest = new Request({
      fromUserId,
      toUserId,
      productId,
      itemType,
      message,
    });

    await newRequest.save();

    return NextResponse.json(
      { success: true, requestId: newRequest._id.toString() },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Failed to create request:", error);
    return NextResponse.json(
      { error: "Failed to create request: " + error.message },
      { status: 500 }
    );
  }
}