// lib/models/advertisement.model.ts
import mongoose, { Document, Schema } from "mongoose";
import { Url } from "node:url";

// Interface for tracking clicks and views
interface ITracking {
  userId: string;
  timestamp: Date;
  device?: string;
  ipAddress?: string;
}

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
  imageUrl?: string;
  clicks: ITracking[];
  views: ITracking[];
  clickCount: number;
  viewCount: number;
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
  imageUrl?: string;
  clickCount: number;
  viewCount: number;
}

// Schema for tracking data
const TrackingSchema = new Schema(
  {
    userId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    device: { type: String },
    ipAddress: { type: String },
  },
  { _id: false }
);

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
  imageUrl: { type: String, required: false },
  // Add tracking for clicks and views
  clicks: { type: [TrackingSchema], default: [] },
  views: { type: [TrackingSchema], default: [] },
  // Add count fields for easier querying and analytics
  clickCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
});

// Methods to update click and view counts
AdvertisementSchema.methods.addClick = function (
  userId: string,
  device?: string,
  ipAddress?: string
) {
  this.clicks.push({ userId, timestamp: new Date(), device, ipAddress });
  this.clickCount = this.clicks.length;
  return this.save();
};

AdvertisementSchema.methods.addView = function (
  userId: string,
  device?: string,
  ipAddress?: string
) {
  this.views.push({ userId, timestamp: new Date(), device, ipAddress });
  this.viewCount = this.views.length;
  return this.save();
};

export default mongoose.models.Advertisement ||
  mongoose.model<IAdvertisement>("Advertisement", AdvertisementSchema);
