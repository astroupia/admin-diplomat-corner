import mongoose, { Schema, model, models, Document } from "mongoose";

export type RequestStatus = "pending" | "approved" | "rejected";

export interface IRequest extends Document {
  fromUserId: string;
  toUserId: string;
  productId: string;
  itemType: "house" | "car";
  message: string;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const RequestSchema = new Schema<IRequest>(
  {
    fromUserId: {
      type: String,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: String,
      ref: "User",
      required: true,
    },
    productId: {
      type: String,
      required: true,
    },
    itemType: {
      type: String,
      enum: ["house", "car"],
      required: true,
    },
    message: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export default models.Request || model<IRequest>("Request", RequestSchema);
