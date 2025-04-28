import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db-connect";
import Message from "@/lib/models/message.model";

export async function GET() {
  try {
    await connectToDatabase();

    const messages = await Message.find().sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, data: messages },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "subject",
      "message",
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create the message
    const message = await Message.create(body);

    return NextResponse.json(
      { success: true, message: "Message sent successfully", data: message },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating message:", error);

    const mongooseError = error as {
      errors?: Record<string, { path: string; message: string }>;
    };

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send message",
        errors: mongooseError.errors
          ? Object.values(mongooseError.errors).map((err) => ({
              field: err.path,
              message: err.message,
            }))
          : undefined,
      },
      { status: 500 }
    );
  }
}
