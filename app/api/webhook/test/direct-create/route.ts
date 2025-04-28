import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db-connect";
import User from "@/lib/models/user.model";

// This endpoint directly tests the user creation functionality
export async function POST(req: Request) {
  try {
    // Temporarily disable authentication for testing
    // const { userId } = await auth();
    // // Only allow authenticated users to run this test
    // if (!userId) {
    //   return NextResponse.json(
    //     { error: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }

    await connectToDatabase();

    // You can provide your own test data or use the default test data
    const data = await req.json();

    // Generate a unique test ID to avoid conflicts
    const testId = "test_" + Date.now().toString();

    // Create test user data
    const testUserData = {
      clerkId: data.clerkId || `user_${testId}`,
      email: data.email || `test_${testId}@example.com`,
      firstName: data.firstName || "Test",
      lastName: data.lastName || "User",
      imageUrl: data.imageUrl || "https://example.com/avatar.jpg",
      role: "customer",
    };

    // Check if a test user with this clerk ID already exists
    const existingUser = await User.findOne({ clerkId: testUserData.clerkId });
    if (existingUser) {
      return NextResponse.json(
        {
          message: "Test user already exists",
          user: existingUser,
          note: "Use a different clerkId or delete this user first",
        },
        { status: 200 }
      );
    }

    // Create the test user directly in our database using our API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testUserData),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to create test user",
          details: result.error || result.details,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      message: "Test user created successfully",
      testUser: result.user,
      nextSteps: [
        "Verify user exists in your database",
        "Test update by sending a PATCH request to /api/users with the same clerkId",
        "When done testing, delete the test user from your database",
      ],
    });
  } catch (error) {
    console.error("Error in direct test:", error);
    return NextResponse.json(
      {
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
