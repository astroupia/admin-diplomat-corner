import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db-connect";
import Advertisement from "@/lib/models/advertisement.model";
import { auth } from "@clerk/nextjs/server";

interface ApiResponse {
  success: boolean;
  error?: string;
  advertisements?: any[];
  advertisement?: any;
}

// GET handler - fetch all advertisements with optional filters
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const advertisementType = searchParams.get("type");

    const query: any = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (advertisementType) query.advertisementType = advertisementType;

    const advertisements = await Advertisement.find(query).sort({
      timestamp: -1,
    });

    return NextResponse.json({
      success: true,
      advertisements,
    });
  } catch (error) {
    console.error("Error fetching advertisements:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch advertisements" },
      { status: 500 }
    );
  }
}

// POST handler - create a new advertisement
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    // Get user ID from auth
    let userId = "guest";
    try {
      const authUser = await auth();
      if (authUser.userId) {
        userId = authUser.userId;
      }
    } catch (error) {
      console.log("Auth error, using guest userId:", error);
    }

    await connectToDatabase();

    const data = await request.json();

    // Validate required fields
    if (
      !data.title ||
      !data.description ||
      !data.advertisementType ||
      !data.link
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Add timestamp and defaults
    const newAdvertisement = new Advertisement({
      ...data,
      timestamp: new Date().toISOString(),
      clickCount: 0,
      viewCount: 0,
      // Set default status if not provided
      status: data.status || "Draft",
      // Set default priority if not provided
      priority: data.priority || "Medium",
    });

    const savedAdvertisement = await newAdvertisement.save();

    return NextResponse.json({
      success: true,
      advertisement: savedAdvertisement,
    });
  } catch (error) {
    console.error("Error creating advertisement:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create advertisement" },
      { status: 500 }
    );
  }
}
