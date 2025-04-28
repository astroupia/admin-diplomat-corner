import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db-connect";
import User from "@/lib/models/user.model";

// This endpoint lists all test users in the database
export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    // Only allow authenticated users to run this
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Find all test users (those with clerkId starting with "test_" or "user_test")
    const testUsers = await User.find({
      $or: [
        { clerkId: { $regex: /^test_/ } },
        { clerkId: { $regex: /^user_test/ } },
      ],
    });

    return NextResponse.json({
      message: "Test users found",
      count: testUsers.length,
      users: testUsers.map((user) => ({
        clerkId: user.clerkId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error listing test users:", error);
    return NextResponse.json(
      {
        error: "Failed to list test users",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
