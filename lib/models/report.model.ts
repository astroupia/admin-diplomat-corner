import mongoose, { Schema, model, models, Document } from "mongoose";

export type ReportType =
  | "spam"
  | "harassment"
  | "inappropriate"
  | "misinformation"
  | "other";
export type ReportStatus = "pending" | "reviewed" | "resolved" | "rejected";
export type EntityType = "review" | "user" | "car" | "house";

export interface IReport extends Document {
  entityType: EntityType;
  entityId: string;
  reportType: ReportType;
  reportedBy: string;
  status: ReportStatus;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    entityType: {
      type: String,
      required: true,
      enum: ["review", "user", "car", "house"],
    },
    entityId: {
      type: String,
      required: true,
    },
    reportType: {
      type: String,
      required: true,
      enum: ["spam", "harassment", "inappropriate", "misinformation", "other"],
    },
    reportedBy: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "reviewed", "resolved", "rejected"],
      default: "pending",
    },
    description: {
      type: String,
    },
    adminNotes: {
      type: String,
    },
    reviewedBy: {
      type: String,
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Create a compound index to prevent duplicate reports from the same user for the same entity
ReportSchema.index({ entityId: 1, reportedBy: 1 }, { unique: true });

const Report = models.Report || model<IReport>("Report", ReportSchema);

export default Report;
