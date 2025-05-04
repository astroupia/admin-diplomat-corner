import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db-connect";
import { NextRequest, NextResponse } from "next/server";

// Define a more specific type for the Clerk user data
interface ClerkUserData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email_addresses: Array<{
    email_address: string;
    id: string;
    verification: {
      status: string;
    };
  }>;
  image_url: string | null;
  profile_image_url: string | null;
  external_accounts?: Array<{
    image_url?: string;
  }>;
}

// Explicitly define all the HTTP methods that are allowed
export async function GET() {
  return new NextResponse(
    "Webhook endpoint is working, but expects POST requests",
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  // Log incoming request details
  console.log("Webhook received: POST request to /api/webhook/clerk");
  console.log("Headers:", Object.fromEntries(req.headers.entries()));

  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
    return new NextResponse("Webhook secret is missing", { status: 500 });
  }

  // Get the headers from the request directly
  const svix_id = req.headers.get("svix-id");
  const svix_timestamp = req.headers.get("svix-timestamp");
  const svix_signature = req.headers.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("svix headers are missing");
    return new NextResponse("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  let payload;
  try {
    payload = await req.json();
  } catch (error) {
    console.error("Error parsing request body:", error);
    return new NextResponse("Invalid JSON in request body", { status: 400 });
  }

  const body = JSON.stringify(payload);
  console.log("Webhook payload:", body);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new NextResponse("Error verifying webhook signature", {
      status: 400,
    });
  }

  const eventType = evt.type;
  console.log(`Received event ${eventType}`);

  if (eventType === "user.created") {
    try {
      // Extract data from the Clerk webhook payload and cast to our interface
      const userData = evt.data as unknown as ClerkUserData;
      const {
        id,
        first_name,
        last_name,
        email_addresses,
        image_url,
        profile_image_url,
        external_accounts,
      } = userData;

      // Get primary email from the email addresses array
      const primaryEmail = email_addresses?.[0]?.email_address || "";

      // Get profile image - try profile_image_url first, then image_url, then from external accounts
      let userImageUrl = profile_image_url || image_url || "";
      if (!userImageUrl && external_accounts?.[0]?.image_url) {
        userImageUrl = external_accounts[0].image_url;
      }

      // Prepare user data for our API
      const userDbData = {
        clerkId: id,
        email: primaryEmail,
        firstName: first_name || "",
        lastName: last_name || "",
        imageUrl: userImageUrl,
        role: "customer",
      };

      console.log("Prepared user data:", JSON.stringify(userDbData));

      // Determine the API URL to use
      const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || "";
      if (!apiUrl) {
        console.error("NEXT_PUBLIC_SERVER_URL is missing");
        return NextResponse.json(
          { error: "Server URL not configured" },
          { status: 500 }
        );
      }

      // Call our API to create the user
      const response = await fetch(`${apiUrl}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userDbData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create user");
      }

      console.log("User created successfully:", JSON.stringify(result));
      return NextResponse.json(
        { message: "User created successfully", user: result.user },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error creating user:", error);
      if (error instanceof Error) {
        return NextResponse.json(
          { error: "Failed to create user", details: error.message },
          { status: 500 }
        );
      }
      return NextResponse.json(
        {
          error: "Failed to create user",
          details: "An unknown error occurred",
        },
        { status: 500 }
      );
    }
  }

  if (eventType === "user.updated") {
    try {
      // Extract data from the Clerk webhook payload and cast to our interface
      const userData = evt.data as unknown as ClerkUserData;
      const {
        id,
        first_name,
        last_name,
        email_addresses,
        image_url,
        profile_image_url,
      } = userData;

      // Get primary email from the email addresses array
      const primaryEmail = email_addresses?.[0]?.email_address;

      // Get profile image
      const userImageUrl = profile_image_url || image_url || "";

      // Prepare user data for our API
      const userDbData: {
        clerkId: string;
        firstName: string | null;
        lastName: string | null;
        imageUrl: string;
        email?: string;
      } = {
        clerkId: id,
        firstName: first_name,
        lastName: last_name,
        imageUrl: userImageUrl,
      };

      // Only include email if it exists
      if (primaryEmail) {
        userDbData.email = primaryEmail;
      }

      // Determine the API URL to use
      const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || "";
      if (!apiUrl) {
        console.error("NEXT_PUBLIC_SERVER_URL is missing");
        return NextResponse.json(
          { error: "Server URL not configured" },
          { status: 500 }
        );
      }

      // Call our API to update the user
      const response = await fetch(`${apiUrl}/api/users`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userDbData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update user");
      }

      console.log("User updated successfully:", JSON.stringify(result));
      return NextResponse.json(
        { message: "User updated successfully", user: result.user },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error updating user:", error);
      if (error instanceof Error) {
        return NextResponse.json(
          { error: "Failed to update user", details: error.message },
          { status: 500 }
        );
      }
      return NextResponse.json(
        {
          error: "Failed to update user",
          details: "An unknown error occurred",
        },
        { status: 500 }
      );
    }
  }

  if (eventType === "user.deleted") {
    try {
      // Extract the Clerk user ID
      const userData = evt.data as unknown as ClerkUserData;
      const { id } = userData;

      // Determine the API URL to use
      const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || "";
      if (!apiUrl) {
        console.error("NEXT_PUBLIC_SERVER_URL is missing");
        return NextResponse.json(
          { error: "Server URL not configured" },
          { status: 500 }
        );
      }

      // Call our API to delete the user
      const response = await fetch(`${apiUrl}/api/users/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete user");
      }

      console.log("User deleted successfully:", JSON.stringify(result));
      return NextResponse.json(
        { message: "User deleted successfully" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error deleting user:", error);
      if (error instanceof Error) {
        return NextResponse.json(
          { error: "Failed to delete user", details: error.message },
          { status: 500 }
        );
      }
      return NextResponse.json(
        {
          error: "Failed to delete user",
          details: "An unknown error occurred",
        },
        { status: 500 }
      );
    }
  }

  // If we get here, we've received a webhook event we're not explicitly handling
  console.log(`Unhandled webhook event type: ${eventType}`);
  return new NextResponse(`Webhook event received: ${eventType}`, {
    status: 200,
  });
}
