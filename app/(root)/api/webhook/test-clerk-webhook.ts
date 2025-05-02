import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db-connect";

// Simulates a Clerk webhook event for user creation
export async function POST(req: Request) {
  try {
    await connectToDatabase();

    // Sample Clerk webhook payload for user creation
    const mockClerkPayload = {
      data: {
        id: "user_test123456789",
        banned: false,
        created_at: Date.now(),
        email_addresses: [
          {
            created_at: Date.now(),
            email_address: "test@example.com",
            id: "idn_test123456789",
            linked_to: [
              {
                id: "idn_test_oauth123456789",
                type: "oauth_google",
              },
            ],
            matches_sso_connection: false,
            object: "email_address",
            reserved: false,
            updated_at: Date.now(),
            verification: {
              status: "verified",
              strategy: "from_oauth_google",
            },
          },
        ],
        external_accounts: [
          {
            approved_scopes:
              "email https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid profile",
            avatar_url: "https://example.com/avatar.jpg",
            email_address: "test@example.com",
            family_name: "User",
            first_name: "Test",
            given_name: "Test",
            id: "idn_test_oauth123456789",
            image_url: "https://example.com/image.jpg",
            provider: "oauth_google",
            public_metadata: {},
            verification: {
              status: "verified",
              strategy: "oauth_google",
            },
          },
        ],
        first_name: "Test",
        has_image: true,
        image_url: "https://example.com/image.jpg",
        last_name: "User",
        object: "user",
        profile_image_url: "https://example.com/profile.jpg",
        primary_email_address_id: "idn_test123456789",
        public_metadata: {},
      },
      event_attributes: {
        http_request: {
          client_ip: "127.0.0.1",
          user_agent: "Test Agent",
        },
      },
      object: "event",
      timestamp: Date.now(),
      type: "user.created",
    };

    // Forward the mock payload to our webhook handler
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/webhook/clerk`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add dummy SVIX headers that our webhook handler expects
          "svix-id": "test_msg_" + Date.now(),
          "svix-timestamp": Date.now().toString(),
          "svix-signature": "placeholder_signature", // Note: This will fail verification
        },
        body: JSON.stringify(mockClerkPayload),
      }
    );

    // This will likely fail due to signature verification
    const result = await response.text();

    return NextResponse.json({
      message: "Test webhook attempt completed",
      note: "The actual webhook handler likely rejected this due to invalid signatures. Use the direct test endpoint instead.",
      status: response.status,
      response: result,
    });
  } catch (error) {
    console.error("Error testing webhook:", error);
    return NextResponse.json(
      {
        error: "Error in test webhook",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
