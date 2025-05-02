import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db-connect";
import Payment from "@/lib/models/payment.model";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  const id = params.id;

  try {
    await connectToDatabase();

    const payment = await Payment.findOne({ paymentId: id });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment" },
      { status: 500 }
    );
  }
}
