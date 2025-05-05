import { connectToDatabase } from "@/lib/db-connect";
import Car from "@/lib/models/car.model";
import House from "@/lib/models/house.model";
import { NextRequest, NextResponse } from "next/server";

// Define search result interface
interface SearchResult {
  id: string;
  name: string;
  type: "car" | "house";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MongoDocument = { _id: any; [key: string]: unknown };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");
  console.log(query);
  const category = searchParams.get("category") || "all";

  if (!query || typeof query !== "string") {
    return NextResponse.json(
      { error: "Query parameter is required and must be a string" },
      { status: 400 }
    );
  }

  const validCategories = ["all", "cars", "houses"];
  if (!validCategories.includes(category)) {
    return NextResponse.json(
      { error: 'Invalid category. Use "all", "cars", or "houses"' },
      { status: 400 }
    );
  }

  await connectToDatabase();

  try {
    const results: SearchResult[] = [];

    // Query cars if category is 'cars' or 'all'
    if (category === "cars" || category === "all") {
      const cars = await Car.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" }, _id: 1, name: 1 }
      )
        .sort({ score: { $meta: "textScore" } })
        .limit(10)
        .lean();

      for (const doc of cars) {
        // Type safety check
        const car = doc as MongoDocument;
        if (car._id && typeof car.name === "string") {
          results.push({
            id: car._id.toString(),
            name: car.name,
            type: "car",
          });
        }
      }
    }

    // Query houses if category is 'houses' or 'all'
    if (category === "houses" || category === "all") {
      const houses = await House.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" }, _id: 1, name: 1 }
      )
        .sort({ score: { $meta: "textScore" } })
        .limit(10)
        .lean();

      for (const doc of houses) {
        // Type safety check
        const house = doc as MongoDocument;
        if (house._id && typeof house.name === "string") {
          results.push({
            id: house._id.toString(),
            name: house.name,
            type: "house",
          });
        }
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
