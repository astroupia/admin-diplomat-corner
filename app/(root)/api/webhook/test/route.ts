import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db-connect";
import User from "@/lib/models/user.model";

// This endpoint is for testing webhook functionality manually
export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const data = await req.json();
    const { clerkId } = data;

    if (!clerkId) {
      return NextResponse.json(
        { error: "Clerk ID is required" },
        { status: 400 }
      );
    }

    // Check if the user exists in our database
    const existingUser = await User.findOne({ clerkId });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "User found in database",
        user: {
          clerkId: existingUser.clerkId,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          email: existingUser.email,
          role: existingUser.role,
          imageUrl: existingUser.imageUrl,
          createdAt: existingUser.createdAt,
          updatedAt: existingUser.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error testing webhook:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Failed to test webhook", details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to test webhook", details: "An unknown error occurred" },
      { status: 500 }
    );
  }
}
