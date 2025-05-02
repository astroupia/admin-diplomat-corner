import { NextResponse } from "next/server";
import Payment from "@/lib/models/payment.model";
import { connectToDatabase } from "@/lib/db-connect";

export async function GET() {
  try {
    await connectToDatabase();
    const payments = await Payment.find({}).lean();
    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
} 