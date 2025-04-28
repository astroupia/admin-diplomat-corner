// app/api/houses/route.ts
import { NextResponse } from "next/server";

import House from "@/lib/models/house.model";
import { connectToDatabase } from "@/lib/db-connect";


export async function GET() {
  try {
    await connectToDatabase();
    const houses = await House.find({}).lean(); // Use .lean() for plain JS objects
    return NextResponse.json(houses);
  } catch (error) {
    console.error('Error fetching houses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch houses' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    console.log("POST /api/houses called with body:", body);
    const {
      name, userId, description, advertisementType, price, paymentMethod,
      bedroom, parkingSpace, bathroom, size, houseType, condition,
      maintenance, essentials, currency,
    } = body;

    if (!name || !userId || !description || !advertisementType || !price || !paymentMethod || !bedroom || !parkingSpace || !bathroom || !size || !houseType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newHouse = new House({
      name,
      userId,
      description,
      advertisementType,
      price,
      paymentMethod,
      bedroom,
      parkingSpace,
      bathroom,
      size,
      houseType,
      condition,
      maintenance,
      essentials,
      currency,
    });

    await newHouse.save();
    return NextResponse.json(newHouse, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/houses:", error);
    return NextResponse.json(
      { error: `Failed to create house: ${(error as Error).message || "Unknown server error"}` },
      { status: 500 }
    );
  }
}