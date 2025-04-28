import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db-connect";
import User from "@/lib/models/user.model";

// This endpoint directly tests the user update functionality
export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    // Only allow authenticated users to run this test
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const data = await req.json();
    const { clerkId } = data;

    if (!clerkId) {
      return NextResponse.json(
        { error: "clerkId is required to update a user" },
        { status: 400 }
      );
    }

    // Check if the user exists first
    const existingUser = await User.findOne({ clerkId });
    if (!existingUser) {
      return NextResponse.json(
        {
          error: "User not found",
          note: "Create a test user first using the direct-create endpoint",
        },
        { status: 404 }
      );
    }

    // Prepare update data - only include fields that were provided
    const updateData: {
      clerkId: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      imageUrl?: string;
    } = {
      clerkId: clerkId,
    };

    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;

    // Call our API to update the user
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to update test user",
          details: result.error || result.details,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      message: "Test user updated successfully",
      original: {
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
        imageUrl: existingUser.imageUrl,
      },
      updated: result.user,
      changesApplied: Object.keys(updateData).filter(
        (key) => key !== "clerkId"
      ),
    });
  } catch (error) {
    console.error("Error in update test:", error);
    return NextResponse.json(
      {
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
