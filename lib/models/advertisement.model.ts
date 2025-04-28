// lib/models/advertisement.model.ts
import mongoose, { Document, Schema } from "mongoose";
import { Url } from "node:url";

// Interface for the Mongoose document
export interface IAdvertisement extends Document {
  _id: string;
  title: string;
  description: string;
  targetAudience?: string;
  advertisementType: string;
  startTime?: string;
  endTime?: string;
  status: "Active" | "Inactive" | "Scheduled" | "Expired" | "Draft";
  priority: "High" | "Medium" | "Low";
  performanceMetrics?: string;
  hashtags?: string[];
  timestamp: string;
  link: string;
}

// Interface for the JSON response (plain object)
export interface AdvertisementResponse {
  _id: string;
  title: string;
  description: string;
  targetAudience?: string | null;
  advertisementType: string;
  startTime?: string | null;
  endTime?: string | null;
  status: "Active" | "Inactive" | "Scheduled" | "Expired" | "Draft";
  priority: "High" | "Medium" | "Low";
  performanceMetrics?: string | null;
  hashtags: string[];
  timestamp: string;
}

const AdvertisementSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  targetAudience: { type: String, required: false },
  advertisementType: { type: String, required: true },
  startTime: { type: String, required: false },
  endTime: { type: String, required: false },
  status: {
    type: String,
    required: true,
    enum: ["Active", "Inactive", "Scheduled", "Expired", "Draft"],
  },
  priority: { type: String, required: true, enum: ["High", "Medium", "Low"] },
  performanceMetrics: { type: String, required: false },
  hashtags: { type: [String], required: false },
  timestamp: { type: String, required: true },
  link: { type: String, required: true },
});

export default mongoose.models.Advertisement ||
  mongoose.model<IAdvertisement>("Advertisement", AdvertisementSchema);
