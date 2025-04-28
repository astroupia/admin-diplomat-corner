import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Review from "@/lib/models/review.model";
import Notification from "@/lib/models/notification.model";
import { connectToDatabase } from "@/lib/db-connect";
import { IReview } from "@/types/reviews";

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    // Remove the authentication check for public access to reviews
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const reviews = await Review.find({ productId })
      .populate("user", "firstName lastName")
      .sort({ createdAt: -1 });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { rating, comment, productId, targetUserId, productType } = body;

    if (!rating || !productId || !targetUserId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const review = new Review({
      userId,
      targetUserId,
      productId,
      rating,
      comment: comment || "",
      likes: [],
    });

    await review.save();

    // Create notification for the seller
    if (targetUserId) {
      try {
        await Notification.create({
          userId: targetUserId,
          title: "New Review Received",
          message: `You received a ${rating}-star review for your product.`,
          type: "message",
          category: productType === "car" ? "car" : "house",
          productType: productType === "car" ? "Car" : "House",
          link: `/${productType}/${productId}`,
        });
      } catch (notificationError) {
        console.error("Error creating seller notification:", notificationError);
      }
    }

    // Create notification for the reviewer
    try {
      await Notification.create({
        userId: userId,
        title: "Review Submitted",
        message: `Your review has been submitted successfully.`,
        type: "message",
        category: productType === "car" ? "car" : "house",
        productType: productType === "car" ? "Car" : "House",
        link: `/${productType}/${productId}`,
      });
    } catch (notificationError) {
      console.error("Error creating user notification:", notificationError);
    }

    const populatedReview = await Review.findById(review._id).populate(
      "user",
      "firstName lastName"
    );

    return NextResponse.json(populatedReview);
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await connectToDatabase();

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get("reviewId");

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (review.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized to delete this review" },
        { status: 403 }
      );
    }

    await Review.findByIdAndDelete(reviewId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
