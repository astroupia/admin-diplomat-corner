import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  address?: string;
  imageUrl: string;
  role: "customer" | "admin";
  timestamp: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  clerkId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: String, required: false },
  imageUrl: { type: String, required: false },
  role: {
    type: String,
    required: true,
    enum: ["customer", "admin"],
  },
  timestamp: { type: String, required: true },
});

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
