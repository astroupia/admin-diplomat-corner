import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = "diplomat-corner";

interface MongooseCache {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

const cached: MongooseCache = (
  global as unknown as { mongoose?: MongooseCache }
).mongoose || { conn: null, promise: null };

export const connectToDatabase = async () => {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) {
    console.error("MONGODB_URI is missing from environment variables");
    return;
  }
  try {
    cached.promise =
      cached.promise ||
      mongoose
        .connect(MONGODB_URI, {
          dbName: DB_NAME,
        })
        .then((m) => {
          return m.connection;
        });

    cached.conn = await cached.promise;
    console.log(`Connected to MongoDB database '${DB_NAME}' successfully`);
    return cached.conn;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
};
