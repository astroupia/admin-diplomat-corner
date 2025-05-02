import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db-connect";
import Car from "@/lib/models/car.model";
import Payment from "@/lib/models/payment.model";
import { auth } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from "uuid";

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
    const formData = await req.formData();
    const isAdmin = formData.get("isAdmin") === "true";

    // Get userId from auth, or use "admin-user" for admin requests
    let userId: string;
    if (isAdmin) {
      userId = "admin-user";
    } else {
      // Regular user - require authentication
      const authUserId = (await auth()).userId;
      if (!authUserId) {
        return NextResponse.json(
          { success: false, error: "Unauthorized", paymentId: "" },
          { status: 401 }
        );
      }
      userId = authUserId;
    }

    // Handle multiple files
    const files: File[] = [];
    const singleFile = formData.get("file") as File;

    // First check for multiple files
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("files") && value instanceof File) {
        console.log(`Found file with key: ${key}`);
        files.push(value);
      }
    }

    // If no multiple files found but a single file exists, use that
    if (files.length === 0 && singleFile && singleFile instanceof File) {
      console.log("No files[] entries found, using single file instead");
      files.push(singleFile);
    }

    console.log(`Total files to process: ${files.length}`);

    const receiptFile = formData.get("receipt") as File;

    const carData = {
      name: formData.get("name") as string,
      year: Number(formData.get("year")),
      mileage: Number(formData.get("mileage")),
      speed: Number(formData.get("speed")),
      milesPerGallon: Number(formData.get("milesPerGallon")),
      transmission: formData.get("transmission") as string,
      fuel: formData.get("fuel") as string,
      bodyType: formData.get("bodyType") as string,
      condition: formData.get("condition") as string,
      engine: formData.get("engine") as string,
      maintenance: formData.get("maintenance") as string,
      price: Number(formData.get("price")),
      description: formData.get("description") as string,
      advertisementType: formData.get("advertisementType") as "Rent" | "Sale",
      paymentMethod: (() => {
        // Convert numeric value to string enum value
        const methodValue = formData.get("paymentMethod") as string;

        // Handle numeric values for backward compatibility
        if (methodValue === "1") return "Daily";
        if (methodValue === "2") return "Weekly";
        if (methodValue === "3") return "Monthly";
        if (methodValue === "4") return "Annually";

        // If it's already a string value, use it directly
        if (["Daily", "Weekly", "Monthly", "Annually"].includes(methodValue)) {
          return methodValue;
        }

        // Default to Daily
        return "Daily";
      })(),
      currency: formData.get("currency") as string,
      tags: formData.get("tags") as string,
      userId,
      visiblity: "Private",
      status: "Pending",
      createdAt: new Date(),
      updatedAt: new Date(),
      timestamp: new Date().toISOString(),
    };

    // Validate required fields
    if (!carData.name || !carData.price || !carData.mileage) {
      console.log("Validation failed: Missing required fields", carData);
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: name, price, and mileage are required",
          paymentId: "",
        },
        { status: 400 }
      );
    }

    // Generate payment ID for admin
    const paymentId = `admin-created-${Date.now()}`;

    // Upload car images
    let imageUrls: string[] = [];
    let imageUrl = "";

    if (files.length > 0) {
      console.log(`Uploading ${files.length} car images...`);
      const uploadResults = await uploadMultipleImages(files, "public_images");

      if (!uploadResults.success) {
        return NextResponse.json(
          {
            success: false,
            error: uploadResults.error,
            paymentId: "",
          },
          { status: 500 }
        );
      }

      imageUrls = uploadResults.publicUrls;
      imageUrl = imageUrls[0]; // Set first image as main image for backward compatibility
      console.log(`${imageUrls.length} images uploaded successfully`);
    }

    // Upload receipt
    let receiptUrl = "";
    if (receiptFile) {
      const uploadResult = await uploadImage(receiptFile, "receipts");
      if (!uploadResult.success) {
        return NextResponse.json(
          { success: false, error: uploadResult.error, paymentId: "" },
          { status: 500 }
        );
      }
      receiptUrl = uploadResult.publicUrl!;
    }

    await connectToDatabase();

    // Create car
    const car = await Car.create({
      ...carData,
      imageUrls: imageUrls,
      imageUrl,
      paymentId,
      visiblity: isAdmin ? "Public" : "Private",
      status: isAdmin ? "Active" : "Pending",
    });

    console.log(
      `Car created with ID: ${car._id}, imageUrls: ${JSON.stringify(
        imageUrls
      )}, imageUrl: ${imageUrl}, number of images: ${imageUrls.length}`
    );

    // Create payment record only if not created by admin
    if (!isAdmin) {
      await Payment.create({
        paymentId,
        servicePrice: Number(formData.get("servicePrice")),
        receiptUrl,
        productId: car._id.toString(),
        productType: "car",
        userId,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Car created successfully",
      carId: car._id.toString(),
      paymentId,
    });
  } catch (error) {
    console.error("Car creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to create car: " +
          (error instanceof Error ? error.message : String(error)),
        paymentId: "",
      },
      { status: 500 }
    );
  }
}
