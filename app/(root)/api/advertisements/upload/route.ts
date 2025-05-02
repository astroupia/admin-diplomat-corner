import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@clerk/nextjs/server";

// Environment variables
const CPANEL_API_URL = process.env.CPANEL_API_URL;
const CPANEL_USERNAME = process.env.CPANEL_USERNAME;
const CPANEL_API_TOKEN = process.env.CPANEL_API_TOKEN;
const PUBLIC_DOMAIN = process.env.PUBLIC_DOMAIN;

interface ApiResponse {
  success: boolean;
  error?: string;
  imageUrl?: string;
}

async function uploadImage(
  file: File
): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
  const extension = file.name.split(".").pop();
  const randomFileName = `ad_${uuidv4()}.${extension}`;
  const uploadFolder = "public_images/advertisements";

  const apiFormData = new FormData();
  apiFormData.append("dir", `/public_html/${uploadFolder}/`);
  apiFormData.append("file-1", file, randomFileName);

  if (!CPANEL_API_TOKEN) {
    return { success: false, error: "CPanel API token is not configured" };
  }

  const authHeader = `cpanel ${CPANEL_USERNAME}:${CPANEL_API_TOKEN.trim()}`;

  try {
    const response = await fetch(
      `${CPANEL_API_URL}/execute/Fileman/upload_files`,
      {
        method: "POST",
        headers: { Authorization: authHeader },
        body: apiFormData,
      }
    );

    const data = await response.json();

    if (data.status === 0) {
      return {
        success: false,
        error: data.errors?.join(", ") || "Upload failed",
      };
    }

    const uploadedFile = data.data?.uploads[0];
    if (!uploadedFile || !uploadedFile.file) {
      return { success: false, error: "No uploaded file details returned" };
    }

    const publicUrl = `${PUBLIC_DOMAIN}/${uploadFolder}/${uploadedFile.file}`;
    return { success: true, publicUrl };
  } catch (error) {
    console.error("Advertisement image upload error:", error);
    return { success: false, error: "Failed to upload image" };
  }
}

// POST handler - upload advertisement image
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    // Get user ID from auth
    let userId = "guest";
    try {
      const authUser = await auth();
      if (authUser.userId) {
        userId = authUser.userId;
      }
    } catch (error) {
      console.log("Auth error, using guest userId:", error);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Check file type
    const fileType = file.type;
    if (!fileType.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "File must be an image" },
        { status: 400 }
      );
    }

    // Upload the image
    const uploadResult = await uploadImage(file);
    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, error: uploadResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl: uploadResult.publicUrl,
    });
  } catch (error) {
    console.error("Error uploading advertisement image:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
