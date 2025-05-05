import { connectToDatabase } from "@/lib/db-connect";
import Car from "@/lib/models/car.model";
import { NextRequest, NextResponse } from "next/server";
import Payment from "@/lib/models/payment.model";
import { auth } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from "uuid";
import { checkAdminAccess } from "@/lib/auth-utils";

const CPANEL_API_URL = "https://diplomatcorner.net:2083";
const CPANEL_USERNAME = "diplomvv";
const CPANEL_API_TOKEN = "2JL5W3RUMNY0KOX451GL2PPY4L8RX9RS";
const PUBLIC_DOMAIN = "https://diplomatcorner.net";

interface ApiResponse {
  success: boolean;
  error?: string;
  message?: string;
  carId?: string;
  paymentId?: string;
  cars?: (typeof Car)[];
}

async function uploadImage(
  file: File,
  folder: "public_images" | "receipts"
): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
  const extension = file.name.split(".").pop();
  const randomFileName = `${uuidv4()}.${extension}`;

  const uploadFolder =
    folder === "receipts" ? "public_images/receipts" : folder;

  const apiFormData = new FormData();
  apiFormData.append("dir", `/public_html/${uploadFolder}/`);
  apiFormData.append("file-1", file, randomFileName);

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
    console.error("Image upload error:", error);
    return { success: false, error: "Failed to upload image" };
  }
}

export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const requestedUserId = searchParams.get("userId");
    const status = searchParams.get("status");
    const visibility = searchParams.get("visibility");
    const isAdminView = searchParams.get("admin") === "true";

    // For admin-only views, perform authorization check
    if (isAdminView) {
      const adminCheck = await checkAdminAccess(userId);
      if (!adminCheck.isAdmin) {
        return NextResponse.json(
          {
            success: false,
            error: adminCheck.error || "Admin access required",
          },
          { status: 403 }
        );
      }
    }

    await connectToDatabase();

    // Build query
    const query: {
      userId?: string;
      status?: string;
      visibility?: string;
    } = {};

    // If user is querying for specific user data and not their own, check for admin rights
    if (requestedUserId && requestedUserId !== userId) {
      // Only admins can view other users' data
      const adminCheck = await checkAdminAccess(userId);
      if (!adminCheck.isAdmin) {
        return NextResponse.json(
          { success: false, error: "Not authorized to view other users' data" },
          { status: 403 }
        );
      }
      query.userId = requestedUserId;
    } else if (requestedUserId) {
      // User is querying their own data
      query.userId = requestedUserId;
    }

    if (status) query.status = status;
    if (visibility) query.visibility = visibility;

    const cars = await Car.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      cars,
    });
  } catch (error) {
    console.error("Error fetching cars:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cars" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse>> {
  // Redirect POST requests to the create route
  const createUrl = new URL("/api/cars/create", req.url);
  return NextResponse.redirect(createUrl) as NextResponse<ApiResponse>;
}
