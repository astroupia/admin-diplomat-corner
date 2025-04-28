import mongoose from "mongoose";

export type MessageSubject = 
  | "General Inquiry" 
  | "To promote Ads" 
  | "Want admin" 
  | "Technical support" 
  | "Customer Support";

export interface IMessage {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: MessageSubject;
  message: string;
  createdAt: Date;
}

const messageSchema = new mongoose.Schema<IMessage>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  subject: { 
    type: String, 
    required: true,
    enum: ["General Inquiry", "To promote Ads", "Want admin", "Technical support", "Customer Support"]
  },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);

export default Message; 