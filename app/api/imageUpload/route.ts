import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

interface UploadResponse {
  success: boolean;
  publicUrl?: string;
  error?: string;
}

const CPANEL_API_URL = process.env.NEXT_PUBLIC_CPANEL_API_URL;
const CPANEL_USERNAME = process.env.NEXT_PUBLIC_CPANEL_USERNAME;
const CPANEL_API_TOKEN = process.env.NEXT_PUBLIC_CPANEL_API_TOKEN;
const PUBLIC_DOMAIN = process.env.NEXT_PUBLIC_PUBLIC_DOMAIN;

if (
  !CPANEL_API_URL ||
  !CPANEL_USERNAME ||
  !CPANEL_API_TOKEN ||
  !PUBLIC_DOMAIN
) {
  throw new Error("Missing required cPanel environment variables");
}

// Define the cPanel API response structure
interface CpanelResponse {
  status: number;
  errors?: string[] | null;
  data?: {
    succeeded: number;
    failed: number;
    warned: number;
    uploads: {
      size: number;
      warnings: string[];
      file: string;
      reason: string;
      status: number;
    }[];
  };
  warnings?: string[] | null;
  messages?: string[] | null;
  metadata?: Record<string, any>;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<UploadResponse>> {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString("base64");

    const response = await fetch(
      `${CPANEL_API_URL}/execute/Fileman/upload_files`,
      {
        method: "POST",
        headers: {
          Authorization: `cpanel ${CPANEL_USERNAME}:${CPANEL_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dir: "/public_html/uploads",
          file: {
            name: file.name,
            data: base64Data,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload file to cPanel");
    }

    const data = await response.json();
    const fileUrl = `${PUBLIC_DOMAIN}/uploads/${file.name}`;

    return NextResponse.json({ success: true, publicUrl: fileUrl });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
