import { NextResponse } from "next/server";
import House from "@/lib/models/house.model";
import { connectToDatabase } from "@/lib/db-connect";

export async function GET() {
  try {
    await connectToDatabase();
    
    // Get total houses count
    const totalHouses = await House.countDocuments();
    
    // Get houses for sale count
    const forSaleHouses = await House.countDocuments({ advertisementType: "Sale" });
    
    // Get houses for rent count
    const forRentHouses = await House.countDocuments({ advertisementType: "Rent" });
    
    // Get pending houses count
    const pendingHouses = await House.countDocuments({ status: "Pending" });
    
    return NextResponse.json({
      totalHouses,
      forSaleHouses,
      forRentHouses,
      pendingHouses
    });
  } catch (error) {
    console.error('Error fetching house statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch house statistics' },
      { status: 500 }
    );
  }
} 