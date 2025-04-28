import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// This route can be used to create webhooks programmatically
export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    // Check if user is authorized (is an admin)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { webhookUrl, events } = data;

    if (!webhookUrl) {
      return NextResponse.json(
        { error: "Webhook URL is required" },
        { status: 400 }
      );
    }

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: "Events array is required" },
        { status: 400 }
      );
    }

    // We use fetch to make a request to Clerk's API to create a webhook
    const response = await fetch("https://api.clerk.com/v1/webhooks", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: webhookUrl,
        events: events,
        active: true,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to create webhook", details: responseData },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: "Webhook created successfully", webhook: responseData },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating webhook:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Failed to create webhook", details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        error: "Failed to create webhook",
        details: "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
