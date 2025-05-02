import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db-connect";
import House from "@/lib/models/house.model";
import Payment from "@/lib/models/payment.model";
import { auth } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from "uuid"; // For generating random filenames

const CPANEL_API_URL = "https://diplomatcorner.net:2083";
const CPANEL_USERNAME = "diplomvv";
const CPANEL_API_TOKEN = "2JL5W3RUMNY0KOX451GL2PPY4L8RX9RS";
const PUBLIC_DOMAIN = "https://diplomatcorner.net";

interface HouseFormData {
  name: string;
  bedroom: number;
  size: number;
  bathroom: number;
  parkingSpace: number; // Added parkingSpace
  condition: string;
  maintenance: string;
  price: number;
  description: string;
  advertisementType: "Rent" | "Sale";
  paymentMethod: "Monthly" | "Quarterly" | "Annual";
  houseType: "House" | "Apartment" | "Guest House";
  essentials: string[];
  currency: string;
  imageUrl?: string;
  userId?: string;
  createdAt?: Date;
  paymentId: string;
  visibility: "Private" | "Public";
  status: "Pending" | "Active";
  paymentReceipt?: {
    url: string;
    paymentId: string;
    uploadedAt: Date;
  };
}

interface ApiResponse {
  success: boolean;
  error?: string;
  message?: string;
  houseId?: string;
  paymentId?: string;
}

async function uploadImage(
  file: File,
  folder: "public_images" | "receipts"
): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
  const extension = file.name.split(".").pop();
  const randomFileName = `${uuidv4()}.${extension}`;

  // Use nested folder structure for receipts
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

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("cPanel API returned non-JSON response");
      return {
        success: false,
        error: "Image upload service unavailable. Please try again later.",
      };
    }

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

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    // Connect to database first
    await connectToDatabase();

    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const receiptFile = formData.get("receipt") as File;

    // Get userId - either from auth or form data for admin
    let userId = (formData.get("userId") as string) || "admin-user";
    try {
      const authUserId = (await auth()).userId;
      if (authUserId) {
        userId = authUserId;
      }
    } catch (error) {
      console.log("Auth error, using default userId:", error);
    }

    // Generate payment ID
    const paymentId =
      (formData.get("paymentId") as string) || `${Date.now()}-${uuidv4()}`;

    // Parse essentials properly
    let essentials: string[] = [];
    try {
      const essentialsString = formData.get("essentials") as string;
      if (essentialsString) {
        essentials = JSON.parse(essentialsString);
      }
    } catch (e) {
      console.error("Error parsing essentials:", e);
      // Continue with empty array
    }

    // Get visibility setting
    const visibilitySetting =
      (formData.get("visibility") as "Private" | "Public") || "Public";

    const houseData: HouseFormData = {
      name: formData.get("name") as string,
      bedroom: Number(formData.get("bedroom") || 0),
      size: Number(formData.get("size") || 0),
      bathroom: Number(formData.get("bathroom") || 0),
      parkingSpace: Number(formData.get("parkingSpace") || 0),
      condition: (formData.get("condition") as string) || "",
      maintenance: (formData.get("maintenance") as string) || "",
      price: Number(formData.get("price") || 0),
      description: formData.get("description") as string,
      advertisementType:
        (formData.get("advertisementType") as "Rent" | "Sale") || "Sale",
      paymentMethod:
        (formData.get("paymentMethod") as "Monthly" | "Quarterly" | "Annual") ||
        "Monthly",
      houseType:
        (formData.get("houseType") as "House" | "Apartment" | "Guest House") ||
        "House",
      essentials: essentials,
      currency: (formData.get("currency") as string) || "USD",
      userId,
      createdAt: new Date(),
      paymentId,
      visibility: visibilitySetting,
      status: (formData.get("status") as "Pending" | "Active") || "Pending",
    };

    // Validate required fields
    if (
      !houseData.name ||
      !houseData.price ||
      !houseData.description ||
      !houseData.advertisementType ||
      !houseData.houseType ||
      !houseData.currency
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields", paymentId: "" },
        { status: 400 }
      );
    }

    // Upload house image if provided
    let imageUrl: string | undefined;
    if (file) {
      console.log("Uploading image to cPanel...");
      const uploadResult = await uploadImage(file, "public_images");
      if (!uploadResult.success) {
        console.error("Image upload failed:", uploadResult.error);
        return NextResponse.json(
          { success: false, error: uploadResult.error, paymentId: "" },
          { status: 500 }
        );
      }
      imageUrl = uploadResult.publicUrl;
      console.log("Image uploaded successfully. Public URL:", imageUrl);
    }

    // Upload receipt if provided
    let receiptUrl: string | undefined;
    if (receiptFile) {
      console.log("Uploading receipt to cPanel...");
      const uploadResult = await uploadImage(receiptFile, "receipts");
      if (!uploadResult.success) {
        console.error("Receipt upload failed:", uploadResult.error);
        return NextResponse.json(
          { success: false, error: uploadResult.error, paymentId: "" },
          { status: 500 }
        );
      }
      receiptUrl = uploadResult.publicUrl;
      console.log("Receipt uploaded successfully. Public URL:", receiptUrl);
    }

    // Save house with image URL and receipt details
    console.log("Saving house to MongoDB with image URL:", imageUrl);
    const houseToSave = new House({
      ...houseData,
      imageUrl,
      // Explicitly set both visibility fields
      visibility: visibilitySetting,
      visiblity: visibilitySetting, // Include the misspelled version for compatibility
      paymentReceipt: receiptUrl
        ? {
            url: receiptUrl,
            paymentId,
            uploadedAt: new Date(),
          }
        : undefined,
    });

    console.log("Saving house with data:", {
      name: houseToSave.name,
      visibility: houseToSave.visibility,
      visiblity: houseToSave.visiblity,
      status: houseToSave.status,
    });

    const result = await houseToSave.save();
    console.log("House saved successfully. ID:", result._id);

    return NextResponse.json({
      success: true,
      message: "House created successfully",
      houseId: result._id.toString(),
    });
  } catch (error) {
    console.error("House creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to create house: " +
          (error instanceof Error ? error.message : String(error)),
        paymentId: "",
      },
      { status: 500 }
    );
  }
}
