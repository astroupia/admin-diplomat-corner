import mongoose, { Schema } from "mongoose";

export interface IHouse {
  _id: string;
  name: string;
  userId: string;
  description: string;
  advertisementType: "Rent" | "Sale";
  price: number;
  paymentMethod?: "Monthly" | "Quarterly" | "Annual";
  bedroom?: number;
  parkingSpace?: number;
  bathroom?: number;
  size?: number;
  houseType: "House" | "Apartment" | "Guest House";
  condition?: string;
  maintenance?: string;
  essentials?: string[];
  currency: string;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
  paymentId: string;
  visibility: "Private" | "Public";
  visiblity?: "Private" | "Public";
  status: "Pending" | "Active";
}

const houseSchema = new Schema(
  {
    name: { type: String, required: true },
    userId: { type: String, required: true },
    description: { type: String, required: true },
    advertisementType: { type: String, required: true, enum: ["Rent", "Sale"] },
    price: { type: Number, required: true },
    paymentMethod: {
      type: String,
      required: false,
      enum: ["Monthly", "Quarterly", "Annual"],
      default: "Monthly",
    },
    bedroom: { type: Number, default: 0 },
    parkingSpace: { type: Number, default: 0 },
    bathroom: { type: Number, default: 0 },
    size: { type: Number, default: 0 },
    houseType: {
      type: String,
      required: true,
      enum: ["House", "Apartment", "Guest House"],
    },
    condition: { type: String, default: "" },
    maintenance: { type: String, default: "" },
    essentials: [{ type: String }],
    currency: { type: String, required: true, default: "USD" },
    imageUrl: { type: String },
    paymentId: {
      type: String,
      required: true,
    },
    visiblity: {
      type: String,
      required: true,
      enum: ["Private", "Public"],
      default: "Public",
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Active"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

houseSchema.index({ name: "text", description: "text" });

export default mongoose.models.House ||
  mongoose.model<IHouse>("House", houseSchema);
