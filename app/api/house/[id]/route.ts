import { NextRequest, NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db-connect";
import House from "@/lib/models/house.model";
import { auth } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from "uuid";

const CPANEL_API_URL = process.env.CPANEL_API_URL;
const CPANEL_USERNAME = process.env.CPANEL_USERNAME;
const CPANEL_API_TOKEN = process.env.CPANEL_API_TOKEN;
const PUBLIC_DOMAIN = process.env.PUBLIC_DOMAIN;

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

  const uploadFolder =
    folder === "receipts" ? "public_images/receipts" : folder;

  const apiFormData = new FormData();
  apiFormData.append("dir", `/public_html/${uploadFolder}/`);
  if (!CPANEL_API_TOKEN) {
    return { success: false, error: "CPANEL_API_TOKEN is not defined" };
  }
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
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = await params;
    await connectToDatabase();
    const house = await House.findById(id);

    if (!house) {
      return NextResponse.json(
        { success: false, error: "House not found", paymentId: "" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, ...house.toObject() });
  } catch (error) {
    console.error("Error fetching house:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch house", paymentId: "" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = await params;
    // Use a hardcoded admin user ID instead of Clerk authentication
    const userId = "admin-user-id"; // Hardcoded admin user ID

    await connectToDatabase();
    const existingHouse = await House.findById(id);

    if (!existingHouse) {
      return NextResponse.json(
        { success: false, error: "House not found", paymentId: "" },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const receiptFile = formData.get("receipt") as File;

    const houseData = {
      name: formData.get("name") as string,
      bedroom: Number(formData.get("bedroom")),
      size: Number(formData.get("size")),
      bathroom: Number(formData.get("bathroom")),
      parkingSpace: Number(formData.get("parkingSpace")),
      condition: formData.get("condition") as string,
      maintenance: formData.get("maintenance") as string,
      price: Number(formData.get("price")),
      description: formData.get("description") as string,
      advertisementType: formData.get("advertisementType") as "Rent" | "Sale",
      paymentMethod: formData.get("paymentMethod") as
        | "Monthly"
        | "Quarterly"
        | "Annual",
      houseType: formData.get("houseType") as
        | "House"
        | "Apartment"
        | "Guest House",
      essentials: JSON.parse(formData.get("essentials") as string),
      currency: formData.get("currency") as string,
    };

    // Validate required fields
    if (
      !houseData.name ||
      !houseData.bedroom ||
      !houseData.size ||
      !houseData.bathroom ||
      !houseData.parkingSpace ||
      !houseData.price ||
      !houseData.description
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields", paymentId: "" },
        { status: 400 }
      );
    }

    // Upload new house image if provided
    let imageUrl = existingHouse.imageUrl;
    if (file) {
      const uploadResult = await uploadImage(file, "public_images");
      if (!uploadResult.success) {
        return NextResponse.json(
          { success: false, error: uploadResult.error, paymentId: "" },
          { status: 500 }
        );
      }
      imageUrl = uploadResult.publicUrl;
    }

    // Upload new receipt if provided
    let receiptUrl = existingHouse.paymentReceipt?.url;
    if (receiptFile) {
      const uploadResult = await uploadImage(receiptFile, "receipts");
      if (!uploadResult.success) {
        return NextResponse.json(
          { success: false, error: uploadResult.error, paymentId: "" },
          { status: 500 }
        );
      }
      receiptUrl = uploadResult.publicUrl;
    }

    // Update house
    const updatedHouse = await House.findByIdAndUpdate(
      id,
      {
        ...houseData,
        imageUrl,
        paymentReceipt: receiptUrl
          ? {
              url: receiptUrl,
              paymentId: existingHouse.paymentId,
              uploadedAt: new Date(),
            }
          : existingHouse.paymentReceipt,
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "House updated successfully",
      houseId: updatedHouse._id.toString(),
      paymentId: existingHouse.paymentId,
    });
  } catch (error) {
    console.error("House update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update house", paymentId: "" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = params;
    await connectToDatabase();

    // First, find the house to get its paymentId
    const house = await House.findById(id);

    if (!house) {
      return NextResponse.json(
        { success: false, error: "House not found" },
        { status: 404 }
      );
    }

    // Get payment ID from the house
    const paymentId = house.paymentId;

    // Delete all associated data in parallel
    const deletePromises = [];

    // 1. Delete associated payment (if it exists)
    try {
      const Payment = (await import("@/lib/models/payment.model")).default;
      deletePromises.push(
        Payment.deleteMany({
          $or: [{ productId: id }, { paymentId: paymentId }],
        })
      );
    } catch (error) {
      console.warn("Error importing Payment model:", error);
    }

    // 2. Delete associated reviews (if they exist)
    try {
      const Review = (await import("@/lib/models/review.model")).default;
      deletePromises.push(Review.deleteMany({ productId: id }));
    } catch (error) {
      console.warn("Error importing Review model:", error);
    }

    // 3. Delete associated notifications (if they exist)
    try {
      const Notification = (await import("@/lib/models/notification.model"))
        .default;
      deletePromises.push(
        Notification.deleteMany({
          $or: [{ targetId: id }, { entityId: id }],
        })
      );
    } catch (error) {
      console.warn("Error importing Notification model:", error);
    }

    // 4. Add the house deletion to the promises
    deletePromises.push(House.findByIdAndDelete(id));

    // Execute all deletion operations
    await Promise.all(deletePromises);

    return NextResponse.json({
      success: true,
      message: "House and all associated data deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting house:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to delete house: " +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = params;
    const { status } = await req.json();

    if (!status || !["Active", "Pending"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const house = await House.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!house) {
      return NextResponse.json(
        { success: false, error: "House not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, ...house.toObject() });
  } catch (error) {
    console.error("Error updating house status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update house status" },
      { status: 500 }
    );
  }
}
