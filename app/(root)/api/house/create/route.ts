import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db-connect";
import House from "@/lib/models/house.model";
import Payment from "@/lib/models/payment.model";
import { auth } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from "uuid"; // For generating random filenames

const CPANEL_API_URL = process.env.NEXT_PUBLIC_CPANEL_API_URL;
const CPANEL_USERNAME = process.env.NEXT_PUBLIC_CPANEL_USERNAME;
const CPANEL_API_TOKEN = process.env.NEXT_PUBLIC_CPANEL_API_TOKEN;
const PUBLIC_DOMAIN = process.env.NEXT_PUBLIC_DOMAIN;

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
  imageUrls?: string[]; // Added for multiple images
  imageUrl?: string; // Keep for backward compatibility
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

  // Ensure we have a token available
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

// Function to handle multiple image uploads
async function uploadMultipleImages(
  files: File[],
  folder: "public_images" | "receipts"
): Promise<{ success: boolean; publicUrls: string[]; error?: string }> {
  try {
    console.log(
      `Starting upload of ${files.length} files to folder: ${folder}`
    );

    // Process each file one by one
    const publicUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      console.log(
        `Uploading file ${i + 1}/${files.length}: ${files[i].name} (${
          files[i].size
        } bytes)`
      );
      const result = await uploadImage(files[i], folder);

      if (!result.success) {
        console.error(`Failed to upload file ${i + 1}: ${result.error}`);
        return {
          success: false,
          publicUrls,
          error: `Failed to upload file ${i + 1}/${files.length}: ${
            result.error
          }`,
        };
      }

      console.log(`Successfully uploaded file ${i + 1} to ${result.publicUrl}`);
      publicUrls.push(result.publicUrl as string);
    }

    console.log(`All ${files.length} files uploaded successfully`);
    return {
      success: true,
      publicUrls,
    };
  } catch (error) {
    console.error("Multiple image upload error:", error);
    return {
      success: false,
      publicUrls: [],
      error:
        "Failed to upload multiple images: " +
        (error instanceof Error ? error.message : String(error)),
    };
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

    // Handle multiple files - get all files with names containing 'files'
    const files: File[] = [];
    const singleFile = formData.get("file") as File;

    // First check for multiple files
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("files") && value instanceof File) {
        files.push(value);
      }
    }

    // If no multiple files found but a single file exists, use that
    if (files.length === 0 && singleFile && singleFile instanceof File) {
      files.push(singleFile);
    }

    const receiptFile = formData.get("receipt") as File;

    // Get userId - either from auth or form data for admin
    let userId = (formData.get("userId") as string) || "admin-user";

    // Check if this is an admin request
    const isAdmin = formData.get("isAdmin") === "true";

    if (!isAdmin) {
      try {
        const authUserId = (await auth()).userId;
        if (!authUserId) {
          return NextResponse.json(
            { success: false, error: "Unauthorized", paymentId: "" },
            { status: 401 }
          );
        }
        userId = authUserId;
      } catch (error) {
        console.log("Auth error:", error);
        return NextResponse.json(
          { success: false, error: "Authentication failed", paymentId: "" },
          { status: 401 }
        );
      }
    }

    // Generate admin payment ID format that's easily identifiable
    const paymentId = `admin-created-${Date.now()}`;

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
      !houseData.description ||
      !houseData.price ||
      !houseData.advertisementType ||
      !houseData.houseType ||
      !houseData.currency
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields", paymentId: "" },
        { status: 400 }
      );
    }

    // Upload house images if provided
    let imageUrls: string[] = [];
    let imageUrl: string | undefined;

    if (files.length > 0) {
      console.log(`Uploading ${files.length} images to cPanel...`);
      const uploadResults = await uploadMultipleImages(files, "public_images");

      if (!uploadResults.success) {
        console.error("Image uploads failed:", uploadResults.error);
        return NextResponse.json(
          { success: false, error: uploadResults.error, paymentId: "" },
          { status: 500 }
        );
      }

      imageUrls = uploadResults.publicUrls;
      imageUrl = imageUrls[0]; // Set the first image as the main imageUrl for backward compatibility
      console.log(`${imageUrls.length} images uploaded successfully`);
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

    // Save house with image URLs and receipt details
    console.log("Saving house to MongoDB with image URLs:", imageUrls);
    const houseToSave = new House({
      ...houseData,
      imageUrls: imageUrls, // Explicitly assign the array
      imageUrl, // Keep for backward compatibility
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
      imageUrls: houseToSave.imageUrls, // Log the image URLs being saved
      imageUrlsLength: houseToSave.imageUrls ? houseToSave.imageUrls.length : 0,
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
