import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db-connect";
import User from "@/lib/models/user.model";

// This endpoint cleans up test users from the database
export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    // Only allow authenticated users to run this test
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const data = await req.json();
    const { clerkId, all = false } = data;

    // If clerkId is provided, remove that specific test user
    if (clerkId) {
      const result = await User.findOneAndDelete({ clerkId });

      if (!result) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({
        message: "Test user deleted successfully",
        user: {
          clerkId: result.clerkId,
          firstName: result.firstName,
          lastName: result.lastName,
          email: result.email,
        },
      });
    }

    // If all is true, remove all test users (those with clerkId starting with "test_" or "user_test")
    if (all) {
      const result = await User.deleteMany({
        $or: [
          { clerkId: { $regex: /^test_/ } },
          { clerkId: { $regex: /^user_test/ } },
        ],
      });

      return NextResponse.json({
        message: "All test users deleted",
        count: result.deletedCount,
      });
    }

    return NextResponse.json(
      { error: "Either clerkId or all=true must be provided" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in cleanup:", error);
    return NextResponse.json(
      {
        error: "Cleanup failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
