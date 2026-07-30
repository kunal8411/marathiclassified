import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const chatSchema = new Schema(
  {
    adId: { type: Schema.Types.ObjectId, ref: "Ad", required: true, index: true },
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    lastMessageAt: { type: Date, default: Date.now },
    lastMessagePreview: { type: String, default: "" },
    unread: { type: Map, of: Number, default: {} },
  },
  { timestamps: true },
);

chatSchema.index({ participants: 1 });
chatSchema.index({ lastMessageAt: -1 });
chatSchema.index({ adId: 1, participants: 1 });

export type ChatDocument = InferSchemaType<typeof chatSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ChatModel: Model<ChatDocument> =
  mongoose.models.Chat ?? mongoose.model<ChatDocument>("Chat", chatSchema);
