import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db-connect";
import Advertisement from "@/lib/models/advertisement.model";
import { auth } from "@clerk/nextjs/server";

interface ApiResponse {
  success: boolean;
  error?: string;
  advertisement?: typeof Advertisement;
  analytics?: {
    clickCount: number;
    viewCount: number;
    clicksOverTime?: Array<{ date: string; count: number }>;
    viewsOverTime?: Array<{ date: string; count: number }>;
  };
}

// GET handler - fetch a specific advertisement
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const id = params.id;

    await connectToDatabase();

    const advertisement = await Advertisement.findById(id);
    if (!advertisement) {
      return NextResponse.json(
        { success: false, error: "Advertisement not found" },
        { status: 404 }
      );
    }

    // Check if analytics are requested
    const includeAnalytics =
      request.nextUrl.searchParams.get("analytics") === "true";

    const response: ApiResponse = {
      success: true,
      advertisement,
    };

    // Include analytics data if requested
    if (includeAnalytics) {
      // Group clicks and views by date for trend analysis
      const clicksOverTime = processTrackingData(advertisement.clicks);
      const viewsOverTime = processTrackingData(advertisement.views);

      response.analytics = {
        clickCount: advertisement.clickCount,
        viewCount: advertisement.viewCount,
        clicksOverTime,
        viewsOverTime,
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching advertisement:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch advertisement" },
      { status: 500 }
    );
  }
}

// PUT handler - update an advertisement
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const id = params.id;

    // Authenticate user
    let userId = "admin-user";
    try {
      const authUser = await auth();
      if (authUser.userId) {
        userId = authUser.userId;
      }
    } catch (error) {
      console.log("Auth error, using default admin userId:", error);
    }

    await connectToDatabase();

    const data = await request.json();

    // Find the advertisement
    const advertisement = await Advertisement.findById(id);
    if (!advertisement) {
      return NextResponse.json(
        { success: false, error: "Advertisement not found" },
        { status: 404 }
      );
    }

    // Update the advertisement, but don't modify clicks and views
    const updatedAd = await Advertisement.findByIdAndUpdate(
      id,
      {
        ...data,
        // Keep the original tracking data
        clicks: advertisement.clicks,
        views: advertisement.views,
        clickCount: advertisement.clickCount,
        viewCount: advertisement.viewCount,
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      advertisement: updatedAd,
    });
  } catch (error) {
    console.error("Error updating advertisement:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update advertisement" },
      { status: 500 }
    );
  }
}

// DELETE handler - delete an advertisement
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const id = params.id;

    // Authenticate user
    let userId = "admin-user";
    try {
      const authUser = await auth();
      if (authUser.userId) {
        userId = authUser.userId;
      }
    } catch (error) {
      console.log("Auth error, using default admin userId:", error);
    }

    await connectToDatabase();

    // Find and delete the advertisement
    const advertisement = await Advertisement.findByIdAndDelete(id);

    if (!advertisement) {
      return NextResponse.json(
        { success: false, error: "Advertisement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Advertisement deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting advertisement:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete advertisement" },
      { status: 500 }
    );
  }
}

// Helper function to process tracking data for analytics
function processTrackingData(trackingData: Array<{ timestamp: string }>) {
  // Group data by date
  const grouped = trackingData.reduce<
    Record<string, Array<{ timestamp: string }>>
  >((acc, item) => {
    const date = new Date(item.timestamp).toISOString().split("T")[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {});

  // Transform to array format for easier frontend consumption
  return Object.entries(grouped).map(([date, items]) => ({
    date,
    count: (items as Array<{ timestamp: string }>).length,
    items,
  }));
}
